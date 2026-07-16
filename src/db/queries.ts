import { and, eq, sql } from "drizzle-orm";
import { Assert } from "../libs/error";
import { hashPassword, verifyPassword } from "../libs/utils";
import { getDB } from "./dao";
import {
  authTable,
  oauthAccountsTable,
  todoAttachmentsTable,
  todosTable,
  usersTable
} from "./schema";

// D1 环境下不支持开启 Begin Commit 等事务操作，因此这里不导出 transaction 方法。
// 可以通过使用批量语句 `batch` 进行原子操作。
type Database = Omit<ReturnType<typeof getDB>, "transaction">;

/** 认证相关的数据访问操作。 */
export class AuthQueries {
  static async loginWithGithub(
    db: Database,
    githubUser: {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
      avatar_url: string;
    }
  ) {
    // 查询是否已存在用户
    const existingOAuthAccount = await db
      .select()
      .from(oauthAccountsTable)
      .where(
        and(
          eq(oauthAccountsTable.provider, "github"),
          eq(oauthAccountsTable.providerSubject, githubUser.id.toString())
        )
      )
      .get();

    if (existingOAuthAccount) {
      // 更新后返回
      const row = await db
        .update(oauthAccountsTable)
        .set({
          providerLogin: githubUser.login,
          providerEmail: githubUser.email,
          updatedAt: new Date().toISOString()
        })
        .where(eq(oauthAccountsTable.id, existingOAuthAccount.id))
        .returning();
      return row[0];
    } else {
      const user = await db
        .insert(usersTable)
        .values({
          name: githubUser.name || githubUser.login,
          email: githubUser.email!,
          avatarUrl: githubUser.avatar_url,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();

      const row = await db
        .insert(oauthAccountsTable)
        .values({
          userId: user[0]!.id, // 使用刚插入的用户 ID
          provider: "github",
          providerSubject: githubUser.id.toString(),
          providerLogin: githubUser.login,
          providerEmail: githubUser.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      return row[0];
    }
  }

  /**
   * 注册
   * @param data 用户信息。
   * @returns 新创建的用户记录数组。
   */
  static async registerAccount(
    db: Database,
    data: {
      username: string;
      password: string;
      name: string;
      age: number;
      email: string;
    }
  ) {
    const hashedPassword = await hashPassword(data.password);

    const now = new Date().toISOString();

    const existsEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .get();

    Assert.throwBadRequestIf(!!existsEmail, "Email already exists");

    const existsUsername = await db
      .select()
      .from(authTable)
      .where(eq(authTable.username, data.username))
      .get();

    Assert.throwBadRequestIf(!!existsUsername, "Username already exists");

    const [users, authRows] = await db.batch([
      db
        .insert(usersTable)
        .values({
          name: data.name,
          age: data.age,
          email: data.email,
          createdAt: now,
          updatedAt: now
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
          updatedAt: now
        })
        .returning()
    ]);

    return {
      user: users[0],
      auth: authRows[0]
    };
  }

  /**
   * 登录
   * @param username 用户名。
   * @param password 密码。
   * @returns 匹配的用户记录；认证失败时返回 null。
   */
  static async login(db: Database, username: string, password: string) {
    const row = await db
      .select()
      .from(authTable)
      .where(eq(authTable.username, username))
      .get();
    if (!row) {
      return null;
    }
    const isPasswordValid = await verifyPassword(row.password, password);
    if (!isPasswordValid) {
      return null;
    }
    return row;
  }
}

/** 用户表的数据访问操作。 */
export class UserQueries {
  /**
   * 分页查询用户列表。
   * @param page 从 0 开始的页码。
   * @param pageSize 每页返回的用户数量。
   * @returns 指定页的用户记录列表。
   */
  static list(db: Database, page: number, pageSize: number) {
    return db
      .select()
      .from(usersTable)
      .limit(pageSize)
      .offset(page * pageSize);
  }

  /**
   * 根据用户 ID 查询单个用户。
   * @param id 用户 ID。
   * @returns 匹配的用户记录；用户不存在时返回 undefined。
   */
  static findById(db: Database, id: number) {
    return db.select().from(usersTable).where(eq(usersTable.id, id)).get();
  }

  /**
   * 创建用户。
   * @param user 待写入的用户数据。
   * @returns 新创建的用户记录数组。
   */
  static async create(db: Database, user: typeof usersTable.$inferInsert) {
    const exists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .get();

    Assert.throwBadRequestIf(!!exists, "Email already exists");

    return db.insert(usersTable).values(user).returning();
  }

  /**
   * 根据用户 ID 更新用户信息。
   * @param id 目标用户 ID。
   * @param user 要更新的用户字段。
   * @returns 更新后的用户记录数组；用户不存在时为空数组。
   */
  static updateById(
    db: Database,
    id: number,
    user: Partial<typeof usersTable.$inferInsert>
  ) {
    return db
      .update(usersTable)
      .set(user)
      .where(eq(usersTable.id, id))
      .returning();
  }

  /**
   * 根据用户 ID 删除用户。
   * @param id 目标用户 ID。
   * @returns 已删除用户的 ID 数组；用户不存在时为空数组。
   */
  static deleteById(db: Database, id: number) {
    return db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });
  }
}

/** Todo 表的数据访问操作。 */
export class TodoQueries {
  /**
   * 分页查询全部 todo。
   * @param page 从 0 开始的页码。
   * @param pageSize 每页返回的 todo 数量。
   * @returns 指定页的 todo 记录列表。
   */
  static list(db: Database, page: number, pageSize: number) {
    return db
      .select()
      .from(todosTable)
      .limit(pageSize)
      .offset(page * pageSize);
  }

  /**
   * 分页查询指定用户的 todo。
   * @param userId 所属用户 ID。
   * @param page 从 0 开始的页码。
   * @param pageSize 每页返回的 todo 数量。
   * @returns 指定用户在该页的 todo 记录列表。
   */
  static listByUserId(
    db: Database,
    userId: number,
    page: number,
    pageSize: number
  ) {
    return db
      .select()
      .from(todosTable)
      .where(eq(todosTable.userId, userId))
      .limit(pageSize)
      .offset(page * pageSize);
  }

  /**
   * 根据 todo ID 查询单个 todo。
   * @param id todo ID。
   * @returns 匹配的 todo 记录；todo 不存在时返回 undefined。
   */
  static async findById(db: Database, id: number) {
    const todo = await db
      .select()
      .from(todosTable)
      .where(eq(todosTable.id, id))
      .get();
    const todoAttachments = await db
      .select()
      .from(todoAttachmentsTable)
      .where(eq(todoAttachmentsTable.todoId, id));
    if (todo) {
      return { ...todo, attachments: todoAttachments };
    }
    return undefined;
  }

  /**
   * 创建 todo。
   * @param todo 待写入的 todo 数据。
   * @returns 新创建的 todo 记录数组。
   */
  static async create(
    db: Database,
    todo: typeof todosTable.$inferInsert & {
      attachments?: Omit<typeof todoAttachmentsTable.$inferInsert, "todoId">[];
    }
  ) {
    Assert.throwBadRequestIf(!todo, "Todo data is required");
    const insertedTodo = await db.insert(todosTable).values(todo).returning();
    Assert.throwBadRequestIf(
      !insertedTodo || insertedTodo.length === 0,
      "Failed to create todo"
    );

    const attachmentsWithTodoId = (todo.attachments || []).map(
      (attachment) => ({
        ...attachment,
        todoId: insertedTodo[0]!.id
      })
    );

    if (attachmentsWithTodoId.length > 0) {
      await db
        .insert(todoAttachmentsTable)
        .values(attachmentsWithTodoId)
        .returning();
    }

    return insertedTodo;
  }

  /**
   * 根据 todo ID 更新 todo 信息。
   * @param id 目标 todo ID。
   * @param todo 要更新的 todo 字段。
   * @returns 更新后的 todo 记录数组；todo 不存在时为空数组。
   */
  static async updateById(
    db: Database,
    id: number,
    todo: Partial<typeof todosTable.$inferInsert> & {
      attachments?: Omit<typeof todoAttachmentsTable.$inferInsert, "todoId">[];
    }
  ) {
    const { attachments, ...todoValues } = todo;

    const updateTodoQuery = db
      .update(todosTable)
      .set(todoValues)
      .where(eq(todosTable.id, id))
      .returning();

    // 没有传 attachments 时，只更新 Todo，不修改现有附件。
    if (attachments === undefined) {
      return await updateTodoQuery;
    }

    const deleteAttachmentsQuery = db
      .delete(todoAttachmentsTable)
      .where(eq(todoAttachmentsTable.todoId, id));

    // 明确传入空数组时，删除全部附件。
    if (attachments.length === 0) {
      const [updatedRows] = await db.batch([
        updateTodoQuery,
        deleteAttachmentsQuery
      ]);

      return updatedRows;
    }

    const attachmentsWithTodoId = attachments.map((attachment) => ({
      ...attachment,
      todoId: id
    }));

    const insertAttachmentsQuery = db
      .insert(todoAttachmentsTable)
      .values(attachmentsWithTodoId);

    const [updatedRows] = await db.batch([
      updateTodoQuery,
      deleteAttachmentsQuery,
      insertAttachmentsQuery
    ]);

    return updatedRows;
  }

  /**
   * 根据 todo ID 删除 todo。
   * @param id 目标 todo ID。
   * @returns 已删除 todo 的 ID 数组；todo 不存在时为空数组。
   */
  static deleteById(db: Database, id: number) {
    return db
      .delete(todosTable)
      .where(eq(todosTable.id, id))
      .returning({ id: todosTable.id });
  }
}
