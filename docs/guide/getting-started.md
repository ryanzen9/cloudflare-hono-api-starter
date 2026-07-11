# 快速开始

本项目是一个基于 **Cloudflare Workers**、**Hono** 与 **Chanfana** 的 OpenAPI 3.1 API 脚手架。

## 前置条件

- [Bun](https://bun.sh/)（版本见根目录 `package.json` 的 `packageManager` 字段）
- Node.js（Wrangler / Chanfana 本地工具链需要）
- Cloudflare 账号（部署时需要）

## 安装

```bash
bun install --frozen-lockfile
```

## 本地启动 API

```bash
bun run start
```

默认在 `http://localhost:8787` 启动。浏览器打开根路径会重定向到 Swagger 文档：`http://localhost:8787/docs`。

## 本地启动文档站

```bash
bun run docs:dev
```

默认在 VitePress 开发服务器查看本站（通常为 `http://localhost:5173`）。

## 部署 API

```bash
bun run login
bun run deploy
```

更多细节见 [部署](./deployment)。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `bun run start` | 本地启动 Workers API |
| `bun run deploy` | 部署 API 到 Cloudflare Workers |
| `bun run test` | 运行 Vitest 测试 |
| `bun run docs` | 从代码生成 `docs/openapi.json` |
| `bun run docs:dev` | 本地预览文档站 |
| `bun run docs:build` | 构建静态文档 |
| `bun run docs:preview` | 预览构建后的文档站 |
| `bun run db:generate` | 用 drizzle-kit 生成迁移 |
| `bun run db:deploy` | 将迁移应用到本地 D1 |
