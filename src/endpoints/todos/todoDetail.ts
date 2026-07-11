import { OpenAPIRoute } from "chanfana";
import { Assert } from "../../assert";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import { ApiRes, RequestParams, ResponseObjectBody } from "../rest";
import { todoDto } from "./todoDto";

export class TodoDetail extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Get a Todo by ID",
    request: RequestParams(idParamDto),
    responses: ResponseObjectBody(todoDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const todo = await TodoQueries.findById(getDB(c.env), data.params.id);

    Assert.throwNotFoundIf(!todo, "Todo not found");

    return c.json(ApiRes.success(todoDto.parse(todo)), 200);
  }
}
