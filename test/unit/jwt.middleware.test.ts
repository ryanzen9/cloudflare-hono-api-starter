import { sign } from "hono/jwt";
import { describe, expect, it } from "vitest";
import { JWTAuthMiddleware } from "../../src/libs/auth";
import { createApp } from "../app";

const JWT_SECRET = "test-jwt-secret";

const app = createApp();
app.use("/api/*", JWTAuthMiddleware({ ignorePath: ["/api/login"] }));
app.get("/api/protected", (c) =>
  c.json({ ok: true, jwtPayload: c.get("jwtPayload") })
);
app.get("/api/login", (c) => c.json({ ignored: true }));

const request = (
  url: string,
  authorization?: string,
  bindings: Pick<Env, "JWT_SECRET"> = {
    JWT_SECRET
  }
) =>
  app.request(
    url,
    authorization ? { headers: { Authorization: authorization } } : undefined,
    bindings as Env
  );

describe("JWTAuthMiddleware", () => {
  it("continues to allow a valid JWT", async () => {
    const token = await sign({ sub: "1" }, JWT_SECRET, "HS256");
    const response = await request("/api/protected", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      jwtPayload: { sub: "1" }
    });
  });

  it("rejects an invalid bearer token", async () => {
    const response = await request("/api/protected", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });
});
