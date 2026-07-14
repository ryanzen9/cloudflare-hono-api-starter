<h1 align="center">
Cloudflare Hono API Starter
</h1>

<p align="center">
  <strong>面向 Cloudflare Workers 与 Hono 的 API 脚手架</strong>
</p>

<p align="center">
  <a href="https://github.com/ryanzen9/cloudflare-hono-api-starter">
    <img alt="Package version" src="https://img.shields.io/github/package-json/v/ryanzen9/cloudflare-hono-api-starter?style=flat-square&label=version&color=3178c6">
  </a>
  <a href="https://github.com/ryanzen9/cloudflare-hono-api-starter/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/ryanzen9/cloudflare-hono-api-starter?style=flat-square&logo=github">
  </a>
  <a href="https://github.com/ryanzen9/cloudflare-hono-api-starter/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/ryanzen9/cloudflare-hono-api-starter?style=flat-square&logo=github">
  </a>
  <a href="https://github.com/ryanzen9/cloudflare-hono-api-starter/commits">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ryanzen9/cloudflare-hono-api-starter?style=flat-square&logo=github">
  </a>
</p>

<p align="center">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white">
  <img alt="TypeScript 7" src="https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Hono 4" src="https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square&logo=hono&logoColor=white">
  <img alt="Bun 1.3.13" src="https://img.shields.io/badge/Bun-1.3.13-000000?style=flat-square&logo=bun&logoColor=white">
  <img alt="OpenAPI 3.1" src="https://img.shields.io/badge/OpenAPI-3.1-6BA539?style=flat-square&logo=openapiinitiative&logoColor=white">
  <img alt="Drizzle ORM" src="https://img.shields.io/badge/Drizzle%20ORM-0.45.2-C5F74F?logo=drizzle&logoColor=000000)](https://orm.drizzle.team/">
</p>

<p align="center">
  <a href="#特性">特性</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#测试">测试</a> ·
  <a href="#openapi-与文档">文档</a> ·
  <a href="#部署">部署</a>
</p>

---

本项目集成 Hono、Chanfana OpenAPI、Drizzle ORM、Cloudflare D1、Vitest Workers 测试与 VitePress 文档站。

项目提供 Users 与 Todos 示例资源，用于展示从路由、请求校验、OpenAPI 描述、数据访问、统一响应与异常处理，到 D1 迁移、测试和部署的完整开发路径。

## 特性

- 基于 Hono 构建 Cloudflare Workers API。
- 使用 Chanfana 从端点 Schema 生成 OpenAPI 3.1 和 Swagger UI。
- 使用 Drizzle ORM 管理 D1 Schema、查询与迁移。
- 使用 Zod、`drizzle-zod` 和 `@hono/zod-openapi` 统一数据校验与接口描述。
- 使用 Vitest 与 `@cloudflare/vitest-pool-workers` 运行 Worker、D1 和中间件测试。
- 使用 Oxlint、Oxfmt 和 TypeScript 进行代码质量检查。
- 同时提供运行时 Swagger UI、OpenAPI JSON 和独立的 VitePress 中文文档站。

## 技术栈

| 层级     | 技术                                      |
| -------- | ----------------------------------------- |
| 运行时   | Cloudflare Workers                        |
| 语言     | TypeScript 7                              |
| Web 框架 | Hono                                      |
| OpenAPI  | Chanfana、`@hono/zod-openapi`             |
| 数据校验 | Zod、`drizzle-zod`                        |
| ORM      | Drizzle ORM                               |
| 数据库   | Cloudflare D1（SQLite）                   |
| 测试     | Vitest、`@cloudflare/vitest-pool-workers` |
| 文档站   | VitePress                                 |
| 包管理   | Bun 1.3.13                                |
| 代码质量 | TypeScript、Oxlint、Oxfmt                 |

## 快速开始

### 1. 安装依赖

```bash
bun install --frozen-lockfile
```

项目只使用 Bun 管理依赖，请保留 `bun.lock`，不要生成 npm、Yarn 或 pnpm 锁文件。

### 2. 配置本地 Secret

在项目根目录创建不会提交到 Git 的 `.dev.vars`：

```dotenv
JWT_SECRET=replace_with_a_long_random_secret
```

`JWT_SECRET` 用于签发和校验 HS256 JWT。`DB` 不需要写入 `.dev.vars`，它由 `wrangler.jsonc` 中的 D1 Binding 注入。

配置发生变化后，可以重新生成 Worker 类型：

```bash
bun run cf-typegen
```

### 3. 初始化本地 D1

```bash
bun run db:deploy
```

该命令将 `drizzle/` 中的迁移应用到 Wrangler 管理的本地 D1 数据库。修改表结构时，应先编辑 `src/db/schema.ts`，再使用 `bun run db:generate` 生成迁移。

