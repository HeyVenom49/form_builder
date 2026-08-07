import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "Database is required")
    .describe("URL of the database"),
});

function createEnv(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    throw new Error(`Invalid @repo/database env: ${parsed.error.message}`);
  }

  return parsed.data;
}

export const env = createEnv(process.env);
