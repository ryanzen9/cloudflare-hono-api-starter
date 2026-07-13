import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { createSchemaFactory } from "drizzle-zod";
import { authTable, todosTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type Todo = typeof todosTable.$inferInsert;
export type Auth = typeof authTable.$inferSelect;

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });
