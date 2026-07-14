import { todosTable } from "../../db/schema";
import { createSelectSchema } from "../../db/zod";
import {
  insertTodoAttachmentSchema,
  insertTodoSchema,
  selectTodoAttachmentSchema
} from "./todoSchema";

const todoAttachmentsInsertDto = insertTodoAttachmentSchema.pick({
  fileKey: true
});

const todoAttachmentsVo = selectTodoAttachmentSchema.omit({
  createdAt: true,
  updatedAt: true,
  todoId: true
});

export const createTodoDto = insertTodoSchema
  .omit({
    completed: true,
    completedAt: true,
    scheduleAt: true,
    createdAt: true,
    updatedAt: true,
    userId: true
  })
  .extend({
    attachments: todoAttachmentsInsertDto.array().optional()
  });

export const updateTodoDto = insertTodoSchema
  .pick({
    title: true,
    completed: true,
    description: true,
    scheduleAt: true,
    completedAt: true
  })
  .extend({
    attachments: todoAttachmentsInsertDto.array().optional()
  })
  .partial();

export const pageTodoVo = createSelectSchema(todosTable).omit({
  createdAt: true,
  updatedAt: true,
  userId: true
});

export const todoVo = createSelectSchema(todosTable)
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    attachments: todoAttachmentsVo.array().optional()
  });
