# 异常处理

## 自定义异常类

对 [Hono HTTPException](https://hono.dev/docs/api/exception) 进行了封装。

```ts
// errors.ts
export const UnauthorizedException = (message = "Unauthorized") =>
  new HTTPException(401, { message });

export const NotFoundException = (message = "Not Found") =>
  new HTTPException(404, { message });

export const BadRequestException = (message = "Bad Request") =>
  new HTTPException(400, { message });

export const InternalServerErrorException = (
  message = "Internal Server Error"
) => new HTTPException(500, { message });
```

## 异常捕获

使用 `app.onError()` 捕获异常并返回统一的 JSON 响应：

```ts
app.onError((err, c) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  return c.json({ success: false, message }, status);
});
```

使用自定义的错误处理器, 方法补充返回值类型增强类型推断

```ts
// error-handler.ts
export const ErrorHandler = () => async (err: Error, c: AppContext) => {
  if (err instanceof HTTPException) {
    if (err.status === 401) {
      return c.json(ApiRes.error(err.message), 401);
    }
    if (err.status === 404) {
      return c.json(ApiRes.error(err.message), 404);
    }
    if (err.status === 400) {
      console.error(`400 Error: ${err.message}`);
      console.error(`Stack Trace: ${err.stack}`);

      // Chanfana 已经生成了包含 Zod issues 的响应。
      if (err.res) {
        const validation = (await err.res.clone().json()) as {
          errors?: Array<{
            code: number;
            message: string;
            path: string[];
          }>;
        };

        const errorMsg = validation.errors
          ?.map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");

        return c.json(ApiRes.error(errorMsg || err.message), 400);
      }
      return c.json(ApiRes.error(err.message), 400);
    }
    if (err.status === 500) {
      console.error(`500 Error: ${err.message}`);
      console.error(`Stack Trace: ${err.stack}`);
      return c.json(ApiRes.error(err.message, err.stack), 500);
    }

    return err.getResponse();
  }

  console.error(`500 Error: ${err.message}`);
  console.error(`Stack Trace: ${err.stack}`);
  return c.json(ApiRes.error(err.message, err.stack), 500);
};

app.onError(ErrorHandler());
```

## 业务异常的抛出

业务逻辑中声明的异常使用断言函数抛出：

```ts
// assert.ts
export class Assert {
  static throw(
    status: ContentfulStatusCode,
    message?: string,
    cause?: unknown
  ): never {
    throw new HTTPException(status, { message, cause });
  }

  static throwIf(
    condition: boolean,
    status: ContentfulStatusCode,
    message?: string,
    cause?: unknown
  ): asserts condition is false {
    if (condition) {
      throw new HTTPException(status, { message, cause });
    }
  }

  static throwUnauthorized(message?: string): never {
    throw UnauthorizedException(message);
  }

  static throwUnauthorizedIf(
    condition: boolean,
    message?: string
  ): asserts condition is false {
    if (condition) {
      throw UnauthorizedException(message);
    }
  }

  static throwNotFound(message?: string): never {
    throw NotFoundException(message);
  }

  static throwNotFoundIf(
    condition: boolean,
    message?: string
  ): asserts condition is false {
    if (condition) {
      throw NotFoundException(message);
    }
  }

  static throwBadRequest(message?: string): never {
    throw BadRequestException(message);
  }

  static throwBadRequestIf(
    condition: boolean,
    message?: string
  ): asserts condition is false {
    if (condition) {
      throw BadRequestException(message);
    }
  }

  static throwInternalServerError(message?: string): never {
    throw InternalServerErrorException(message);
  }

  static throwInternalServerErrorIf(
    condition: boolean,
    message?: string
  ): asserts condition is false {
    if (condition) {
      throw InternalServerErrorException(message);
    }
  }
}
```

示例

```ts
// login.ts

const user = await AuthQueries.login(db, username, password);

Assert.throwUnauthorizedIf(!user);
```
