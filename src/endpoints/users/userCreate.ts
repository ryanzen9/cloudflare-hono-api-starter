import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { usersTable } from "../../db/schema";
import { AppContext } from "../../types";
import { ApiRes, RequestBody, ResponseBody } from "../rest";
import { insertUserDto, userDto } from "./userDto";
import { insertUserSchema } from "./userSchema";

export class UserCreate extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Create a new User",
    request: RequestBody(insertUserDto),
    responses: ResponseBody(userDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const userData = data.body;

    const db = getDB(c.env);

    const insertData: typeof usersTable.$inferInsert = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const parsed = insertUserSchema.parse(insertData);

    const result = await db.insert(usersTable).values(parsed).returning();

    const responseData = userDto.parse(result[0]);

    return c.json(ApiRes.success(responseData), 201);
  }
}
