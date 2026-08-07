import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(1).describe("JWT_SECRET of the server"),
});

function createEnv(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    throw new Error(`Invalid @repo/services env: ${parsed.error.message}`);
  }

  return parsed.data;
}

export const env = createEnv(process.env);
