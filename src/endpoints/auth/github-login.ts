import { OpenAPIRoute } from "chanfana";
import {
  exchangeOAuthTransactions,
  getOAuthTransactions,
  setOAuthTransactions
} from "../../db/cache";
import { getDB } from "../../db/dao";
import { AuthQueries, UserQueries } from "../../db/queries";
import { OAuthTransactions } from "../../db/zod";
import { JwtPayload, jwtSign } from "../../libs/auth/jwt";
import { GithubAuthCallback } from "../../libs/auth/oauth/github";
import {
  createCodeChallenge,
  createRandomValue
} from "../../libs/auth/oauth/github/crypto";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { ApiRes, RequestQuery, ResponseObjectBody } from "../rest";
import { githubLoginDto, loginResDto } from "./loginDto";

const loginWithGithub = async (
  db: any,
  githubUser: {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
  },
  tokenSecret: string
) => {
  const auth = await AuthQueries.loginWithGithub(db, {
    ...githubUser
  });

  const user = await UserQueries.findById(db, auth?.userId || 0);

  if (!auth) {
    Assert.throwBadRequest("Failed to login or register user with GitHub");
  }

  if (!user) {
    Assert.throwBadRequest("User not found after GitHub login");
  }

  const payload: JwtPayload = {
    sub: auth.id.toString(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    data: {
      userId: user.id,
      username: user.name
    }
  };

  const token = await jwtSign(payload, tokenSecret);

  const result = loginResDto.parse({
    token,
    userId: user.id,
    username: user.name
  });
  return result;
};

export class GithubAuthLogin extends OpenAPIRoute {
  schema = {
    tags: ["Auth"],
    summary: "Login a user With Github OAuth",
    request: RequestQuery(githubLoginDto),
    responses: {
      302: {
        description: "Redirect to Github OAuth login page"
      },
      ...ResponseObjectBody(loginResDto)
    }
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    if (data.query.code && data.query.state) {
      // 回调处理
      return this.callback(c, data.query.code, data.query.state);
    }

    const state = createRandomValue();
    const codeVerifier = createRandomValue(48);
    const codeChallenge = await createCodeChallenge(codeVerifier);

    const oauthTransaction: OAuthTransactions = {
      stateHash: state,
      provider: "github",
      codeVerifier: codeVerifier,
      intent: "login",
      initiatorUserId: 0,
      redirectTo: `${c.env.API_ORIGIN}/auth/github/login`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setOAuthTransactions(c.env, state, oauthTransaction);
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", c.env.GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", oauthTransaction.redirectTo);
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    return c.redirect(url.toString());
  }

  async callback(c: AppContext, code: string, state: string) {
    const db = getDB(c.env);

    if (!code || !state) {
      Assert.throwBadRequest(
        "Missing required query parameters: code and state"
      );
    }

    const transaction = await getOAuthTransactions(c.env, state);

    if (!transaction) {
      Assert.throwBadRequest("Invalid or expired OAuth state");
    }

    if (new Date(transaction.expiresAt) < new Date()) {
      Assert.throwBadRequest("OAuth transaction has expired");
    }

    await exchangeOAuthTransactions(c.env, state, code);

    // 用授权码换取 Github access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: c.env.GITHUB_CLIENT_ID,
          client_secret: c.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: transaction.redirectTo,
          code_verifier: transaction.codeVerifier
        })
      }
    );

    if (!tokenResponse.ok) {
      Assert.throwBadRequest("Failed to exchange code for access token");
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      token_type: string;
      scope: string;
    };
    if (!tokenData.access_token) {
      Assert.throwBadRequest("No access token received from GitHub");
    }

    // 获取授权码后获取用户信息
    const githubAccessToken = tokenData.access_token;
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "cloudflare-hono-api-starter",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!userResponse.ok) {
      Assert.throwBadRequest("Failed to fetch user information from GitHub");
    }

    const githubUser = await userResponse.json<any>();

    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "cloudflare-hono-api-starter",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!emailsResponse.ok) {
      Assert.throwBadRequest("Failed to fetch user emails from GitHub");
    }
    const emails = (await emailsResponse.json()) as {
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string | null;
    }[];
    const email =
      emails.find((email) => email.primary && email.verified)?.email || null;

    const result = await loginWithGithub(
      db,
      {
        id: githubUser.id,
        login: githubUser.login,
        name: githubUser.name,
        email: email,
        avatar_url: githubUser.avatar_url
      },
      c.env.JWT_SECRET
    );

    return c.json(ApiRes.success(result), 201);
  }
}

export class GithubHonoAuthLogin extends OpenAPIRoute {
  schema = {
    tags: ["Auth"],
    summary: "Login a user With Github OAuth using Hono Middleware",
    responses: {
      302: {
        description: "Redirect to Github OAuth login page"
      },
      ...ResponseObjectBody(loginResDto)
    }
  };

  async handle(c: AppContext) {
    const data = GithubAuthCallback(c);

    const db = getDB(c.env);

    const githubUser = data.githubUser;

    if (!githubUser) {
      Assert.throwBadRequest("GitHub user information is missing");
    }

    const result = await loginWithGithub(
      db,
      {
        id: githubUser.id ?? 0,
        login: githubUser.login ?? "",
        name: githubUser.name ?? "",
        email: githubUser.email ?? "",
        avatar_url: githubUser.avatar_url ?? ""
      },
      c.env.JWT_SECRET
    );

    return c.json(ApiRes.success(result), 201);
  }
}
