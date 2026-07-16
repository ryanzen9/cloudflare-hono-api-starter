import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const AuditColumns = {
  id: int().primaryKey({ autoIncrement: true }),
  createdAt: text().notNull(),
  updatedAt: text().notNull()
};

export const usersTable = sqliteTable("users_table", {
  name: text().notNull(),
  age: int(),
  email: text().notNull().unique(),
  avatarUrl: text(),

  ...AuditColumns
});

export const authTable = sqliteTable("auth_table", {
  userId: int()
    .notNull()
    .references(() => usersTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade"
    }),
  username: text().notNull().unique(),
  password: text().notNull(),

  ...AuditColumns
});

export const oauthAccountsTable = sqliteTable("oauth_accounts_table", {
  userId: int()
    .notNull()
    .references(() => usersTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade"
    }),
  provider: text().notNull(),
  providerSubject: text().notNull(),
  providerLogin: text().notNull(),
  providerEmail: text(),

  ...AuditColumns
});

export const todosTable = sqliteTable("todos_table", {
  title: text().notNull(),
  completed: int().notNull(),
  userId: int()
    .notNull()
    .references(() => usersTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade"
    }),

  description: text(),
  scheduleAt: text(),
  completedAt: text(),

  ...AuditColumns
});

export const todoAttachmentsTable = sqliteTable("todo_attachments_table", {
  todoId: int()
    .notNull()
    .references(() => todosTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade"
    }),
  fileKey: text().notNull(),
  fileHash: text().notNull(),
  fileName: text().notNull(),
  filePath: text().notNull(),
  fileSize: int().notNull(),

  ...AuditColumns
});
