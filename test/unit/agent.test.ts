import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { CounterAgent } from "../../src/agents/counter";
import { request, requestWithFetch } from "../request";

describe("make a request to my Agent", () => {
  const path = "/agents/counter-agent/agent-123";
  const url = new URL(path, "https://example.com");

  // Unit testing approach
  it("responds with state", async () => {
    const req = new Request<unknown, IncomingRequestCfProperties>(url);
    const response = await requestWithFetch(req);
    const data: { count: number; url: string } = await response.json();
    expect(data.url).toBe(url.toString());
    expect(data).toHaveProperty("count");
    expect(data.count).toBe(0);
  });

  it("also responds with state", async () => {
    const response = await request(path);
    const data: {
      count: number;
      url: string;
    } = await response.json();
    expect(data.url).toBe(url.toString());
    expect(data).toHaveProperty("count");
    expect(data.count).toBe(0);
  });
});

describe("CounterAgent RPC", () => {
  const path = "/agents/counter-agent/agent-123";
  const url = new URL(path, "https://example.com");

  it("increments and decrements state through RPC", async () => {
    const counterNamespace =
      env.CounterAgent as unknown as DurableObjectNamespace<CounterAgent>;
    const agent = await counterNamespace.getByName("agent-123");

    const req = new Request<unknown, IncomingRequestCfProperties>(url);
    const response = await requestWithFetch(req);
    const data: { count: number; url: string } = await response.json();
    expect(data).toHaveProperty("count");
    expect(data.count).toBe(0);

    expect(await agent.increment()).toBe(1);
    expect(await agent.increment()).toBe(2);
    expect(await agent.decrement()).toBe(1);

    const response2 = await requestWithFetch(req);
    const data2: { count: number; url: string } = await response2.json();
    expect(data2).toHaveProperty("count");
    expect(data2.count).toBe(1);
  });
});
