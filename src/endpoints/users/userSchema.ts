import { usersTable } from "../../db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from "../../db/zod";

const userOasDefine = {
  id: (schema: any) =>
    schema.openapi({
      description: "The unique identifier of the user",
      example: 1,
      type: "number"
    }),
  name: (schema: any) =>
    schema.openapi({
      description: "The name of the user",
      example: "John Doe",
      type: "string"
    }),
  age: (schema: any) =>
    schema.openapi({
      description: "The age of the user",
      example: 30,
      type: "number"
    }),
  email: (schema: any) =>
    schema.openapi({
      description: "The email of the user",
      example: "user@example.com",
      type: "string"
    })
};

export const selectUserSchema = createSelectSchema(usersTable, userOasDefine);

export const insertUserSchema = createInsertSchema(
  usersTable,
  userOasDefine
).omit({
  id: true
});

export const updateUserSchema = createUpdateSchema(usersTable, userOasDefine);
