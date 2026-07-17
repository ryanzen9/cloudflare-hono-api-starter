import { githubAuth } from "@hono/oauth-providers/github";
import { Next } from "hono";
import { AppContext } from "../../../../types";

// Github OAuth
export const GithubAuthMiddlewares = (c: AppContext, next: Next) =>
  githubAuth({
    client_id: c.env.GITHUB_CLIENT_ID,
    client_secret: c.env.GITHUB_CLIENT_SECRET,
    scope: ["read:user", "user:email"],
    oauthApp: true
  })(c, next);

// Github OAuth Callback
export const GithubAuthCallback = (c: AppContext) => {
  const githubToken = c.get("token");
  const githubRefreshToken = c.get("refresh-token");
  const githubUser = c.get("user-github");
  const grantedScopes = c.get("granted-scopes");

  return {
    githubToken,
    githubRefreshToken,
    githubUser,
    grantedScopes
  };
};
