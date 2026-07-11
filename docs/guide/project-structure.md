# 项目结构

```text
.
├── docs/                    # VitePress 文档与 OpenAPI 生成物
│   ├── .vitepress/          # 文档站配置与构建缓存
│   ├── .agents/             # Agent 内部资料（不进入公开站点）
│   ├── guide/               # 使用指南
│   ├── api/                 # API 说明
│   ├── openapi.json         # Chanfana 生成的 OpenAPI 文档
│   └── index.md             # 文档首页
├── drizzle/                 # D1 迁移文件
├── src/
│   ├── db/                  # Schema、查询与 Zod 定义
│   ├── endpoints/           # 按资源划分的 API 端点
│   ├── error-handler.ts
│   ├── errors.ts
│   ├── index.ts             # 路由入口（所有 API 在此声明）
│   └── types.ts
├── test/
│   ├── unit/                # 无 Binding 的单元测试
│   ├── integration/         # 依赖 Worker / D1 的集成测试
│   └── setup.ts
├── package.json
├── vitest.config.ts
└── wrangler.jsonc           # Workers / D1 配置
```

## 约定

- **路由**：在 `src/index.ts` 集中声明；`GET` 用于查询，`POST` 用于写操作。
- **Schema**：表结构定义在 `src/db/schema.ts`。
- **查询**：CRUD 集中在 `src/db/queries.ts`，按资源用静态类组织（如 `UserQueries`、`TodoQueries`）。
- **端点**：每个接口一个文件，放在 `src/endpoints/<resource>/`。
- **OpenAPI**：端点通过 Chanfana / `@hono/zod-openapi` 描述，运行时提供 Swagger；也可用 `bun run docs` 导出 JSON。

## 技术栈

| 层级     | 技术                                     |
| -------- | ---------------------------------------- |
| 类型安全 | TypeScript 7 + Zod                       |
| 运行时   | Cloudflare Workers                       |
| Web 框架 | Hono                                     |
| OpenAPI  | Chanfana、@hono/zod-openapi              |
| ORM      | Drizzle ORM                              |
| 数据库   | Cloudflare D1 (SQLite)                   |
| 测试     | Vitest + @cloudflare/vitest-pool-workers |
| 包管理   | Bun                                      |
| 文档站   | VitePress                                |
| 代码风格 | Oxlint + Oxfmt                           |
