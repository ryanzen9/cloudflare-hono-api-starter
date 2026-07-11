---
title: "测试"
date: 2026-07-11
author: "Ryan Zeng"
tags: []
categories: []
draft: false
---

# 测试

测试使用 Vitest 和 `@cloudflare/vitest-pool-workers`，在 Cloudflare Workers Runtime 中运行。详情请参阅 Hono 的 [Testing 章节](https://hono.dev/docs/guides/testing) 和 Cloudflare Workers 的 [Vitest 集成文档](https://developers.cloudflare.com/workers/testing/vitest-integration/)。

## 运行测试

运行完整测试套件：

```bash
bun run test
```

开发时监听文件变化：

```bash
bun run test:watch
```

请勿使用 `bun test`。该命令会调用 Bun 内置测试运行器，不会使用本项目的 Vitest 和 Workers Runtime 配置。

## 测试目录

所有测试统一存放在 `test/`，测试文件名以 `.test.ts` 结尾：

- 不依赖 Worker Binding 的 Hono 路由或纯逻辑测试：`test/unit/`
- 依赖 Worker Binding、D1 或完整 API 流程的测试：`test/integration/<resource>/`
- 类型安全的 Hono 测试应用工厂：`test/app.ts`
- 公共请求辅助方法：`test/request.ts`
- 测试环境初始化：`test/setup.ts`

测试代码使用 `test/tsconfig.json` 进行类型检查。

## Unit 测试

不依赖 Cloudflare Binding 的路由可以直接通过 `app.request()` 测试。例如，健康检查和文档重定向不需要传入 Worker 环境：

```typescript
import { describe, expect, it } from "vitest";
import app from "../../src";

describe("Hono app", () => {
  it("responds to the health endpoint without a Worker binding", async () => {
    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "ok" });
  });

  it("request base path redirects to the docs", async () => {
    const response = await app.request("/");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/docs");
  });
});
```

需要验证中间件 Binding 和上下文变量时，使用 `test/app.ts` 提供的 `createApp()` 创建带有 `AppEnv` 类型的独立 Hono 实例，并在 `app.request()` 的第三个参数中传入测试 Binding：

```typescript
// test/app.ts
import { Hono } from "hono";
import { AppEnv } from "../src/types";

export const createApp = () => new Hono<AppEnv>();
```

JWT 中间件单元测试通过该工厂注册待测试的中间件和临时路由。当前覆盖以下行为：

- 合法 JWT 可以正常放行
- 非法 Bearer token 返回 `401`
- 忽略路径仅进行精确匹配

```typescript
const app = createApp();
app.use("/api/*", JWTAuthMiddleware({ ignorePath: ["/api/login"] }));
app.get("/api/protected", (c) =>
  c.json({ ok: true, jwtPayload: c.get("jwtPayload") }),
);
const token = await sign({ sub: "1" }, JWT_SECRET, "HS256");

const response = await app.request(
  "/api/protected",
  { headers: { Authorization: `Bearer ${token}` } },
  {
    JWT_SECRET,
  } as Env,
);

expect(response.status).toBe(200);
expect(await response.json()).toMatchObject({
  ok: true,
  jwtPayload: { sub: "1" },
});
```

## Worker 和 D1 集成测试

`vitest.config.ts` 使用 `cloudflareTest()` 加载 `wrangler.jsonc`，并通过 `TEST_MIGRATIONS` 向隔离的测试数据库提供迁移文件：

```typescript
export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(migrationsPath),
        },
      },
    })),
  ],
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
});
```

`test/setup.ts` 在测试开始前将迁移应用到隔离的 D1 数据库：

```typescript
declare global {
  namespace Cloudflare {
    interface Env {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
});
```

不要使用本地开发 D1 数据库运行自动化测试。

## 请求辅助方法

`test/request.ts` 提供以下公共方法：

- `request()`：通过 `exports.default.fetch()` 请求完整 Worker，不自动添加认证信息
- `requestWithEnv()`：通过 `app.request()` 请求应用，并传入 `DB`、`JWT_SECRET`
- `login()`：使用测试账号登录并返回登录响应
- `jsonHeaders`：通用 JSON 请求头

普通请求通过合法 URL 构造 `Request`，再交给 Worker 默认导出处理：

```typescript
export const request = (path: string, init?: RequestInit) =>
  exports.default.fetch(new Request(`https://example.com${path}`, init));
```

## 集成测试

当前 User 和 Todo 集成测试会在测试组开始时调用 `login()`，取得 JWT 后为后续请求统一构造 `Authorization` 请求头：

```typescript
describe("User API", async () => {
  const loginResponse = await login();
  expect(loginResponse.status).toBe(201);

  const loginData: ApiSuccess<{ token: string }> = await loginResponse.json();
  expect(loginData.success).toBe(true);

  const headers = {
    ...jsonHeaders,
    Authorization: `Bearer ${loginData.data.token}`,
  };

  it("creates, queries, updates, and deletes a user", async () => {
    const createResponse = await request("/api/users", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Test User",
        age: 30,
        email: "test-user@example.com",
      }),
    });

    expect(createResponse.status).toBe(201);
  });
});
```

Todo 集成测试同样使用登录 JWT。查询当前用户的 Todo 时，请求当前路由 `/api/users/todos`，用户身份由 JWT 中的 `jwtPayload.data.userId` 提供，不再通过路径参数传递：

```typescript
const userTodosResponse = await request("/api/users/todos", {
  headers,
});

expect(userTodosResponse.status).toBe(200);
```
