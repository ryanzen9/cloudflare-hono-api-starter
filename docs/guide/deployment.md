# 部署

## 部署 API（Cloudflare Workers）

1. 登录 Cloudflare：

   ```bash
   bun run login
   ```

2. 确认 `wrangler.jsonc` 中的 Worker 名称、D1 绑定与 `database_id` 正确。

3. 如有需要，先将迁移应用到远程 D1：

   ```bash
   bun run db:deploy:remote
   ```

4. 部署：

   ```bash
   bun run deploy
   ```

部署后可通过 Workers 域名或自定义域名访问。根路径仍会重定向到 Swagger：`/docs`。

## 部署文档站

文档站与 API 解耦：API 继续走 Workers；VitePress 构建产物部署到 Cloudflare Pages。

### 本地构建

```bash
bun run docs:build
```

产物目录：`docs/.vitepress/dist`。

### 使用 Wrangler 部署 Pages

```bash
bunx wrangler pages deploy docs/.vitepress/dist --project-name=<your-docs-project>
```

使用在 Cloudflare Dashboard 创建对应的 Pages 项目。

使用 Cloudflare + Github Actions 集成。（可选）
