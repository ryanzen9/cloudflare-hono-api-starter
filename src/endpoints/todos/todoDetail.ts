import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { findTodoById } from "../../db/queries";
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
    const todo = await findTodoById(getDB(c.env), data.params.id);

    if (!todo) {
      return c.json(ApiRes.error("Todo not found"), 404);
    }

    return c.json(ApiRes.success(todoDto.parse(todo)), 200);
  }
}
