import { beforeAll, describe, expect, it } from "vitest";
import {
  genInitUser,
  jsonHeaders,
  login,
  registerUser,
  request,
  requestWithEnv
} from "../../request";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

describe("User API", async () => {
  let headers: Record<string, string>;
  let userId: number | null = null;
  let user: null | ReturnType<typeof genInitUser> = null;
  beforeAll(async () => {
    user = genInitUser();

    const registerResponse = await registerUser(user);
    expect(registerResponse.status).toBe(201);

    const loginResponse = await login(user);
    expect(loginResponse.status).toBe(201);

    const loginData: ApiSuccess<{
      token: string;
      userId: number;
      username: string;
    }> = await loginResponse.json();
    userId = loginData.data.userId;

    headers = {
      ...jsonHeaders,
      Authorization: `Bearer ${loginData.data.token}`
    };
  });

  it("creates, queries, updates, and deletes a user", async () => {
    const detailResponse = await requestWithEnv(`/api/users/${userId}`, {
      headers: headers
    });
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toEqual({
      success: true,
      data: {
        id: userId,
        name: user!.name,
        age: user!.age,
        email: user!.email
      }
    });

    const updateResponse = await request(`/api/users/${userId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ age: 31 })
    });
    const updatedUser = (await updateResponse.json()) as ApiSuccess<any>;
    expect(updatedUser.data.age).toBe(31);

    const deleteResponse = await request(`/api/users/delete`, {
      method: "POST",
      headers: headers
    });
    expect(deleteResponse.status).toBe(200);

    const deletedUserResponse = await request(`/api/users/${userId}`, {
      headers: headers
    });
    expect(deletedUserResponse.status).toBe(404);
  });
});
