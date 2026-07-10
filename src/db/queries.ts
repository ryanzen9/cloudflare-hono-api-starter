import { eq } from "drizzle-orm";
import { getDB } from "./dao";
import { todosTable, usersTable } from "./schema";

type Database = ReturnType<typeof getDB>;

export const listUsers = (db: Database, page: number, pageSize: number) =>
  db
    .select()
    .from(usersTable)
    .limit(pageSize)
    .offset(page * pageSize);

export const findUserById = (db: Database, id: number) =>
  db.select().from(usersTable).where(eq(usersTable.id, id)).get();

export const createUser = (
  db: Database,
  user: typeof usersTable.$inferInsert
) => db.insert(usersTable).values(user).returning();

export const updateUserById = (
  db: Database,
  id: number,
  user: Partial<typeof usersTable.$inferInsert>
) => db.update(usersTable).set(user).where(eq(usersTable.id, id)).returning();

export const deleteUserById = (db: Database, id: number) =>
  db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });

export const listTodos = (db: Database, page: number, pageSize: number) =>
  db
    .select()
    .from(todosTable)
    .limit(pageSize)
    .offset(page * pageSize);

export const listTodosByUserId = (
  db: Database,
  userId: number,
  page: number,
  pageSize: number
) =>
  db
    .select()
    .from(todosTable)
    .where(eq(todosTable.userId, userId))
    .limit(pageSize)
    .offset(page * pageSize);

export const findTodoById = (db: Database, id: number) =>
  db.select().from(todosTable).where(eq(todosTable.id, id)).get();

export const createTodo = (
  db: Database,
  todo: typeof todosTable.$inferInsert
) => db.insert(todosTable).values(todo).returning();

export const updateTodoById = (
  db: Database,
  id: number,
  todo: Partial<typeof todosTable.$inferInsert>
) => db.update(todosTable).set(todo).where(eq(todosTable.id, id)).returning();

export const deleteTodoById = (db: Database, id: number) =>
  db
    .delete(todosTable)
    .where(eq(todosTable.id, id))
    .returning({ id: todosTable.id });
