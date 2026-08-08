import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Keep workspace + runtime deps external; Bun resolves them at runtime.
  external: [/^@repo\//, "express", "cors", "cookie-parser", "@trpc/server", "trpc-to-openapi", "@scalar/express-api-reference", "zod"],
});
