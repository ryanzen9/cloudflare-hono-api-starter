import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { usersTable } from "../../db/schema";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { ApiRes, ResponseBody } from "../rest";
import { pageUserDto } from "./userDto";

export class UserList extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "List Users",
    request: createPageQuerySchema(),
    responses: ResponseBody(pageUserDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page, pageSize } = data.query;

    const db = getDB(c.env);

    const rows = await db
      .select()
      .from(usersTable)
      .limit(pageSize)
      .offset(page * pageSize);

    const parsedRows = rows.map((row) => pageUserDto.parse(row));

    return c.json(ApiRes.success(parsedRows), 200);
  }
}
