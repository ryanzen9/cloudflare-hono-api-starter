import { Hono } from "hono";
import { AppEnv } from "../src/types";

export const createApp = () => new Hono<AppEnv>();
