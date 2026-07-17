# GitHub OAuth React Example

React Router 驱动的 GitHub OAuth 登录示例。

## 运行

```bash
bun install --frozen-lockfile
bun run dev
```

默认运行于 `http://localhost:5174`。

## 路由

| 路径             | 页面                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `/`              | GitHub 登录入口                                                       |
| `/login/success` | 登录成功页，可读取 `username` 和 `userId` 查询参数                    |
| `/login/failure` | 登录失败页，可读取 `message`、`error_description` 和 `error` 查询参数 |

登录按钮当前跳转到：

```text
https://cloudflare-hono-api-starter.rubyceng0326.workers.dev/auth/github/login
```
