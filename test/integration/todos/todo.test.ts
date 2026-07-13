import { beforeAll, describe, expect, it } from "vitest";
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

interface Todo {
  id: number;
  title: string;
  completed: number;
  userId: number;
  description: string | null;
  scheduleAt: string | null;
  completedAt: string | null;
}

describe("Todo API", async () => {
  let headers: Record<string, string>;
  let registrationHeaders: Record<string, string>;
  let anotherUserHeaders: Record<string, string>;
  let userId: number;

  beforeAll(async () => {
    const user = genInitUser();

    const registerResponse = await registerUser(user);
    expect(registerResponse.status).toBe(201);
    const registerData: ApiSuccess<{
      userId: number;
      username: string;
      token: string;
    }> = await registerResponse.json();
    registrationHeaders = {
      ...jsonHeaders,
      Authorization: `Bearer ${registerData.data.token}`
    };

    const loginResponse = await login(user);
    expect(loginResponse.status).toBe(201);

    const loginData: ApiSuccess<{
      userId: number;
      username: string;
      token: string;
    }> = await loginResponse.json();

    userId = loginData.data.userId;
    headers = {
      ...jsonHeaders,
      Authorization: `Bearer ${loginData.data.token}`
    };

    const anotherUser = genInitUser();
    const anotherRegisterResponse = await registerUser(anotherUser);
    expect(anotherRegisterResponse.status).toBe(201);

    const anotherLoginResponse = await login(anotherUser);
    expect(anotherLoginResponse.status).toBe(201);
    const anotherLoginData: ApiSuccess<{ token: string }> =
      await anotherLoginResponse.json();
    anotherUserHeaders = {
      ...jsonHeaders,
      Authorization: `Bearer ${anotherLoginData.data.token}`
    };
  });

  it("creates, queries, updates, and deletes a todo for a user", async () => {
    const createTodoResponse = await request("/api/todos", {
      method: "POST",
      headers: registrationHeaders,
      body: JSON.stringify({
        title: "Test todo",
        description: "Created by a Worker test"
      })
    });

    expect(createTodoResponse.status).toBe(201);
    const createdTodos = (await createTodoResponse.json()) as ApiSuccess<
      Todo[]
    >;
    const createdTodo = createdTodos.data[0];
    if (!createdTodo) {
      throw new Error("Todo creation did not return a todo");
    }

    const detailResponse = await request(`/api/todos/${createdTodo.id}`, {
      headers: headers
    });
    expect(detailResponse.status).toBe(200);
    const detailedTodo = (await detailResponse.json()) as ApiSuccess<Todo>;
    expect(detailedTodo.data.userId).toBe(userId);

    const userTodosResponse = await request(`/api/users/todos`, {
      headers: headers
    });
    expect(userTodosResponse.status).toBe(200);
    const userTodos = (await userTodosResponse.json()) as ApiSuccess<Todo[]>;
    expect(userTodos.data).toHaveLength(1);
    expect(userTodos.data[0]?.title).toBe("Test todo");

    const updateTodoResponse = await request(`/api/todos/${createdTodo.id}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        completed: 1,
        completedAt: "2026-07-10T00:00:00.000Z"
      })
    });
    const updatedTodo = (await updateTodoResponse.json()) as ApiSuccess<Todo>;
    expect(updatedTodo.data.completed).toBe(1);

    const deleteTodoResponse = await request(
      `/api/todos/${createdTodo.id}/delete`,
      { method: "POST", headers: headers }
    );
    expect(deleteTodoResponse.status).toBe(200);

    const deletedTodoResponse = await request(`/api/todos/${createdTodo.id}`, {
      headers: headers
    });
    expect(deletedTodoResponse.status).toBe(404);
  });

  it("prevents another user from accessing a todo they do not own", async () => {
    const createTodoResponse = await request("/api/todos", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Private todo",
        description: "Only the owner may access this todo"
      })
    });
    expect(createTodoResponse.status).toBe(201);

    const createdTodos = (await createTodoResponse.json()) as ApiSuccess<
      Todo[]
    >;
    const createdTodo = createdTodos.data[0];
    if (!createdTodo) {
      throw new Error("Todo creation did not return a todo");
    }

    const detailResponse = await request(`/api/todos/${createdTodo.id}`, {
      headers: anotherUserHeaders
    });
    const updateResponse = await request(`/api/todos/${createdTodo.id}`, {
      method: "POST",
      headers: anotherUserHeaders,
      body: JSON.stringify({ title: "Unauthorized update" })
    });
    const deleteResponse = await request(
      `/api/todos/${createdTodo.id}/delete`,
      {
        method: "POST",
        headers: anotherUserHeaders
      }
    );
    const ownerDetailResponse = await request(`/api/todos/${createdTodo.id}`, {
      headers
    });

    expect({
      detail: detailResponse.status,
      update: updateResponse.status,
      delete: deleteResponse.status,
      ownerDetail: ownerDetailResponse.status
    }).toEqual({
      detail: 401,
      update: 401,
      delete: 401,
      ownerDetail: 200
    });
  });
});
