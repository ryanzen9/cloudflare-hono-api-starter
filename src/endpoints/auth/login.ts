import { OpenAPIRoute } from "chanfana";
import { getDB } from "../../db/dao";
import { AuthQueries, UserQueries } from "../../db/queries";

import { z } from "zod";
import { JwtPayload, jwtSign } from "../../libs/auth/jwt";
import { Assert } from "../../libs/error";
import { AppContext } from "../../types";
import { ApiRes, RequestBody, ResponseObjectBody } from "../rest";

const loginDto = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const loginResDto = z.object({
  userId: z.number(),
  username: z.string(),
  token: z.string()
});

export class Login extends OpenAPIRoute {
  schema = {
    tags: ["Auth"],
    summary: "Login a user",
    request: RequestBody(loginDto),
    responses: ResponseObjectBody(loginResDto)
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();

    const { username, password } = data.body;

    const db = getDB(c.env);

    const auth = await AuthQueries.login(db, username, password);

    Assert.throwUnauthorizedIf(!auth);

    const userId = auth!.userId;
    const user = await UserQueries.findById(db, userId);

    Assert.throwBadRequestIf(!user, "User not found");

    const jwtSecret = c.env.JWT_SECRET;

    const payload: JwtPayload = {
      sub: auth!.id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: {
        userId: user!.id,
        username: auth!.username
      }
    };

    const token = await jwtSign(payload, jwtSecret);

    const result = loginResDto.parse({
      token,
      userId: user!.id,
      username: auth!.username
    });

    return c.json(ApiRes.success(result), 201);
  }
}
