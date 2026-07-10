import { env, exports } from "cloudflare:workers";
import app from "../src";

export const request = (path: string, init?: RequestInit) =>
  // https://example.com 只是为了合法的 URL，实际请求会被 Cloudflare Workers 的 fetch 处理
  exports.default.fetch(new Request(`https://example.com${path}`, init));

export const requestWithEnv = (path: string, init?: RequestInit) =>
  app.request(path, init, {
    DB: env.DB
  });
