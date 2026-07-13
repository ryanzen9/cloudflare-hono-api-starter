import { HTTPException } from "hono/http-exception";

export const UnauthorizedException = (message = "Unauthorized") =>
  new HTTPException(401, { message });

export const NotFoundException = (message = "Not Found") =>
  new HTTPException(404, { message });

export const BadRequestException = (message = "Bad Request") =>
  new HTTPException(400, { message });

export const InternalServerErrorException = (
  message = "Internal Server Error"
) => new HTTPException(500, { message });
