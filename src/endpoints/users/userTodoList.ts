import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { BizError } from "../../errors";
import { JwtPayload } from "../../libs/auth/jwt";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { ApiRes, ResponseArrayBody } from "../rest";
import { pageTodoDto } from "../todos/todoDto";

export class UserTodoList extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "List Todos by User",
    request: createPageQuerySchema(),
    responses: ResponseArrayBody(pageTodoDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const jwtPayload = c.get("jwtPayload") as JwtPayload;

    BizError.throwUnauthorizedIf(
      !jwtPayload,
      "Unauthorized: JWT payload not found"
    );

    const userId = jwtPayload.data.userId;

    BizError.throwUnauthorizedIf(
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
      ApiRes.success(rows.map((row) => pageTodoDto.parse(row))),
      200
    );
  }
}
