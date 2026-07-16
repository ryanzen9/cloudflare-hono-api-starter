import { createAppFromFactory, createOpenApiFromFactory } from "./app";
import { config } from "./config";
import { AIHealth } from "./endpoints/ai/health";
import { GithubLoginCallback } from "./endpoints/auth/github-login-callback";
import { GithubLoginStart } from "./endpoints/auth/github-login-start";
import { Login } from "./endpoints/auth/login";
import { Register } from "./endpoints/auth/register";
import { Download } from "./endpoints/oss/download";
import { Upload } from "./endpoints/oss/upload";
import { TodoCreate } from "./endpoints/todos/todoCreate";
import { TodoDelete } from "./endpoints/todos/todoDelete";
import { TodoDetail } from "./endpoints/todos/todoDetail";
import { TodoList } from "./endpoints/todos/todoList";
import { TodoUpdate } from "./endpoints/todos/todoUpdate";
import { D1BackUpTrigger } from "./endpoints/trigger/d1-backup";
import { UserDelete } from "./endpoints/users/userDelete";
import { UserDetail } from "./endpoints/users/userDetail";
import { UserList } from "./endpoints/users/userList";
import { UserTodoList } from "./endpoints/users/userTodoList";
import { UserUpdate } from "./endpoints/users/userUpdate";

const packageJson = await import("../package.json");

const app = createAppFromFactory(config);
app.get("/", (c) => c.redirect("/docs"));
app.get("/health", (c) => c.json({ message: "ok" }));
app.get("/ai/health", AIHealth);
app.get("/trigger/d1-backup", D1BackUpTrigger);
app.get("/auth/github/login-start", GithubLoginStart);
app.get("/auth/github/login/callback", GithubLoginCallback);

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

openapi.get("/api/download/:key", Download);
openapi.post("/api/upload", Upload);

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

export * from "./agents";
export * from "./workflows";

export default app;
