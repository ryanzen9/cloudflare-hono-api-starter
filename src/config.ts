import type { Hono } from "hono";
import { logger } from "hono/logger";
import { ErrorHandler } from "./error-handler";
import { JWTAuthMiddleware } from "./libs/auth";
import { AppEnv } from "./types";

export const config = (app: Hono<AppEnv>) => {
  // 日志
  app.use(logger());

  // 错误处理
  app.onError(ErrorHandler());

  // 认证中间件
  //   app.use("/docs", BearerTokenAuthMiddleware());
  app.use(
    "/api/*",
    JWTAuthMiddleware({
      ignorePath: ["/api/health", "/api/login"]
    })
  );
};
