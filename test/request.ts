import { env, exports } from "cloudflare:workers";
import app from "../src";
import { randomEmail, randomPassword, randomUsername } from "./utils";

export const jsonHeaders = { "content-type": "application/json" };

export const genInitUser = () => ({
  username: randomUsername(),
  password: randomPassword(),
  name: "Random User",
  age: 30,
  email: randomEmail()
});

export const request = (path: string, init?: RequestInit) =>
  // https://example.com 只是为了合法的 URL，实际请求会被 Cloudflare Workers 的 fetch 处理
  exports.default.fetch(new Request(`https://example.com${path}`, init));

export const requestWithEnv = (path: string, init?: RequestInit) =>
  app.request(path, init, {
    DB: env.DB,
    JWT_SECRET: env.JWT_SECRET
  });

export const registerUser = async (user: {
  username: string;
  password: string;
  name: string;
  age: number;
  email: string;
}) =>
  request("/api/register", {
    method: "POST",
    body: JSON.stringify(user),
    headers: jsonHeaders
  });

export const login = async (user: { username: string; password: string }) =>
  request("/api/login", {
    method: "POST",
    body: JSON.stringify({
      username: user.username,
      password: user.password
    }),
    headers: jsonHeaders
  });
