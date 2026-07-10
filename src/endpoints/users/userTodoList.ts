import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { listTodosByUserId } from "../../db/queries";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { userIdParamDto } from "../params";
import { ApiRes, ResponseArrayBody } from "../rest";
import { pageTodoDto } from "../todos/todoDto";

export class UserTodoList extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "List Todos by User ID",
    request: {
      ...createPageQuerySchema(),
      params: userIdParamDto
    },
    responses: ResponseArrayBody(pageTodoDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const rows = await listTodosByUserId(
      getDB(c.env),
      data.params.userId,
      data.query.page,
      data.query.pageSize
    );

    return c.json(
      ApiRes.success(rows.map((row) => pageTodoDto.parse(row))),
      200
    );
  }
}
