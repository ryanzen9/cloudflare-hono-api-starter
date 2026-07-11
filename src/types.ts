import type { Context } from "hono";
import type { JwtPayload } from "./libs/auth/jwt";

export type AppEnv = {
  Bindings: Env;
  Variables: { jwtPayload: JwtPayload };
};

export type AppContext = Context<AppEnv>;
