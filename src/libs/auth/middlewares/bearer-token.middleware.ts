import { bearerAuth } from "hono/bearer-auth";

// Bearer Token
export const BearerTokenAuthMiddleware = (token: string) => {
  return async (c: any, next: any) => {
    const middleware = bearerAuth({
      token
    });
    return middleware(c, next);
  };
};
