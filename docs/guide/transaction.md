---
title: "事务"
date: 2026-07-13
author: "Ryan Zeng"
tags: []
categories: []
draft: false
---

# 事务

本项目使用 Cloudflare D1 和 Drizzle ORM。D1 以自动提交模式运行；当多条语句必须同时成功或同时失败时，项目使用 `db.batch()`，不使用 Drizzle 的 `db.transaction()`。

Cloudflare 将批处理中的语句按顺序、非并发执行。批次中的任意语句失败时，整个批次会中止或回滚。详情请参阅 Cloudflare D1 的 [`batch()` 文档](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) 和 Drizzle 的 [Batch API](https://orm.drizzle.team/docs/batch-api)。

## 为什么不使用 `db.transaction()`

Drizzle 的 D1 数据库类型暴露了 `transaction()`，但该方法会尝试执行交互式事务语句 `BEGIN`、`COMMIT` 和 `ROLLBACK`。D1 Worker Binding 使用自动提交和批处理事务模型，因此本项目不通过以下方式组织 D1 写入：

```typescript
// 不要在本项目的 D1 查询中使用。
await db.transaction(async (tx) => {
  await tx.insert(usersTable).values(user);
  await tx.insert(authTable).values(auth);
});
```

在 Workers Runtime 测试中，这种调用会在事务回调执行前失败，并显示类似错误：

```text
Failed query: begin
```

需要原子执行多条 D1 语句时，应改用 `db.batch()`。

## 当前注册事务

注册接口需要同时写入两张表：

- `users_table`：保存姓名、年龄、邮箱和审计字段。
- `auth_table`：保存用户名、密码哈希、关联用户 ID 和审计字段。

`src/endpoints/auth/register.ts` 负责验证请求、调用数据访问方法、签发 JWT 并生成 HTTP 响应。数据库写入集中在 `src/db/queries.ts` 的 `AuthQueries.registerAccount()`：

```typescript
static async registerAccount(db: Database, data: RegisterAccountData) {
  const hashedPassword = await hashPassword(data.password);

  const now = new Date().toISOString();

  const [users, authRows] = await db.batch([
    db
      .insert(usersTable)
      .values({
        name: data.name,
        age: data.age,
        email: data.email,
        createdAt: now,
        updatedAt: now,
      })
      .returning(),

    db
      .insert(authTable)
      .values({
        userId: sql<number>`(
          SELECT ${usersTable.id}
          FROM ${usersTable}
          WHERE ${usersTable.email} = ${data.email}
          LIMIT 1
        )`,
        username: data.username,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      })
      .returning(),
  ]);

  return {
    user: users[0],
    auth: authRows[0],
  };
}
```

上例中的 `RegisterAccountData` 代表当前方法接收的注册数据结构，是为了突出批处理流程而使用的说明性类型名；实际参数类型直接声明在 `registerAccount()` 方法签名中。

### 执行顺序

1. 在发送数据库语句前计算密码哈希。哈希失败时直接抛出 `500` 异常，不执行批处理。
2. 第一条语句向 `users_table` 插入用户。
3. 第二条语句根据唯一邮箱查询刚写入的用户 ID，再向 `auth_table` 插入认证记录。
4. D1 返回与批处理语句顺序一致的结果，方法分别取得 `users[0]` 和 `authRows[0]`。
5. 注册端点确认两条记录存在后签发 JWT，并返回 `201`。

## 依赖自增 ID 的批处理

`db.batch()` 接收的是预先构建好的查询，第二条查询不能在 JavaScript 中直接读取第一条查询的返回值后再构建。当前用户 ID 由 `users_table` 自动递增生成，因此认证插入使用 SQL 子查询：

```typescript
userId: sql<number>`(
  SELECT ${usersTable.id}
  FROM ${usersTable}
  WHERE ${usersTable.email} = ${data.email}
  LIMIT 1
)`;
```

`users_table.email` 具有唯一约束，所以该查询最多返回一个用户。批处理按顺序执行，第二条语句可以读取第一条语句刚插入的记录。

如果未来改用应用层预生成的 UUID，可以在构建批处理前生成同一个用户 ID，并直接将它传给两条插入语句，不再需要子查询。

## 原子性边界

当前批处理只覆盖 `users_table` 和 `auth_table` 的数据库写入：

- 两条插入都成功时，用户与认证记录一起提交。
- 用户名唯一约束、邮箱唯一约束或外键约束导致任一语句失败时，整个批次回滚，不会留下只有用户信息而没有认证信息的记录。
- JWT 签发发生在 `db.batch()` 完成之后，不属于数据库事务。如果令牌签发失败，已经提交的用户和认证记录不会回滚。

这种边界避免在数据库事务中执行与数据库无关的异步工作，同时保证相互依赖的两条写入具有原子性。

## 约束与错误处理

注册批处理依赖数据库约束维护最终一致性：

- `users_table.email` 为唯一字段。
- `auth_table.username` 为唯一字段。
- `auth_table.userId` 通过外键关联 `users_table.id`。

`AuthQueries.registerAccount()` 返回批处理生成的用户和认证记录。`Register.handle()` 使用 `Assert.throwBadRequestIf()` 检查返回值，然后使用认证记录中的 `username` 和用户记录中的 `id` 构造 JWT 与响应。

修改注册流程时，不要把用户插入和认证插入拆成两个独立的 `await`。否则第二次写入失败时，第一次写入已经提交，会产生不完整账号。

## 适用场景

以下情况应使用 `db.batch()`：

- 多条 D1 写入必须同时成功或同时失败。
- 多条查询需要按固定顺序执行。
- 希望通过一次 D1 调用减少多次网络往返。

以下工作应放在批处理之外：

- 密码派生、请求校验等数据库执行前的计算。
- JWT 签发和 HTTP 响应构造。
- 调用第三方服务或其他外部系统。

## 测试与验证

集成测试通过 `test/setup.ts` 将迁移应用到隔离的 D1 数据库，然后调用 `/api/register` 和 `/api/login` 验证注册用户可以正常登录。相关流程记录在[测试指南](./testing.md)中。

运行完整验证：

```bash
bun run check
bun run test
bun run docs:build
```

当前 User 和 Todo 集成测试覆盖注册成功后的主要流程。修改批处理逻辑时，还应检查唯一用户名、唯一邮箱或认证插入失败时是否确实没有残留用户记录。
