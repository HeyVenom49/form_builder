import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  NODE_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
  BASE_URL: z.url().default("http://localhost:8000"),
});

function createEnv(source: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error("Something missing in env");
  }
  return result.data;
}

export const env = createEnv(process.env);
