import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  NODE_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
  BASE_URL: z.url().default("http://localhost:8000"),
  /** Browser origin allowed for credentialed CORS (cookies). */
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

function createEnv(source: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid @repo/api env: ${result.error.message}`);
  }
  return result.data;
}

export const env = createEnv(process.env);
