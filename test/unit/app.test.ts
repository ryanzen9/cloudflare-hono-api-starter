import { describe, expect, it } from "vitest";
import { createAppFromFactory } from "../../src/app";

describe("Hono app", () => {
  const app = createAppFromFactory();
  app.get("/", (c) => c.redirect("/docs"));
  app.get("/api/health", (c) => c.json({ message: "ok" }));

  it("responds to the health endpoint without a Worker binding", async () => {
    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "ok" });
  });

  it("request base path redirects to the docs", async () => {
    const response = await app.request("/");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/docs");
  });
});
