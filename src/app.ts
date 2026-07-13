import { fromHono, RouterOptions } from "chanfana";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { AppEnv } from "./types";

export function createAppFromFactory(
  initApp?: (app: Hono<AppEnv>) => void
): Hono<AppEnv> {
  return createFactory({
    initApp
  }).createApp();
}

export function createOpenApiFromFactory(
  app: Hono<AppEnv>,
  options?: RouterOptions
) {
  return fromHono(app, options);
}
