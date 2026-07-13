import { createAppFromFactory, createOpenApiFromFactory } from "./app";
import { config } from "./config";
import { Login } from "./endpoints/auth/login";
import { Register } from "./endpoints/auth/register";
import { TodoCreate } from "./endpoints/todos/todoCreate";
import { TodoDelete } from "./endpoints/todos/todoDelete";
import { TodoDetail } from "./endpoints/todos/todoDetail";
import { TodoList } from "./endpoints/todos/todoList";
import { TodoUpdate } from "./endpoints/todos/todoUpdate";
import { UserDelete } from "./endpoints/users/userDelete";
import { UserDetail } from "./endpoints/users/userDetail";
import { UserList } from "./endpoints/users/userList";
import { UserTodoList } from "./endpoints/users/userTodoList";
import { UserUpdate } from "./endpoints/users/userUpdate";

const packageJson = await import("../package.json");

const app = createAppFromFactory(config);
app.get("/", (c) => c.redirect("/docs"));
app.get("/api/health", (c) => c.json({ message: "ok" }));

const openapi = createOpenApiFromFactory(app, {
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

openapi.post("/api/login", Login);
openapi.post("/api/register", Register);

openapi.get("/api/users", UserList);
openapi.get("/api/users/todos", UserTodoList);
openapi.get("/api/users/:id", UserDetail);
openapi.post("/api/users/delete", UserDelete);
openapi.post("/api/users/:id", UserUpdate);

openapi.get("/api/todos", TodoList);
openapi.post("/api/todos", TodoCreate);
openapi.get("/api/todos/:id", TodoDetail);
openapi.post("/api/todos/:id", TodoUpdate);
openapi.post("/api/todos/:id/delete", TodoDelete);

export default app;
