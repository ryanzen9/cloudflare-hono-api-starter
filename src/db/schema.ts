import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const AuditColumns = {
  id: int().primaryKey({ autoIncrement: true }),
  createdAt: text().notNull(),
  updatedAt: text().notNull()
};

export const usersTable = sqliteTable("users_table", {
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),

  ...AuditColumns
});

export const todosTable = sqliteTable("todos_table", {
  title: text().notNull(),
  completed: int().notNull(),
  userId: int()
    .notNull()
    .references(() => usersTable.id),

  description: text(),
  scheduleAt: text(),
  completedAt: text(),

  ...AuditColumns
});
