import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { updateUserById } from "../../db/queries";
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
    const result = await updateUserById(getDB(c.env), data.params.id, userData);

    if (!result[0]) {
      return c.json(ApiRes.error("User not found"), 404);
    }

    return c.json(ApiRes.success(userDto.parse(result[0])), 200);
  }
}
