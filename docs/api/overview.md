# API 参考概览

**权威的交互式文档是 [Swagger UI](https://cloudflare-hono-api-starter.rubyceng0326.workers.dev/docs)**。

## 本地试调

```bash
bun run start
```

然后打开：

- Swagger UI：`http://localhost:8787/docs`
- 健康检查：`http://localhost:8787/health`

根路径 `/` 会 302 重定向到 `/docs`。

## 导出 OpenAPI JSON

```bash
bun run docs
```

输出文件：`docs/openapi.json`（OpenAPI 3.1）。可用于导入 Postman、生成客户端、LLM 生成等。

## 端点约定

- 路由在 `src/index.ts` 集中注册。
- 查询使用 `GET`，写入使用 `POST`。
- 当前示例资源包括：
  - Users：`/api/users`、`/api/users/:id` 等
  - Todos：`/api/todos`、`/api/todos/:id` 等
  - 用户下的 Todos：`/api/users/:userId/todos`

完整路径、请求体与响应 schema 以 Swagger / `openapi.json` 为准。

## 示例 API 分组

### 用户

- `GET /api/users`：获取用户列表
- `POST /api/users`：创建新用户
- `GET /api/users/:id`：获取指定用户
- `POST /api/users/:id`：更新指定用户
- `POST /api/users/:id/delete`：删除指定用户

### 待办事项

- `GET /api/todos`：获取待办事项列表
- `POST /api/todos`：创建新待办事项
- `GET /api/todos/:id`：获取指定待办事项
- `POST /api/todos/:id`：更新指定待办事项
- `POST /api/todos/:id/delete`：删除指定待办事项
