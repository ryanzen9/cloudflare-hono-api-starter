import { OpenAPIRoute } from "chanfana";
import { Assert } from "../../assert";
import { getDB } from "../../db/dao";
import { UserQueries } from "../../db/queries";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import {
  ApiRes,
  RequestBody,
  RequestParams,
  ResponseObjectBody
} from "../rest";
import { updateUserDto, userDto } from "./userDto";
import { updateUserSchema } from "./userSchema";

export class UserUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Update a User",
    request: {
      ...RequestParams(idParamDto),
      ...RequestBody(updateUserDto)
    },
    responses: ResponseObjectBody(userDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const userData = updateUserSchema.parse({
      ...data.body,
      updatedAt: new Date().toISOString()
    });
    const result = await UserQueries.updateById(
      getDB(c.env),
      data.params.id,
      userData
    );

    Assert.throwNotFoundIf(!result[0], "User not found");

    return c.json(ApiRes.success(userDto.parse(result[0])), 200);
  }
}
