import { fromHono } from "chanfana";
import { env } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppFromFactory } from "../../../src/app";
import { config } from "../../../src/config";
import { OAuthTransactions } from "../../../src/db/zod";
import {
  GithubAuthLogin,
  GithubHonoAuthLogin
} from "../../../src/endpoints/auth/github-login";
import { jwtVerify } from "../../../src/libs/auth/jwt";
import { GithubAuthMiddlewares } from "../../../src/libs/auth/oauth/github";
import { createCodeChallenge } from "../../../src/libs/auth/oauth/github/crypto";
import { genInitUser, registerUser } from "../../request";

afterEach(() => {
  vi.restoreAllMocks();
});

const authUrl1 = new URL(`${env.API_ORIGIN}/auth/github/login`);
const authUrl2 = new URL(`${env.API_ORIGIN}/oauth/github/login`);

const request = async (path: string, options?: RequestInit) => {
  const openapi = fromHono(createAppFromFactory(config));

  openapi.get(authUrl1.pathname, GithubAuthLogin);

  openapi.use(authUrl2.pathname, GithubAuthMiddlewares);
  openapi.get(authUrl2.pathname, GithubHonoAuthLogin);

  return openapi.request(path, options, {
    DB: env.DB,
    JWT_SECRET: env.JWT_SECRET,
    API_ORIGIN: env.API_ORIGIN,
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
    KV: env.KV
  });
};

const startGithubOAuth = async () => {
  const response = await request("/auth/github/login", {
    redirect: "manual"
  });

  // Hono c.redirect() 默认返回 302
  expect(response.status).toBe(302);

  const location = response.headers.get("location");
  expect(location).not.toBeNull();

  const authorizeUrl = new URL(location!);

  expect(authorizeUrl.origin).toBe("https://github.com");
  expect(authorizeUrl.pathname).toBe("/login/oauth/authorize");
  expect(authorizeUrl.searchParams.get("client_id")).toBe(env.GITHUB_CLIENT_ID);
  expect(authorizeUrl.searchParams.get("redirect_uri")).toBe(
    `${env.API_ORIGIN}/auth/github/login`
  );
  expect(authorizeUrl.searchParams.get("scope")).toBe("read:user user:email");
  expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe("S256");

  const state = authorizeUrl.searchParams.get("state");
  expect(state).not.toBeNull();

  const transaction = await env.KV.get<OAuthTransactions>(
    `oauth_transactions:${state}`,
    "json"
  );

  expect(transaction).not.toBeNull();
  expect(transaction).toMatchObject({
    provider: "github",
    intent: "login",
    stateHash: state
  });

  expect(authorizeUrl.searchParams.get("code_challenge")).toBe(
    await createCodeChallenge(transaction!.codeVerifier)
  );

  return {
    state: state!,
    transaction: transaction!
  };
};

interface OutboundRequestSnapshot {
  method: string;
  url: string;
  body: string | null;
  authorization: string | null;
}

const mockGithub = () => {
  const requests: OutboundRequestSnapshot[] = [];

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);

    // 必须在当前请求上下文中读取流。
    const body = request.body ? await request.text() : null;

    // 只保存可以安全跨上下文访问的普通值。
    requests.push({
      method: request.method,
      url: request.url,
      body,
      authorization: request.headers.get("Authorization")
    });

    if (
      request.method === "POST" &&
      url.origin === "https://github.com" &&
      url.pathname === "/login/oauth/access_token"
    ) {
      return Response.json({
        access_token: "github-test-token",
        token_type: "bearer",
        scope: "read:user,user:email"
      });
    }

    if (
      request.method === "GET" &&
      url.origin === "https://api.github.com" &&
      url.pathname === "/user"
    ) {
      return Response.json({
        id: 177537284,
        login: "test-github-user",
        name: "GitHub Test User",
        email: null,
        avatar_url: "https://avatars.example.com/test.png"
      });
    }

    if (
      request.method === "GET" &&
      url.origin === "https://api.github.com" &&
      url.pathname === "/user/emails"
    ) {
      return Response.json([
        {
          email: "unverified@example.com",
          primary: false,
          verified: false,
          visibility: null
        },
        {
          email: "github-user@example.com",
          primary: true,
          verified: true,
          visibility: "private"
        }
      ]);
    }

    throw new Error(
      `Unexpected outbound request: ${request.method} ${request.url}`
    );
  });

  return requests;
};

describe("GitHub OAuth API", () => {
  it("creates an OAuth transaction and redirects to GitHub", async () => {
    await startGithubOAuth();
  });

  it("completes callback using mocked GitHub responses", async () => {
    // 先创建一个普通用户，使 users.id 与 oauth_accounts.id 不再碰巧相等。
    const registerResponse = await registerUser(genInitUser());
    expect(registerResponse.status).toBe(201);

    const { state, transaction } = await startGithubOAuth();
    const outboundRequests = mockGithub();

    const callbackQuery = new URLSearchParams({
      code: "github-test-code",
      state
    });

    const response = await request(
      `/auth/github/login?${callbackQuery.toString()}`,
      { redirect: "manual" }
    );

    expect(response.status).toBe(302);
    const cookies = response.headers.getSetCookie() || [];
    const authCookie = cookies.find((cookie) => cookie.startsWith("auth="));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain("auth=");

    const autoStr = authCookie!.split("=")[1]?.split(";")[0];
    const auth = JSON.parse(decodeURIComponent(autoStr!));

    const token = auth?.token;
    expect(token).toBeDefined();
    expect(auth?.userId).toBeDefined();

    const claims = await jwtVerify(token, env.JWT_SECRET);
    expect(claims.data.username).toBe("GitHub Test User");
    expect(claims.data.userId).toBe(auth?.userId);

    const tokenRequest = outboundRequests.find(
      (request) => new URL(request.url).pathname === "/login/oauth/access_token"
    );

    expect(tokenRequest).toBeDefined();
    expect(tokenRequest!.method).toBe("POST");

    const tokenForm = new URLSearchParams(tokenRequest!.body ?? "");
    expect(tokenForm.get("code")).toBe("github-test-code");
    expect(tokenForm.get("code_verifier")).toBe(transaction.codeVerifier);
    expect(tokenForm.get("redirect_uri")).toBe(transaction.redirectTo);
    expect(tokenForm.get("client_id")).toBe(env.GITHUB_CLIENT_ID);
    expect(tokenForm.get("client_secret")).toBe(env.GITHUB_CLIENT_SECRET);

    const oauthAccount = await env.DB.prepare(
      `SELECT
         "userId",
         "providerSubject",
         "providerLogin",
         "providerEmail"
       FROM "oauth_accounts_table"
       WHERE "provider" = ? AND "providerSubject" = ?`
    )
      .bind("github", "177537284")
      .first<{
        userId: number;
        providerSubject: string;
        providerLogin: string;
        providerEmail: string;
      }>();

    expect(oauthAccount).toMatchObject({
      providerSubject: "177537284",
      providerLogin: "test-github-user",
      providerEmail: "github-user@example.com"
    });

    expect(auth?.userId).toBe(oauthAccount!.userId);
  });

  it("rejects an unknown state without calling GitHub", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await request(
      "/auth/github/login?code=test-code&state=unknown-state"
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain(`error=`);

    const message = response.headers.get("location")?.split("error=")[1];
    expect(message).toContain("Invalid%20or%20expired%20OAuth%20state");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
