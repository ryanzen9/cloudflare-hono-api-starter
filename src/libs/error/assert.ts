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
  ) {
    throw new HTTPException(status, { message, cause });
  }

  static throwIf(
    condition: boolean,
    status: ContentfulStatusCode,
    message?: string,
    cause?: unknown
  ) {
    if (condition) {
      throw new HTTPException(status, { message, cause });
    }
  }

  static throwUnauthorized(message?: string) {
    throw UnauthorizedException(message);
  }

  static throwUnauthorizedIf(condition: boolean, message?: string) {
    if (condition) {
      throw UnauthorizedException(message);
    }
  }

  static throwNotFound(message?: string) {
    throw NotFoundException(message);
  }

  static throwNotFoundIf(condition: boolean, message?: string) {
    if (condition) {
      throw NotFoundException(message);
    }
  }

  static throwBadRequest(message?: string) {
    throw BadRequestException(message);
  }

  static throwBadRequestIf(condition: boolean, message?: string) {
    if (condition) {
      throw BadRequestException(message);
    }
  }

  static throwInternalServerError(message?: string) {
    throw InternalServerErrorException(message);
  }

  static throwInternalServerErrorIf(condition: boolean, message?: string) {
    if (condition) {
      throw InternalServerErrorException(message);
    }
  }
}
