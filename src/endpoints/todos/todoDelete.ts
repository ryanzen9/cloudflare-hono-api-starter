import { OpenAPIRoute } from "chanfana";
import { Assert } from "../../assert";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
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
    const result = await TodoQueries.deleteById(getDB(c.env), data.params.id);

    Assert.throwNotFoundIf(!result[0], "Todo not found");

    return c.json(ApiRes.success(result[0]), 200);
  }
}
