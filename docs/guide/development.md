# 本地开发

## 启动 API

```bash
bun run start
```

Wrangler 会启动本地 Workers 开发服务器。修改 `src/` 后会自动热重载；Swagger 页面刷新即可看到变更。

- API 与健康检查：`http://localhost:8787/health`
- Swagger UI：`http://localhost:8787/docs`（根路径 `/` 会重定向到此处）

## 生成 OpenAPI 文件

将当前路由的 OpenAPI 规格写出到 `docs/openapi.json`：

```bash
bun run docs
```

该文件可供外部工具消费；交互式试调仍以 Worker 上的 Swagger 为准。

## 数据库（D1）

1. 在 `src/db/schema.ts` 修改表结构。
2. 生成迁移：

   ```bash
   bun run db:generate
   ```

3. 应用到本地 D1：

   ```bash
   bun run db:deploy
   ```

4. 远程环境（需确认）：

   ```bash
   bun run db:deploy:remote
   ```

迁移文件位于 `drizzle/`，由 drizzle-kit 生成，请勿手写覆盖。

## 类型与质量检查

```bash
bun run typecheck
bun run lint
bun run format
bun run check
```

## 文档站开发

```bash
bun run docs:dev
```

文档源码在 `docs/` 下，配置在 `docs/.vitepress/config.ts`。
`docs/.agents/` 为内部 Agent 资料，不会出现在公开站点导航中。
