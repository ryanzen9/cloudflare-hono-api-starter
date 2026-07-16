# 认证

项目使用 Hono 中间件进行认证，同时在 `/src/libs/auth/middlewares` 下封装认证中间件。项目默认认证方式为 Jwt 认证。除公开路径外，访问 `/api/*` 时都需要在 `Authorization` 请求头中携带有效凭证。

## 认证方式

### JWT 登录

客户端通过 `POST /api/login` 提交用户名和密码。认证成功后，服务端使用 `JWT_SECRET` 和 `HS256` 算法签发有效期为 1 小时的 JWT。

当前登录逻辑位于 `AuthQueries.login()`。

登录请求示例：

```bash
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

认证成功时返回 `201 Created`：

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "admin",
    "token": "<jwt>"
  }
}
```

后续请求通过 Bearer 方式携带 token：

```bash
curl http://localhost:8787/api/users \
  -H "Authorization: Bearer <jwt>"
```

JWT payload 的结构如下：

```json
{
  "sub": "1",
  "iat": 1783756800,
  "exp": 1783760400,
  "data": {
    "userId": "1",
    "username": "admin"
  }
}
```

- `sub`：当前用户 ID
- `iat`：签发时间，使用 Unix 时间戳
- `exp`：过期时间，当前为签发后 1 小时
- `data`：业务需要的用户信息

## 中间件行为

认证中间件在 `src/config.ts` 中注册到 `/api/*`：

```typescript
app.use(
  "/api/*",
  except(
    ["/api/login", "/api/register", "/api/download/:key"],
    JWTAuthMiddleware()
  )
);
```

对于 `/api/*` 请求，中间件按以下顺序处理：

1. 检查请求路径是否属于公开路径。
2. 读取 `Authorization: Bearer <token>` 请求头。
3. 使用 `JWT_SECRET` 和 `HS256` 校验 JWT。
4. 凭证缺失、格式错误、签名无效或 JWT 过期时返回 `401 Unauthorized`。

根路径 `/` 和 Swagger 文档 `/docs` 不在 `/api/*` 范围内，因此不会经过该 JWT 中间件。

## 在接口中读取身份

`AppEnv` 为 Hono 上下文声明了类型化的 `jwtPayload`。接口处理器可以通过 `c.get("jwtPayload")` 读取认证信息：

```typescript
const jwtPayload = c.get("jwtPayload");
const userId = jwtPayload.data.userId;

Assert.throwUnauthorizedIf(
  !userId,
  "Unauthorized: User ID not found in JWT payload"
);
```

如果接口需要真实用户身份，应显式检查 `userId`。

## Swagger UI

OpenAPI 注册了全局 `bearerAuth` 安全方案。在 `/docs` 打开 Swagger UI 后，点击 **Authorize**，输入以下任一凭证即可调试受保护接口：

- 登录接口返回的 JWT

Swagger UI 会自动以 `Authorization: Bearer <token>` 的格式发送请求。

## 环境变量

认证依赖以下 Worker secret：

- `JWT_SECRET`：JWT 签名和校验密钥

本地开发时在 `.dev.vars` 中配置：

```bash
JWT_SECRET=replace_with_a_long_random_secret
```

不要将 `.dev.vars`、真实密钥或已签发 token 提交到 Git。完整配置方式参见[环境变量](./environment-variable.md)。
