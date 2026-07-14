import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import { ApiRes, RequestParams, ResponseObjectBody } from "../rest";

export class TodoDelete extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Delete a Todo",
    request: RequestParams(idParamDto),
    responses: ResponseObjectBody(idParamDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const userId = c.get("jwtPayload")?.data.userId;
    Assert.throwUnauthorizedIf(!userId, "Unauthorized");

    const todo = await TodoQueries.findById(getDB(c.env), data.params.id);

    Assert.throwNotFoundIf(!todo, "Todo not found");
    Assert.throwUnauthorizedIf(todo!.userId !== userId, "Unauthorized");

    const result = await TodoQueries.deleteById(getDB(c.env), data.params.id);

    Assert.throwNotFoundIf(!result[0], "Todo not found");

    return c.json(ApiRes.success(result[0]), 200);
  }
}
