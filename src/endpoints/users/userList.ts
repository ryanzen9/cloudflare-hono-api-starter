import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { UserQueries } from "../../db/queries";
import { AppContext } from "../../types";
import { createPageQuerySchema } from "../dto";
import { ApiRes, ResponseArrayBody } from "../rest";
import { pageUserDto } from "./userDto";

export class UserList extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "List Users",
    request: createPageQuerySchema(),
    responses: ResponseArrayBody(pageUserDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page, pageSize } = data.query;

    const db = getDB(c.env);

    const rows = await UserQueries.list(db, page, pageSize);

    const parsedRows = rows.map((row) => pageUserDto.parse(row));

    return c.json(ApiRes.success(parsedRows), 200);
  }
}
