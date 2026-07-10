import { HTTPException } from "hono/http-exception";
import { ApiRes } from "./endpoints/rest";
import { AppContext } from "./types";

export const ErrorHandler = (err: Error, c: AppContext) => {
  if (err instanceof HTTPException) {
    if (err.status === 401) {
      return c.json(ApiRes.error(err.message), 401);
    }
    if (err.status === 404) {
      return c.json(ApiRes.error(err.message), 404);
    }
    if (err.status === 400) {
      return c.json(ApiRes.error(err.message), 400);
    }
    if (err.status === 500) {
      return c.json(ApiRes.error(err.message, err.stack), 500);
    }

    return err.getResponse();
  }
  console.error(err);
  return c.json(ApiRes.error(err.message, err.stack), 500);
};
