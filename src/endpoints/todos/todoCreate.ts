import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { createTodo } from "../../db/queries";

import { AppContext } from "../../types";
import { ApiRes, RequestBody, ResponseArrayBody } from "../rest";
import { createTodoDto, pageTodoDto } from "./todoDto";
import { insertTodoSchema } from "./todoSchema";

export class TodoCreate extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Create a new Todo",
    request: RequestBody(createTodoDto),
    responses: ResponseArrayBody(pageTodoDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const todoData = data.body;
    const db = getDB(c.env);

    const insertedTodo = insertTodoSchema.parse({
      ...todoData,
      completed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const result = await createTodo(db, insertedTodo);

    return c.json(ApiRes.success(result), 201);
  }
}
