import { todosTable } from "../../db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from "../../db/zod";

export const insertTodoSchema = createInsertSchema(todosTable, {
  title: (schema) => schema.openapi({ description: "The title of the todo" }),
  description: (schema) =>
    schema.openapi({
      description: "The description of the todo"
    }),
  userId: (schema) => schema.openapi({ description: "The ID of the user" })
}).omit({ id: true });

export const selectTodoSchema = createSelectSchema(todosTable);

export const updateTodoSchema = createUpdateSchema(todosTable);
