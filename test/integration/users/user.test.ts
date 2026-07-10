import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

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

const jsonHeaders = { "content-type": "application/json" };

const request = (path: string, init?: RequestInit) =>
  exports.default.fetch(new Request(`https://example.com${path}`, init));

describe("User API", () => {
  it("creates, queries, updates, and deletes a user", async () => {
    const createResponse = await request("/api/users", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        name: "Test User",
        age: 30,
        email: "test-user@example.com"
      })
    });

    expect(createResponse.status).toBe(201);
    const createdUser = (await createResponse.json()) as ApiSuccess<User>;

    const detailResponse = await request(`/api/users/${createdUser.data.id}`);
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toEqual({
      success: true,
      data: createdUser.data
    });

    const updateResponse = await request(`/api/users/${createdUser.data.id}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ age: 31 })
    });
    const updatedUser = (await updateResponse.json()) as ApiSuccess<User>;
    expect(updatedUser.data.age).toBe(31);

    const deleteResponse = await request(
      `/api/users/${createdUser.data.id}/delete`,
      { method: "POST" }
    );
    expect(deleteResponse.status).toBe(200);

    const deletedUserResponse = await request(
      `/api/users/${createdUser.data.id}`
    );
    expect(deletedUserResponse.status).toBe(404);
  });
});
