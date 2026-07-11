import type { Next } from "hono";
import { jwt } from "hono/jwt";
import { SignatureAlgorithm } from "hono/utils/jwt/jwa";
import { AppContext } from "../../../types";

// JWT
export const JWTAuthMiddleware = ({
  ignorePath = [],
  alg = "HS256"
}: { ignorePath?: string[]; alg?: string } = {}) => {
  return async (c: AppContext, next: Next) => {
    if (ignorePath.includes(c.req.path)) {
      return next();
    }

    const middleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: alg as SignatureAlgorithm
    });

    return middleware(c, next);
  };
};
