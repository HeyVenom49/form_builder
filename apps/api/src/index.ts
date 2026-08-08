import { createServer } from "node:http";
import { env } from "./env";
import { app } from "./server";

function main() {
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`API listening on ${env.BASE_URL}`);
    console.log(`  health   ${env.BASE_URL}/health`);
    console.log(`  openapi  ${env.BASE_URL}/doc`);
    console.log(`  trpc     ${env.BASE_URL}/trpc`);
    console.log(`  rest     ${env.BASE_URL}/api`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down`);
    server.close((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
