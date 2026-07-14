import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { UserQueries } from "../../db/queries";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import { ApiRes, RequestParams, ResponseObjectBody } from "../rest";
import { userDto } from "./userDto";

export class UserDetail extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Get a User by ID",
    request: RequestParams(idParamDto),
    responses: ResponseObjectBody(userDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const user = await UserQueries.findById(getDB(c.env), data.params.id);

    Assert.throwNotFoundIf(!user, "User not found");

    return c.json(ApiRes.success(userDto.parse(user)), 200);
  }
}
