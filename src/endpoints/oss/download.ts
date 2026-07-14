import { OpenAPIRoute, OpenAPIRouteSchema } from "chanfana";
import { z } from "zod";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";

export class Download extends OpenAPIRoute {
  schema = {
    tags: ["Files"],
    summary: "Download a file from R2",
    request: {
      params: z.object({
        key: z.string().describe("The key of the file to download")
      })
    },
    responses: {
      "200": {
        description: "文件内容",
        headers: {
          "Content-Disposition": {
            description: "下载文件名",
            schema: {
              type: "string"
            }
          }
        },
        content: {
          "application/octet-stream": {
            schema: {
              type: "string",
              format: "binary"
            }
          }
        }
      }
    }
  } satisfies OpenAPIRouteSchema;

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const fileKey = data.params.key;

    const object = await c.env.R2_BUCKET.get(fileKey);

    if (!object) {
      Assert.throwNotFound(`File not found`);
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);

    headers.set("ETag", object.httpEtag);

    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(
        object.customMetadata?.originalName ??
          fileKey.split("/").at(-1) ??
          "download"
      )}`
    );

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/octet-stream");
    }

    return new Response(object.body, {
      status: 200,
      headers
    });
  }
}
