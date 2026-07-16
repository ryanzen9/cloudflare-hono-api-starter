import {
  exchangeOAuthTransactions,
  getOAuthTransactions
} from "../../db/cache";
import { getDB } from "../../db/dao";
import { AuthQueries } from "../../db/queries";
import { JwtPayload, jwtSign } from "../../libs/auth/jwt";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { ApiRes } from "../rest";
import { loginResDto } from "./loginDto";

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
};

export const GithubLoginCallback = async (c: AppContext) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const db = getDB(c.env);

  if (!code || !state) {
    Assert.throwBadRequest("Missing required query parameters: code and state");
  }

  const transaction = await getOAuthTransactions(c.env, state);

  if (!transaction) {
    Assert.throwBadRequest("Invalid or expired OAuth state");
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

  const githubUser = await userResponse.json<GitHubUser>();

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

  const auth = await AuthQueries.loginWithGithub(db, {
    ...githubUser,
    email
  });

  if (!auth) {
    Assert.throwBadRequest("Failed to login or register user with GitHub");
  }

  const payload: JwtPayload = {
    sub: auth.id.toString(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    data: {
      userId: auth.id,
      username: githubUser.login
    }
  };

  const jwtSecret = c.env.JWT_SECRET;
  const token = await jwtSign(payload, jwtSecret);

  const result = loginResDto.parse({
    token,
    userId: auth.id,
    username: githubUser.login
  });

  return c.json(ApiRes.success(result), 201);
};
