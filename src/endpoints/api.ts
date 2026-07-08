import z from "zod";

export class ApiRes {
  static ok(data: unknown) {
    return {
      success: true,
      data: data
    };
  }

  static success(data: unknown) {
    return {
      success: true,
      data: data
    };
  }
}

export const CreateRequestBody = <T extends z.ZodTypeAny>(data: T) => {
  return {
    body: {
      content: {
        "application/json": {
          schema: data
        }
      }
    }
  };
};

export const CreateSuccessResponse = <T extends z.ZodTypeAny>(
  data: T,
  description = "Created successfully"
) => {
  return {
    "201": {
      description,
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array<T>(data)
          })
        }
      }
    }
  };
};
