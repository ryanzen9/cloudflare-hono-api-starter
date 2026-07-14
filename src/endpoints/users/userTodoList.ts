import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { JwtPayload } from "../../libs/auth/jwt";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { ApiRes, ResponseArrayBody } from "../rest";
import { pageTodoVo } from "../todos/todoDto";

export class UserTodoList extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "List Todos by User",
    request: createPageQuerySchema(),
    responses: ResponseArrayBody(pageTodoVo)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const jwtPayload = c.get("jwtPayload") as JwtPayload;

    Assert.throwUnauthorizedIf(
      !jwtPayload,
      "Unauthorized: JWT payload not found"
    );

    const userId = jwtPayload.data.userId;

    Assert.throwUnauthorizedIf(
      !userId,
      "Unauthorized: User ID not found in JWT payload"
    );

    const rows = await TodoQueries.listByUserId(
      getDB(c.env),
      userId,
      data.query.page,
      data.query.pageSize
    );

    return c.json(
      ApiRes.success(rows.map((row) => pageTodoVo.parse(row))),
      200
    );
  }
}
