import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getDB } from "../../db/dao";
import { todosTable } from "../../db/schema";
import { pageTodoSchema } from "../../db/zod";
import { AppContext } from "../../types";
import { ApiRes } from "../api";

export class TodoList extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "List Todos",
    request: {
      query: z.object({
        page: z.number().default(0).describe("Page number"),
        pageSize: z.number().default(10).describe("Number of items per page")
      })
    },
    responses: {
      "200": {
        description: "Returns a list of todos",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              data: z.array(pageTodoSchema)
            })
          }
        }
      }
    }
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { page, pageSize } = data.query;

    const db = getDB(c.env);

    const rows = await db
      .select()
      .from(todosTable)
      .limit(pageSize)
      .offset(page * pageSize);

    const parsedRows = rows.map((row) => pageTodoSchema.parse(row));

    return ApiRes.success(parsedRows);
  }
}
