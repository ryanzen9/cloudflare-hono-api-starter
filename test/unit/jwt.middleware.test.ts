import { sign } from "hono/jwt";
import { describe, expect, it } from "vitest";
import { createAppFromFactory } from "../../src/app";
import { JWTAuthMiddleware } from "../../src/libs/auth/middlewares";

const JWT_SECRET = "test-jwt-secret";

const app = createAppFromFactory((app) => {
  app.use("/api/*", JWTAuthMiddleware({ ignorePath: ["/api/login"] }));
});

app.get("/api/protected", (c) =>
  c.json({ ok: true, jwtPayload: c.get("jwtPayload") })
);
app.get("/api/login", (c) => c.json({ ignored: true }));
app.get("/api/login/extra", (c) => c.json({ ignored: false }));

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

  it("allows an exact ignored path without a JWT", async () => {
    const response = await request("/api/login");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ignored: true });
  });

  it("does not ignore a path that only shares the configured prefix", async () => {
    const response = await request("/api/login/extra");

    expect(response.status).toBe(401);
  });
});
