import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { TodoQueries } from "../../db/queries";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { idParamDto } from "../params";
import {
  ApiRes,
  RequestBody,
  RequestParams,
  ResponseObjectBody
} from "../rest";
import { todoVo, updateTodoDto } from "./todoDto";
import { updateTodoSchema } from "./todoSchema";

export class TodoUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Todos"],
    summary: "Update a Todo",
    request: {
      ...RequestParams(idParamDto),
      ...RequestBody(updateTodoDto)
    },
    responses: ResponseObjectBody(todoVo)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const db = getDB(c.env);
    const userId = c.get("jwtPayload")?.data.userId;

    Assert.throwUnauthorizedIf(!userId, "Unauthorized");

    const todo = await TodoQueries.findById(db, data.params.id);

    Assert.throwNotFoundIf(!todo, "Todo not found");

    Assert.throwUnauthorizedIf(todo!.userId !== userId, "Unauthorized");

    const todoData = updateTodoSchema.parse({
      ...data.body,
      updatedAt: new Date().toISOString()
    });

    let todoAttachments: (R2Object | null)[] = [];
    if (data.body.attachments && data.body.attachments.length > 0) {
      const todoAttachemtsPromise = data.body.attachments?.map((attachment) =>
        c.env.R2_BUCKET.get(attachment.fileKey)
      );

      todoAttachments = await Promise.all(todoAttachemtsPromise || []);
    }

    const attachmentsInserted = data.body.attachments
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

    const updatedRows = await TodoQueries.updateById(db, data.params.id, {
      ...todoData,
      attachments: attachmentsInserted
    });

    Assert.throwNotFoundIf(!updatedRows[0], "Todo not found");

    const result = await TodoQueries.findById(db, data.params.id);

    return c.json(ApiRes.success(todoVo.parse(result)), 200);
  }
}
