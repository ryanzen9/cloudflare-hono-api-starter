import { describe, expect, it } from "vitest";
import { jsonHeaders, login, request, requestWithEnv } from "../../request";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

describe("User API", async () => {
  const loginResponse = await login();
  expect(loginResponse.status).toBe(201);
  const loginData: ApiSuccess<{ token: string }> = await loginResponse.json();
  expect(loginData.success).toBe(true);
  const headers = {
    ...jsonHeaders,
    Authorization: `Bearer ${loginData.data.token}`
  };

  it("creates, queries, updates, and deletes a user", async () => {
    const createResponse = await request("/api/users", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        name: "Test User",
        age: 30,
        email: "test-user@example.com"
      })
    });

    expect(createResponse.status).toBe(201);
    const createdUser = (await createResponse.json()) as ApiSuccess<User>;

    const detailResponse = await requestWithEnv(
      `/api/users/${createdUser.data.id}`,
      {
        headers: headers
      }
    );
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toEqual({
      success: true,
      data: createdUser.data
    });

    const updateResponse = await request(`/api/users/${createdUser.data.id}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ age: 31 })
    });
    const updatedUser = (await updateResponse.json()) as ApiSuccess<User>;
    expect(updatedUser.data.age).toBe(31);

    const deleteResponse = await request(
      `/api/users/${createdUser.data.id}/delete`,
      { method: "POST", headers: headers }
    );
    expect(deleteResponse.status).toBe(200);

    const deletedUserResponse = await request(
      `/api/users/${createdUser.data.id}`,
      { headers: headers }
    );
    expect(deletedUserResponse.status).toBe(404);
  });
});
