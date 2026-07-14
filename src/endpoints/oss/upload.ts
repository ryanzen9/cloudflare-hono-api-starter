import { OpenAPIRoute, OpenAPIRouteSchema } from "chanfana";
import { z } from "zod";
import { Assert } from "../../libs/error";
import { UploadFile } from "../../libs/oss";
import { AppContext } from "../../types";
import { ApiRes, ResponseObjectBody } from "../rest";

export class Upload extends OpenAPIRoute {
  schema = {
    tags: ["Files"],
    summary: "Upload a file to R2",
    request: {
      body: {
        description: "文件上传表单",
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "需要上传的文件"
                },
                directory: {
                  type: "string",
                  description: "可选的文件目录",
                  example: "avatars"
                }
              }
            }
          }
        }
      }
    },
    responses: ResponseObjectBody(
      z.object({
        key: z.string(),
        etag: z.string(),
        size: z.number(),
        contentType: z.string()
      })
    )
  } satisfies OpenAPIRouteSchema;

  async handle(c: AppContext) {
    const formData = await c.req.formData();

    const fileValue = formData.get("file");
    const directoryValue = formData.get("directory");

    Assert.throwBadRequestIf(!fileValue, "Missing file");
    Assert.throwBadRequestIf(!(fileValue instanceof File), "Invalid file");

    const directory =
      typeof directoryValue === "string" ? directoryValue : undefined;

    const { key, etag, size, contentType } = await UploadFile(
      fileValue as File,
      c.env.R2_BUCKET,
      directory
    );

    return c.json(ApiRes.success({ key, etag, size, contentType }), 201);
  }
}
