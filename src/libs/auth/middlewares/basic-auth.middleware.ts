import { basicAuth } from "hono/basic-auth";

// basicAuth
export const BasicAuthMiddleware = (username: string, password: string) => {
  return async (c: any, next: any) => {
    const middleware = basicAuth({
      username,
      password
    });
    return middleware(c, next);
  };
};
