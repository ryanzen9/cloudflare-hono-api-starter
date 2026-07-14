import { todoAttachmentsTable, todosTable } from "../../db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from "../../db/zod";

export const insertTodoAttachmentSchema = createInsertSchema(
  todoAttachmentsTable,
  {
    todoId: (schema) => schema.openapi({ description: "The ID of the todo" }),
    fileKey: (schema) => schema.openapi({ description: "The key of the file" }),
    fileName: (schema) =>
      schema.openapi({ description: "The name of the file" }),
    fileSize: (schema) =>
      schema.openapi({ description: "The size of the file" })
  }
).omit({ id: true });

export const selectTodoAttachmentSchema =
  createSelectSchema(todoAttachmentsTable);

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
