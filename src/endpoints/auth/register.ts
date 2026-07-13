import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { AuthQueries } from "../../db/queries";

import { z } from "zod";
import { jwtSign } from "../../libs/auth/jwt";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { ApiRes, RequestBody, ResponseObjectBody } from "../rest";
import { insertUserDto } from "../users/userDto";

const registerDto = z
  .object({
    username: z.string().min(8).openapi({
      description:
        "The username for the new user. Must be at least 8 characters long.",
      example: "testuser"
    }),
    password: z.string().min(8).openapi({
      description:
        "The password for the new user. Must be at least 8 characters long.",
      example: "testpassword"
    })
  })
  .extend(insertUserDto.shape);

const registerResDto = z.object({
  userId: z.number(),
  username: z.string(),
  token: z.string()
});

export class Register extends OpenAPIRoute {
  schema = {
    tags: ["Auth"],
    summary: "Register a new user",
    request: RequestBody(registerDto),
    responses: ResponseObjectBody(registerResDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { username, password, name, age, email } = data.body;

    const db = getDB(c.env);

    const { user, auth } = await AuthQueries.registerAccount(db, {
      username,
      password,
      name,
      age,
      email
    });

    Assert.throwBadRequestIf(!user || !auth, "Failed to register user");

    const token = await jwtSign(
      {
        sub: auth!.id.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          userId: user!.id.toString(),
          username: auth!.username
        }
      },
      c.env.JWT_SECRET
    );

    const result = registerResDto.parse({
      token,
      userId: user!.id,
      username: auth!.username
    });

    return c.json(ApiRes.success(result), 201);
  }
}
