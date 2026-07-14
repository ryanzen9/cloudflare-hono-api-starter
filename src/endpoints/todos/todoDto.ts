import { todosTable } from "../../db/schema";
import { createSelectSchema } from "../../db/zod";
import { insertTodoSchema } from "./todoSchema";

export const createTodoDto = insertTodoSchema.omit({
  completed: true,
  completedAt: true,
  scheduleAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true
});

export const pageTodoDto = createSelectSchema(todosTable).omit({
  createdAt: true,
  updatedAt: true,
  userId: true
});

export const todoDto = createSelectSchema(todosTable).omit({
  createdAt: true,
  updatedAt: true
});

export const updateTodoDto = insertTodoSchema
  .pick({
    title: true,
    completed: true,
    description: true,
    scheduleAt: true,
    completedAt: true
  })
  .partial();
