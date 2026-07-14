import type { Next } from "hono";
import { jwt } from "hono/jwt";
import { SignatureAlgorithm } from "hono/utils/jwt/jwa";
import { AppContext } from "../../../types";

// JWT
export const JWTAuthMiddleware = ({ alg = "HS256" }: { alg?: string } = {}) => {
  return async (c: AppContext, next: Next) => {
    const middleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: alg as SignatureAlgorithm
    });

    return middleware(c, next);
  };
};
