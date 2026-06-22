import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getDB } from "../../db/dao";
import { usersTable } from "../../db/schema";
import { insertUserSchema, selectUserSchema } from "../../db/zod";
import { AppContext } from "../../types";

export class UserCreate extends OpenAPIRoute {
  schema = {
    tags: ["Users"],
    summary: "Create a new User",
    request: {
      body: {
        content: {
          "application/json": {
            schema: insertUserSchema
          }
        }
      }
    },
    responses: {
      "201": {
        description: "Returns the created user",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              user: selectUserSchema
            })
          }
        }
      }
    }
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const userData = data.body;

    const db = getDB(c.env);

    const parsed = insertUserSchema.parse(userData);

    const result = await db.insert(usersTable).values(parsed);

    return c.json(
      {
        success: true,
        user: {
          id: result.meta.last_row_id,
          ...userData
        }
      },
      201
    );
  }
}
