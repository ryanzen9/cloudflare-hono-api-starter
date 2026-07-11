import { z } from "@hono/zod-openapi";

export const idParamDto = z.object({
  id: z.coerce.number().int().positive().openapi({
    description: "The resource identifier",
    example: 1
  })
});
