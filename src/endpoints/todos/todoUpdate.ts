import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import {
  ApiRes,
  RequestBody,
  RequestParams,
  ResponseObjectBody
} from "../rest";
import { todoDto, updateTodoDto } from "./todoDto";
import { updateTodoSchema } from "./todoSchema";

export class TodoUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Update a Todo",
    request: {
      ...RequestParams(idParamDto),
      ...RequestBody(updateTodoDto)
    },
    responses: ResponseObjectBody(todoDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const todoData = updateTodoSchema.parse({
      ...data.body,
      updatedAt: new Date().toISOString()
    });
    const result = await TodoQueries.updateById(
      getDB(c.env),
      data.params.id,
      todoData
    );

    if (!result[0]) {
      return c.json(ApiRes.error("Todo not found"), 404);
    }

    return c.json(ApiRes.success(todoDto.parse(result[0])), 200);
  }
}
