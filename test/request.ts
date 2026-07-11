import { env, exports } from "cloudflare:workers";
import app from "../src";

export const jsonHeaders = { "content-type": "application/json" };

export const request = (path: string, init?: RequestInit) =>
  // https://example.com 只是为了合法的 URL，实际请求会被 Cloudflare Workers 的 fetch 处理
  exports.default.fetch(new Request(`https://example.com${path}`, init));

export const requestWithEnv = (path: string, init?: RequestInit) =>
  app.request(path, init, {
    DB: env.DB,
    JWT_SECRET: env.JWT_SECRET
  });

export const login = async () =>
  request("/api/login", {
    method: "POST",
    body: JSON.stringify({
      username: "admin",
      password: "password"
    }),
    headers: jsonHeaders
  });
