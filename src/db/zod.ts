import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { createSchemaFactory } from "drizzle-zod";
import { usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const insertUserSchema = createInsertSchema(usersTable, {
  name: (schema) => schema.openapi({ description: "The name of the user" }),
  age: (schema) => schema.openapi({ description: "The age of the user" }),
  email: (schema) => schema.openapi({ description: "The email of the user" })
}).omit({ id: true });

export const selectUserSchema = createSelectSchema(usersTable);

export const updateUserSchema = createUpdateSchema(usersTable);
