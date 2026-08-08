import { z } from "zod";
import { emailSchema } from "../../utils/email";

/**
 * Route API contract for auth.
 * Independent of @repo/services — services own domain validation separately.
 */

const passwordSchema = z
  .string()
  .min(6, { message: "Password must contain at least 6 characters" });

export const meOutput = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  username: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(["USER", "ADMIN"]),
  themeMode: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  emailVerifiedAt: z.coerce.date().nullable(),
});

export const createUserWithEmailAndPasswordInput = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must contain at least 3 characters" }),
  email: emailSchema,
  password: passwordSchema,
});

export const loginWithEmailAndPasswordInput = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const createUserWithEmailAndPasswordOutput = z.object({
  id: z.uuid(),
  user: meOutput,
});

export const loginWithEmailAndPasswordOutput = z.object({
  id: z.uuid(),
  user: meOutput,
});

export const logoutOutput = z.object({
  ok: z.literal(true),
});

export const changePasswordInput = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const changePasswordOutput = z.object({
  ok: z.literal(true),
});

export const requestPasswordResetInput = z.object({
  email: emailSchema,
});

export const requestPasswordResetOutput = z.object({
  ok: z.literal(true),
});

export const resetPasswordInput = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const resetPasswordOutput = z.object({
  ok: z.literal(true),
});

export const requestEmailVerificationOutput = z.object({
  ok: z.literal(true),
  alreadyVerified: z.boolean(),
});

export const verifyEmailInput = z.object({
  token: z.string().min(1),
});

export const verifyEmailOutput = z.object({
  ok: z.literal(true),
});

export type CreateUserWithEmailAndPasswordInput = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;
export type LoginWithEmailAndPasswordInput = z.infer<
  typeof loginWithEmailAndPasswordInput
>;
export type CreateUserWithEmailAndPasswordOutput = z.infer<
  typeof createUserWithEmailAndPasswordOutput
>;
export type LoginWithEmailAndPasswordOutput = z.infer<
  typeof loginWithEmailAndPasswordOutput
>;
export type LogoutOutput = z.infer<typeof logoutOutput>;
export type MeOutput = z.infer<typeof meOutput>;
export type ChangePasswordInput = z.infer<typeof changePasswordInput>;
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetInput
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;
export type VerifyEmailInput = z.infer<typeof verifyEmailInput>;
