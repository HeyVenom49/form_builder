import { z } from "zod";
import { emailSchema } from "../utils/email";

const passwordSchema = z
  .string()
  .min(6, { message: "Password must contain at least 6 characters" })
  .describe("Password of the user");

export const createUserWithEmailAndPasswordInput = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must contain at least 3 characters" })
    .describe("Display name of the user"),
  email: emailSchema.describe("Email of the user"),
  password: passwordSchema,
});

export type CreateUserWithEmailAndPasswordType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const loginWithEmailAndPasswordInput = z.object({
  email: emailSchema.describe("Email of the user"),
  password: passwordSchema,
});

export type LoginWithEmailAndPasswordType = z.infer<
  typeof loginWithEmailAndPasswordInput
>;

export const changePasswordInput = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export type ChangePasswordType = z.infer<typeof changePasswordInput>;

export const requestPasswordResetInput = z.object({
  email: emailSchema,
});

export type RequestPasswordResetType = z.infer<typeof requestPasswordResetInput>;

export const resetPasswordInput = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export type ResetPasswordType = z.infer<typeof resetPasswordInput>;

export const verifyEmailInput = z.object({
  token: z.string().min(1),
});

export type VerifyEmailType = z.infer<typeof verifyEmailInput>;

export const sessionMetaSchema = z
  .object({
    ipAddress: z.string().trim().min(1).optional(),
    userAgent: z.string().trim().min(1).optional(),
  })
  .optional();

export type SessionMeta = z.infer<typeof sessionMetaSchema>;

/** Safe user shape returned by auth (no secrets). */
export const publicUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  username: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(["USER", "ADMIN"]),
  themeMode: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  emailVerifiedAt: z.coerce.date().nullable(),
});

export type PublicUser = z.infer<typeof publicUserSchema>;
