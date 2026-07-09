import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { todosTable } from "../../db/schema";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { ApiRes, ResponseBody } from "../rest";
import { pageTodoDto } from "./todoDto";

export class TodoList extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "List Todos",
    request: createPageQuerySchema(),
    responses: ResponseBody(pageTodoDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page, pageSize } = data.query;

    const db = getDB(c.env);

    const rows = await db
      .select()
      .from(todosTable)
      .limit(pageSize)
      .offset(page * pageSize);

    const parsedRows = rows.map((row) => pageTodoDto.parse(row));

    return c.json(ApiRes.success(parsedRows), 200);
  }
}
