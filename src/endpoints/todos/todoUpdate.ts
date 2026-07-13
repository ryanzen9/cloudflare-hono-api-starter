import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { Assert } from "../../libs/error";
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
    const db = getDB(c.env);
    const userId = c.get("jwtPayload")?.data.userId;
    Assert.throwUnauthorizedIf(!userId, "Unauthorized");

    const todo = await TodoQueries.findById(db, data.params.id);

    Assert.throwUnauthorizedIf(todo?.userId !== userId, "Unauthorized");

    const todoData = updateTodoSchema.parse({
      ...data.body,
      updatedAt: new Date().toISOString()
    });
    const result = await TodoQueries.updateById(
      getDB(c.env),
      data.params.id,
      todoData
    );

    Assert.throwNotFoundIf(!result[0], "Todo not found");

    return c.json(ApiRes.success(todoDto.parse(result[0])), 200);
  }
}
