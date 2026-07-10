import { describe, expect, it } from "vitest";
import app from "../../src";

describe("Hono app", () => {
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
