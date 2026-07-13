import { describe, expect, it } from "vitest";
import {
  genInitUser,
  jsonHeaders,
  login,
  registerUser,
  request
} from "../../request";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    message: string;
  };
}

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

describe("Auth API", () => {
  it("rejects duplicate credentials without creating incomplete users", async () => {
    const user = genInitUser();
    const registerResponse = await registerUser(user);
    expect(registerResponse.status).toBe(201);

    const registerData = (await registerResponse.json()) as ApiSuccess<{
      userId: number;
      username: string;
      token: string;
    }>;

    const duplicateEmailUser = {
      ...genInitUser(),
      email: user.email
    };
    const duplicateEmailResponse = await registerUser(duplicateEmailUser);
    expect(duplicateEmailResponse.status).toBe(400);
    await expect(duplicateEmailResponse.json()).resolves.toMatchObject({
      success: false,
      error: { message: "Email already exists" }
    } satisfies ApiError);

    const duplicateUsernameUser = {
      ...genInitUser(),
      username: user.username
    };
    const duplicateUsernameResponse = await registerUser(duplicateUsernameUser);
    expect(duplicateUsernameResponse.status).toBe(400);
    await expect(duplicateUsernameResponse.json()).resolves.toMatchObject({
      success: false,
      error: { message: "Username already exists" }
    } satisfies ApiError);

    const duplicateEmailLoginResponse = await login(duplicateEmailUser);
    expect(duplicateEmailLoginResponse.status).toBe(401);

    const usersResponse = await request("/api/users", {
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${registerData.data.token}`
      }
    });
    expect(usersResponse.status).toBe(200);
    const users = (await usersResponse.json()) as ApiSuccess<User[]>;

    expect(users.data).toContainEqual(
      expect.objectContaining({
        id: registerData.data.userId,
        email: user.email
      })
    );
    expect(
      users.data.some(
        (candidate) => candidate.email === duplicateUsernameUser.email
      )
    ).toBe(false);
  });
});
