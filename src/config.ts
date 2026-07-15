import type { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";
import { except } from "hono/combine";
import { logger } from "hono/logger";
import { JWTAuthMiddleware } from "./libs/auth/middlewares";
import { ErrorHandler } from "./libs/error";
import { AppEnv } from "./types";

export const config = (app: Hono<AppEnv>) => {
  // 日志
  app.use(logger());

  // 错误处理
  app.onError(ErrorHandler());

  // Agent 中间件
  app.use("*", agentsMiddleware());

  // 认证中间件
  //   app.use("/docs", BearerTokenAuthMiddleware());
  app.use(
    "/api/*",
    except(
      [
        "/api/health",
        "/api/login",
        "/api/register",
        "/api/download/:key",
        "/api/callback"
      ],
      JWTAuthMiddleware()
    )
  );
};
