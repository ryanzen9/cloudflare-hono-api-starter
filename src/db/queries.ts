import { eq } from "drizzle-orm";
import { getDB } from "./dao";
import { todosTable, usersTable } from "./schema";

type Database = ReturnType<typeof getDB>;

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
  static create(db: Database, user: typeof usersTable.$inferInsert) {
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
  static findById(db: Database, id: number) {
    return db.select().from(todosTable).where(eq(todosTable.id, id)).get();
  }

  /**
   * 创建 todo。
   * @param todo 待写入的 todo 数据。
   * @returns 新创建的 todo 记录数组。
   */
  static create(db: Database, todo: typeof todosTable.$inferInsert) {
    return db.insert(todosTable).values(todo).returning();
  }

  /**
   * 根据 todo ID 更新 todo 信息。
   * @param id 目标 todo ID。
   * @param todo 要更新的 todo 字段。
   * @returns 更新后的 todo 记录数组；todo 不存在时为空数组。
   */
  static updateById(
    db: Database,
    id: number,
    todo: Partial<typeof todosTable.$inferInsert>
  ) {
    return db
      .update(todosTable)
      .set(todo)
      .where(eq(todosTable.id, id))
      .returning();
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
