import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { UserQueries } from "../../db/queries";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import { ApiRes, ResponseObjectBody } from "../rest";

export class UserDelete extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Delete a User",
    responses: ResponseObjectBody(idParamDto)
  };

  async handle(c: AppContext) {
    const userId = c.get("jwtPayload")?.data?.userId;
    Assert.throwUnauthorizedIf(!userId, "Unauthorized");

    const db = getDB(c.env);
    const result = await UserQueries.deleteById(db, userId);

    Assert.throwNotFoundIf(!result[0], "User not found");

    const res = idParamDto.parse({
      id: result[0]!.id
    });

    return c.json(ApiRes.success(res), 200);
  }
}
