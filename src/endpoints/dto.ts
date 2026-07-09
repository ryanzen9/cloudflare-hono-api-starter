import { z } from "zod";

export type PageQueryType = z.infer<typeof PageQuery>;

export const PageQuery = z.object({
  page: z.number().default(0).describe("Page number"),
  pageSize: z.number().default(10).describe("Number of items per page")
});

export const createPageQuerySchema = <T>(querySchema?: z.ZodType<T>) => {
  if (!querySchema) {
    return {
      query: PageQuery
    };
  }

  return {
    query: z.object({
      page: z.number().default(0).describe("Page number"),
      pageSize: z.number().default(10).describe("Number of items per page"),
      data: querySchema ? z.array(querySchema).optional() : z.undefined()
    })
  };
};
