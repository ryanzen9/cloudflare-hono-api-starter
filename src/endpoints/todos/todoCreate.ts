import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";

import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { ApiRes, RequestBody, ResponseArrayBody } from "../rest";
import { createTodoDto, todoVo } from "./todoDto";
import { insertTodoSchema } from "./todoSchema";

export class TodoCreate extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Create a new Todo",
    request: RequestBody(createTodoDto),
    responses: ResponseArrayBody(todoVo)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const todoData = data.body;
    const db = getDB(c.env);

    const userId = c.get("jwtPayload")?.data?.userId;

    Assert.throwBadRequestIf(!userId, "User ID not found in JWT payload");

    const insertedTodo = insertTodoSchema.parse({
      ...todoData,
      userId: userId,
      completed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    let todoAttachments: (R2Object | null)[] = [];

    if (todoData.attachments && todoData.attachments.length > 0) {
      const todoAttachemtsPromise = todoData.attachments?.map((attachment) =>
        c.env.R2_BUCKET.get(attachment.fileKey)
      );

      todoAttachments = await Promise.all(todoAttachemtsPromise || []);
    }

    const attachmentsInserted = todoData.attachments
      ?.map((attachment) => {
        const ossObj = todoAttachments.find(
          (att) => att?.key === attachment.fileKey
        );
        if (!ossObj) return;

        return {
          fileName: ossObj?.key.split("-").pop() || "",
          filePath: attachment.fileKey,
          fileSize: ossObj?.size || 0,
          fileHash: ossObj?.etag || "",
          fileKey: attachment.fileKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      })
      .filter((attachment) => attachment !== undefined);

    const insertRows = await TodoQueries.create(db, {
      ...insertedTodo,
      attachments: attachmentsInserted
    });

    const rows = await TodoQueries.findById(db, insertRows[0]!.id);

    const result = todoVo.parse(rows);

    return c.json(ApiRes.success(result), 201);
  }
}
