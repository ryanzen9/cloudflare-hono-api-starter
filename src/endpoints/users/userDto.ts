import { insertUserSchema, selectUserSchema } from "./userSchema";

export const pageUserDto = selectUserSchema.pick({
  id: true,
  name: true,
  age: true,
  email: true
});

export const userDto = selectUserSchema.pick({
  id: true,
  name: true,
  age: true,
  email: true
});

export const insertUserDto = insertUserSchema.pick({
  name: true,
  age: true,
  email: true
});

export const updateUserDto = insertUserDto.partial();
