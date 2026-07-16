import { z } from "zod";

export const loginDto = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const loginResDto = z.object({
  userId: z.number(),
  username: z.string(),
  token: z.string()
});
