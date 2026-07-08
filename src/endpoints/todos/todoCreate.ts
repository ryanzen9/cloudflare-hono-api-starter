import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { todosTable } from "../../db/schema";
import {
  insertTodoRequestSchema,
  insertTodoSchema,
  selectTodoSchema
} from "../../db/zod";
import { AppContext } from "../../types";
import { ApiRes, CreateRequestBody, CreateSuccessResponse } from "../api";

export class TodoCreate extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Create a new Todo",
    request: CreateRequestBody(insertTodoRequestSchema),
    responses: CreateSuccessResponse(selectTodoSchema)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const todoData = data.body;
    const db = getDB(c.env);

    console.log("Creating a new todo with data:", todoData);

    const insertedTodo = insertTodoSchema.parse({
      ...todoData,
      completed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log("Parsed todo data for insertion:", insertedTodo);

    const result = await db.insert(todosTable).values(insertedTodo).returning();

    return c.json(ApiRes.ok(result), 201);
  }
}
