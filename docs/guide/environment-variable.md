---
title: "环境变量"
date: 2026-07-11
author: "Ryan Zeng"
tags: []
categories: []
draft: false
---

# 环境变量

## 运行时

与传统 Node.js 应用不同，Cloudflare Workers 上的环境变量在运行时通过绑定（bindings）注入，而不是通过本地注入 `process.env` 访问。

由 Wrangler 读取 .dev.vars 或 .env，再通过 c.env 注入 Worker。[Cloudflare Workers 环境变量相关](https://developers.cloudflare.com/workers/local-development/environment-variables/?utm_source=chatgpt.com)

在 `wrangler.jsonc` 中配置需要的环境变量，并且生成对应的类型：

```diff
+  "secrets": {
+    "required": ["JWT_SECRET"]
+  },
```

```bash
bun run cf-typegen
```

创建 `.dev.vars` 文件，添加环境变量：

```bash
JWT_SECRET=your_jwt_secret
```

在代码中使用：

```ts
// 中间件
export const JWTAuthMiddleware = (alg = "HS256") => {
  return async (c: AppContext, next: any) => {
    const middleware = jwt({
      secret: c.env.JWT_SECRET,
      alg: alg as SignatureAlgorithm,
    });

    return middleware(c, next);
  };
};

// 请求中使用
async handle(c: AppContext) {
    const isDev = c.env.APP_ENV === "development";

    return c.json({ message: isDev ? "Development mode" : "Production mode" }, 200);
  }
```

最后在 Cloudflare Workers Dashboard 中配置环境变量，或者使用 Wrangler CLI 进行部署时传入。

运行后也可以看到使用到的资源以及变量：

```bash
 ⛅️ wrangler 4.103.0 (update available 4.110.0)
───────────────────────────────────────────────
Using secrets defined in .dev.vars
Your Worker has access to the following bindings:
Binding                                         Resource                  Mode
env.DB (drizzle_example)                        D1 Database               local
env.JWT_SECRET ("(hidden)")                     Environment Variable      local

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│  [b] open a browser [d] open devtools [e] open local explorer [t] start tunnel [c] clear console [x] to exit  │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
⎔ Starting local server...
[wrangler:info] Ready on http://localhost:8787
```
