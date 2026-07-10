import z from "zod";

export class ApiRes {
  static success(data: unknown) {
    return {
      success: true,
      data: data
    };
  }

  static error(message: string, stack?: string) {
    return {
      success: false,
      error: {
        message,
        stack
      }
    };
  }
}

export const RequestBody = <T extends z.ZodTypeAny>(data: T) => {
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

export const RequestParams = <T extends z.ZodTypeAny>(data: T) => {
  return {
    params: data
  };
};

export const RequestQuery = <T extends z.ZodTypeAny>(data: T) => {
  return {
    query: {
      content: {
        "application/json": {
          schema: data
        }
      }
    }
  };
};

export const ResponseObjectBody = <T extends z.ZodTypeAny>(data: T) => ({
  "200": {
    description: "Request successful",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean(),
          data
        })
      }
    }
  },
  "201": {
    description: "Resource created",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean(),
          data
        })
      }
    }
  },
  "404": {
    description: "Not found",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean(),
          error: z.object({ message: z.string() })
        })
      }
    }
  }
});

export const ResponseArrayBody = <T extends z.ZodTypeAny>(data: T) => {
  return {
    "200": {
      description: "Query successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array<T>(data)
          })
        }
      }
    },
    "201": {
      description: "Resource created",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array<T>(data) || z.object<T>(data)
          })
        }
      }
    },
    "400": {
      description: "Bad request",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    },
    "401": {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    },
    "404": {
      description: "Not found",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string()
          })
        }
      }
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            stack: z.string().optional()
          })
        }
      }
    }
  };
};