### 4. 启动 API

```bash
bun run start
```

默认地址：

- Swagger UI：<http://localhost:8787/docs>
- 健康检查：<http://localhost:8787/api/health>
- 根路径：<http://localhost:8787/>，会重定向到 `/docs`

## 数据库与迁移

数据库变更流程：

1. 在 `src/db/schema.ts` 修改表结构。
2. 运行 `bun run db:generate`，由 drizzle-kit 生成迁移。
3. 运行 `bun run db:deploy`，应用到本地 D1。
4. 确认远程资源配置后，运行 `bun run db:deploy:remote`。

迁移文件和快照保存在 `drizzle/`。不要手写替代 drizzle-kit 生成的迁移。

## 测试

```bash
bun run test
```

测试通过 `@cloudflare/vitest-pool-workers` 在 Workers Runtime 中运行：

- `test/unit/`：不依赖 D1 的 Hono 路由与 JWT 中间件测试。
- `test/integration/users/`：User 创建、查询、更新和删除流程。
- `test/integration/todos/`：User 与 Todo 的关联 API 流程。
- `test/setup.ts`：在隔离的测试 D1 中应用 `TEST_MIGRATIONS`。

自动化测试不会使用本地开发数据库。D1 集成测试通过 `exports.default.fetch()` 调用完整 Worker；不需要 Binding 的单元测试可以直接使用 `app.request()`。

监听模式：

```bash
bun run test:watch
```

不要使用 `bun test`，它会调用 Bun 内置测试运行器，而不是本项目配置的 Vitest Workers 测试池。

## OpenAPI 与文档

Swagger 默认后缀为 `/docs`。访问 `http://localhost:8787/docs` 可以查看 Swagger UI。

### Swagger 与 OpenAPI JSON

本地运行 Worker 后，通过 `/docs` 使用 Swagger UI。要从当前代码导出 OpenAPI 3.1 JSON：

```bash
bun run docs
```

输出位置为 `docs/openapi.json`。

### VitePress 文档站

`docs/` 下的中文文档站与 Worker 的 `/docs` Swagger UI 相互独立：

```bash
bun run docs:dev
bun run docs:build
bun run docs:preview
```

静态构建产物位于 `docs/.vitepress/dist`。详细内容参见：

- [快速开始](docs/guide/getting-started.md)
- [项目结构](docs/guide/project-structure.md)
- [本地开发](docs/guide/development.md)
- [认证](docs/guide/authentication.md)
- [测试](docs/guide/testing.md)
- [环境变量](docs/guide/environment-variable.md)
- [异常处理](docs/guide/error-handling.md)
- [部署](docs/guide/deployment.md)

## 常用命令

| 命令                       | 说明                               |
| -------------------------- | ---------------------------------- |
| `bun run start`            | 启动本地 Workers API               |
| `bun run deploy`           | 部署 Worker                        |
| `bun run docs`             | 生成 `docs/openapi.json`           |
| `bun run docs:dev`         | 启动 VitePress 开发服务器          |
| `bun run docs:build`       | 构建 VitePress 静态站点            |
| `bun run docs:preview`     | 预览 VitePress 构建产物            |
| `bun run db:generate`      | 生成 Drizzle 迁移                  |
| `bun run db:deploy`        | 应用本地 D1 迁移                   |
| `bun run db:deploy:remote` | 应用远程 D1 迁移                   |
| `bun run test`             | 运行完整测试                       |
| `bun run test:watch`       | 监听模式运行测试                   |
| `bun run typecheck`        | 检查应用与测试类型                 |
| `bun run lint`             | 检查 `src/` 代码                   |
| `bun run format`           | 使用 Oxfmt 格式化项目              |
| `bun run check`            | 检查格式、Lint 和类型              |
| `bun run cf-typegen`       | 根据 Wrangler 配置生成 Worker 类型 |

## 部署

1. 登录 Cloudflare：

   ```bash
   bun run login
   ```

2. 在 `wrangler.jsonc` 中确认 Worker 名称、D1 `database_name` 与 `database_id`。
3. 在 Cloudflare 中配置 `JWT_SECRET`。
4. 如有数据库变更，确认后应用远程迁移：

   ```bash
   bun run db:deploy:remote
   ```

5. 部署 Worker：

   ```bash
   bun run deploy
   ```

部署后，根路径仍会重定向到 `/docs`。VitePress 文档站是独立静态站点，推荐将 `docs/.vitepress/dist` 部署到 Cloudflare Pages，具体步骤见[部署指南](docs/guide/deployment.md)。

如果这个项目对你有帮助，欢迎点亮一个 [Star](https://github.com/ryanzen9/cloudflare-hono-api-starter/stargazers)。
