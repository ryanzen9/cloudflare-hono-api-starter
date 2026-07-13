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
- 公共请求辅助方法：`test/request.ts`
- 测试环境初始化：`test/setup.ts`

测试代码使用 `test/tsconfig.json` 进行类型检查。

## Unit 测试

不依赖 Cloudflare Binding 的路由可以直接通过 `app.request()` 测试。例如，健康检查和文档重定向不需要传入 Worker 环境：

```typescript
import { describe, expect, it } from "vitest";
import { createAppFromFactory } from "../../src/app";

describe("Hono app", () => {
  const app = createAppFromFactory();
  app.get("/", (c) => c.redirect("/docs"));
  app.get("/api/health", (c) => c.json({ message: "ok" }));

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

## App 工厂

`src/app.ts` 使用 Hono `createFactory()` 创建应用，调用工厂方法初始化 app 对象。

```typescript
// src/app.ts
export function createAppFromFactory(
  initApp?: (app: Hono<AppEnv>) => void,
): Hono<AppEnv> {
  return createFactory({
    initApp,
  }).createApp();
}

export function createOpenApiFromFactory(
  app: Hono<AppEnv>,
  options?: RouterOptions,
) {
  return fromHono(app, options);
}
```

两个工厂只负责应用初始化和 OpenAPI 适配，不会自动注册根路径、健康检查或业务端点。测试应根据验证范围注册所需路由，避免加载不相关接口。

需要验证生产应用配置、Binding 和上下文变量时，可以通过 `createAppFromFactory()` 创建应用，并在 `app.request()` 的第三个参数中传入测试 Binding。

```typescript
const app = createAppFromFactory((app) => {
  app.use("/api/*", JWTAuthMiddleware({ ignorePath: ["/api/login"] }));
});

app.get("/api/protected", (c) =>
  c.json({ ok: true, jwtPayload: c.get("jwtPayload") }),
);
app.get("/api/login", (c) => c.json({ ignored: true }));
app.get("/api/login/extra", (c) => c.json({ ignored: false }));
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

expect((await app.request("/api/login")).status).toBe(200);
expect((await app.request("/api/login/extra")).status).toBe(401);
```

## D1 集成

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
- `requestWithEnv()`：直接调用生产 Hono 应用的 `request()`，并传入 `DB`、`JWT_SECRET`
- `login()`：使用测试账号登录并返回登录响应
- `jsonHeaders`：通用 JSON 请求头

普通请求通过合法 URL 构造 `Request`，再交给 Worker 默认导出处理：

```typescript
export const request = (path: string, init?: RequestInit) =>
  exports.default.fetch(new Request(`https://example.com${path}`, init));
```

`requestWithEnv()` 复用 `src/index.ts` 默认导出的生产 Hono 应用，因此测试和 Worker 入口使用同一套路由声明；它不会调用 Worker 默认导出的 `fetch()`：

```typescript
import app from "../src";

export const requestWithEnv = (path: string, init?: RequestInit) =>
  app.request(path, init, {
    DB: env.DB,
    JWT_SECRET: env.JWT_SECRET,
  });
```

新增或调整 API 路由时，只需维护 `src/index.ts` 中的端点声明。需要验证完整 Worker 入口时使用 `request()`；只需要直接调用 Hono 应用并显式传入 Binding 时使用 `requestWithEnv()`。

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
