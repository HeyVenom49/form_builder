import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z
    .string()
    .min(3, { message: "Username must contains at least 3 characters" })
    .describe("username of the user"),
  email: z.email().trim().toLowerCase().describe("email of the user"),
  password: z
    .string()
    .min(6, { message: "Password must contains at least 6 characters" })
    .describe("password of the user"),
});

export type CreateUserWithEmailAndPasswordType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;
