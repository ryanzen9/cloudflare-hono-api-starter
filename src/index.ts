import { fromHono } from "chanfana";
import { Hono } from "hono";
import { config } from "./config";
import { Login } from "./endpoints/auth/login";
import { TodoCreate } from "./endpoints/todos/todoCreate";
import { TodoDelete } from "./endpoints/todos/todoDelete";
import { TodoDetail } from "./endpoints/todos/todoDetail";
import { TodoList } from "./endpoints/todos/todoList";
import { TodoUpdate } from "./endpoints/todos/todoUpdate";
import { UserCreate } from "./endpoints/users/userCreate";
import { UserDelete } from "./endpoints/users/userDelete";
import { UserDetail } from "./endpoints/users/userDetail";
import { UserList } from "./endpoints/users/userList";
import { UserTodoList } from "./endpoints/users/userTodoList";
import { UserUpdate } from "./endpoints/users/userUpdate";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

config(app);

const packageJson = await import("../package.json");

const openapi = fromHono(app, {
  docs_url: "/docs",
  schema: {
    info: {
      title: packageJson.default.name,
      version: packageJson.default.version
    },
    security: [{ bearerAuth: [] }]
  }
});

openapi.registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT"
});

app.get("/", (c) => c.redirect("/docs"));
app.get("/api/health", (c) => c.json({ message: "ok" }));

openapi.post("/api/login", Login);

openapi.get("/api/users", UserList);
openapi.post("/api/users", UserCreate);
openapi.get("/api/users/todos", UserTodoList);
openapi.get("/api/users/:id", UserDetail);
openapi.post("/api/users/:id", UserUpdate);
openapi.post("/api/users/:id/delete", UserDelete);

openapi.get("/api/todos", TodoList);
openapi.post("/api/todos", TodoCreate);
openapi.get("/api/todos/:id", TodoDetail);
openapi.post("/api/todos/:id", TodoUpdate);
openapi.post("/api/todos/:id/delete", TodoDelete);

export default app;
