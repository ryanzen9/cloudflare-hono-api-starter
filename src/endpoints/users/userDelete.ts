import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { UserQueries } from "../../db/queries";
import { BizError } from "../../errors";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import { ApiRes, RequestParams, ResponseObjectBody } from "../rest";

export class UserDelete extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Delete a User",
    request: RequestParams(idParamDto),
    responses: ResponseObjectBody(idParamDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const result = await UserQueries.deleteById(getDB(c.env), data.params.id);

    BizError.throwNotFoundIf(!result[0], "User not found");

    return c.json(ApiRes.success(result[0]), 200);
  }
}
