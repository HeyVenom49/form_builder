import { z } from "zod";

const envSchema = z.object({
  /** Email provider. Extend this enum when you add more providers. */
  EMAIL_PROVIDER: z.enum(["resend"]).default("resend"),
  RESEND_API_KEY: z.string().min(1).optional(),
  /** e.g. "Form Builder <onboarding@resend.dev>" */
  EMAIL_FROM: z
    .string()
    .min(1)
    .default("Form Builder <onboarding@resend.dev>"),
  /** Frontend base URL used in email links. */
  APP_URL: z.url().default("http://localhost:3000"),
});

function createEnv(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    throw new Error(`Invalid @repo/services env: ${parsed.error.message}`);
  }

  return parsed.data;
}

export const env = createEnv(process.env);
