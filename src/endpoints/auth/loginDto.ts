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

export const githubLoginDto = z.object({
  code: z.string().optional().openapi({
    description: "The authorization code returned by GitHub",
    example: "1234567890abcdef"
  }),
  state: z.string().optional().openapi({
    description: "The state parameter to prevent CSRF attacks",
    example: "random_state_string"
  })
});

export const githubCallbackQueryDto = z.object({
  code: z.string().openapi({
    description: "The authorization code returned by GitHub",
    example: "1234567890abcdef"
  }),
  state: z.string().openapi({
    description: "The state parameter to prevent CSRF attacks",
    example: "random_state_string"
  })
});
