---
title: "测试"
date: 2026-07-10
author: "Ryan Zeng"
draft: false
---

测试使用 `Cloudflare Workers` 和 `Vitest`。详情请参阅 Hono [Testing 章节](https://hono.dev/docs/guides/testing) 和 Cloudflare Workers 文档中的 Vitest [集成部分](https://developers.cloudflare.com/workers/testing/vitest-integration/)。

## 测试用例的编写

统一在 `/test/` 目录下编写测试用例，测试用例文件名以 `.test.ts` 结尾。

## Unit 测试

对于 **没有使用到 Cloudflare Bindings 的 Unit 测试**：

`/test/unit/` 目录下的测试用例可以直接使用 `Vitest` 运行，使用 app.request() 方法来模拟请求。

```typescript
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

对于 **使用了 Cloudflare Bindings 的 Unit 测试**：

使用 `@cloudflare/vitest-pool-workers` 模拟 Cloudflare Workers Runtime 环境。

声明测试 Binding，在测试开始前，使用 `applyD1Migrations` 模拟迁移数据库。

```typescript
// test/setup.ts
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

编辑 Vitest 配置文件。

```typescript
// vite.config.ts
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

可以使用 `exports.default.fetch()`，会调用当前 Worker 的默认导出，也可以 `import env from "cloudflare:workers"` 来获取当前 Worker 的环境变量。再使用 `app.request(..., { env })` 来传入环境变量。

```typescript
const request = (path: string, init?: RequestInit) =>
  // https://example.com 只是为了合法的 URL，实际请求会被 Cloudflare Workers 的 fetch 处理
  exports.default.fetch(new Request(`https://example.com${path}`, init));

const requestWithEnv = (path: string, init?: RequestInit) =>
  app.request(path, init, {
    DB: env.DB,
  });

describe("User API", () => {
  it("creates, queries, updates, and deletes a user", async () => {
    const createResponse = await request("/api/users", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        name: "Test User",
        age: 30,
        email: "test-user@example.com",
      }),
    });

    expect(createResponse.status).toBe(201);
    const createdUser = (await createResponse.json()) as ApiSuccess<User>;

    const detailResponse = await requestWithEnv(
      `/api/users/${createdUser.data.id}`,
    );
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toEqual({
      success: true,
      data: createdUser.data,
    });
  });
});
```
