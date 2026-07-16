import { OpenAPIRoute } from "chanfana";
import { setOAuthTransactions } from "../../db/cache";
import { OAuthTransactions } from "../../db/zod";
import {
  createCodeChallenge,
  createRandomValue
} from "../../libs/auth/oauth/github/crypto";
import { AppContext } from "../../types";

export class GithubLoginStart extends OpenAPIRoute {
  schema = {
    tags: ["Auth"],
    summary: "Login a user With Github OAuth",
    responses: {
      302: {
        description: "Redirect to Github OAuth login page"
      }
    }
  };

  async handle(c: AppContext) {
    const state = createRandomValue();
    const codeVerifier = createRandomValue(48);
    const codeChallenge = await createCodeChallenge(codeVerifier);

    const oauthTransaction: OAuthTransactions = {
      stateHash: state,
      provider: "github",
      codeVerifier: codeVerifier,
      intent: "login",
      initiatorUserId: 0,
      redirectTo: `${c.env.API_ORIGIN}/auth/github/login/callback`,
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
}
