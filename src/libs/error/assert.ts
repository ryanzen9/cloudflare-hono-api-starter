import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "../../libs/error";

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
  ): never | void {
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
  ): never | void {
    if (condition) {
      throw UnauthorizedException(message);
    }
  }

  static throwNotFound(message?: string): never {
    throw NotFoundException(message);
  }

  static throwNotFoundIf(condition: boolean, message?: string): never | void {
    if (condition) {
      throw NotFoundException(message);
    }
  }

  static throwBadRequest(message?: string): never {
    throw BadRequestException(message);
  }

  static throwBadRequestIf(condition: boolean, message?: string): never | void {
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
  ): never | void {
    if (condition) {
      throw InternalServerErrorException(message);
    }
  }
}
