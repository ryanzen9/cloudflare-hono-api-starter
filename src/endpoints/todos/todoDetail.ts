import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import { ApiRes, RequestParams, ResponseObjectBody } from "../rest";
import { todoVo } from "./todoDto";

export class TodoDetail extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Get a Todo by ID",
    request: RequestParams(idParamDto),
    responses: ResponseObjectBody(todoVo)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const userId = c.get("jwtPayload")?.data.userId;
    Assert.throwUnauthorizedIf(!userId, "Unauthorized");

    const todo = await TodoQueries.findById(getDB(c.env), data.params.id);

    Assert.throwNotFoundIf(!todo, "Todo not found");
    Assert.throwUnauthorizedIf(todo!.userId !== userId, "Unauthorized");

    return c.json(ApiRes.success(todoVo.parse(todo)), 200);
  }
}
