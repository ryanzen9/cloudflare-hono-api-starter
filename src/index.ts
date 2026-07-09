import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TodoCreate } from "./endpoints/todos/todoCreate";
import { TodoList } from "./endpoints/todos/todoList";
import { UserCreate } from "./endpoints/users/userCreate";
import { UserList } from "./endpoints/users/userList";

const app = new Hono<{ Bindings: Env }>();

const openapi = fromHono(app, {
  docs_url: "/docs"
});

app.get("/", (c) => c.redirect("/docs"));
app.get("/api/health", (c) => c.json({ message: "ok" }));

openapi.get("/api/users", UserList);
openapi.post("/api/users", UserCreate);

openapi.get("/api/todos", TodoList);
openapi.post("/api/todos", TodoCreate);

export default app;
