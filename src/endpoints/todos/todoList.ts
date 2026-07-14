import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { ApiRes, ResponseArrayBody } from "../rest";
import { pageTodoVo } from "./todoDto";

export class TodoList extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "List Todos",
    request: createPageQuerySchema(),
    responses: ResponseArrayBody(pageTodoVo)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page, pageSize } = data.query;

    const db = getDB(c.env);

    const rows = await TodoQueries.list(db, page, pageSize);

    const parsedRows = rows.map((row) => pageTodoVo.parse(row));

    return c.json(ApiRes.success(parsedRows), 200);
  }
}
