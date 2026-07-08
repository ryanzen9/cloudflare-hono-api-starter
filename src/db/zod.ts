import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { createSchemaFactory } from "drizzle-zod";
import { todosTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type Todo = typeof todosTable.$inferInsert;

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const selectUserSchema = createSelectSchema(usersTable);

export const insertUserSchema = createInsertSchema(usersTable, {
  name: (schema) => schema.openapi({ description: "The name of the user" }),
  age: (schema) => schema.openapi({ description: "The age of the user" }),
  email: (schema) => schema.openapi({ description: "The email of the user" })
}).omit({ id: true });

export const updateUserSchema = createUpdateSchema(usersTable);

export const insertTodoSchema = createInsertSchema(todosTable, {
  title: (schema) => schema.openapi({ description: "The title of the todo" }),
  description: (schema) =>
    schema.openapi({
      description: "The description of the todo"
    }),
  userId: (schema) => schema.openapi({ description: "The ID of the user" })
}).omit({ id: true });

export const insertTodoRequestSchema = insertTodoSchema.omit({
  completed: true,
  completedAt: true,
  scheduleAt: true,
  createdAt: true,
  updatedAt: true
});

export const selectTodoSchema = createSelectSchema(todosTable);

export const pageTodoSchema = createSelectSchema(todosTable).omit({
  createdAt: true,
  updatedAt: true,
  userId: true
});

export const updateTodoSchema = createUpdateSchema(todosTable);
