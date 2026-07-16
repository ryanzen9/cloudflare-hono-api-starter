import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { createSchemaFactory } from "drizzle-zod";
import { authTable, todosTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type Todo = typeof todosTable.$inferInsert;
export type Auth = typeof authTable.$inferSelect;
export type TodoAttachment = typeof todosTable.$inferSelect;
export type OAuthTransactions = z.infer<typeof OAuthTransactionsSchema>;

export const OAuthTransactionsSchema = z.object({
  stateHash: z.string().optional(),
  provider: z.string().nonempty(),
  codeVerifier: z.string().nonempty(),

  intent: z.string().nonempty(),
  initiatorUserId: z.number().int(),

  redirectTo: z.string().nonempty(),
  expiresAt: z.string().nonempty(),
  consumedAt: z.string().optional(),

  resolvedUserId: z.number().int().optional(),
  exchangeCodeHash: z.string().optional(),
  exchangedAt: z.string().optional(),

  createdAt: z.string().nonempty(),
  updatedAt: z.string().nonempty()
});

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });
