import { createServer } from "node:http";
import { createLogger } from "@repo/logger";
import { env } from "./env";
import { app } from "./server";

const log = createLogger({ service: "api" });

function main() {
  const server = createServer(app);

  server.listen(env.PORT, () => {
    log.info("API listening", {
      meta: { port: env.PORT, baseUrl: env.BASE_URL },
      tags: ["startup"],
    });
    console.log(`API listening on ${env.BASE_URL}`);
    console.log(`  health   ${env.BASE_URL}/health`);
    console.log(`  openapi  ${env.BASE_URL}/doc`);
    console.log(`  trpc     ${env.BASE_URL}/trpc`);
    console.log(`  rest     ${env.BASE_URL}/api`);
  });

  const shutdown = (signal: string) => {
    log.info("API shutting down", { meta: { signal }, tags: ["shutdown"] });
    console.log(`\n${signal} received — shutting down`);
    server.close((err) => {
      if (err) {
        log.error("Shutdown error", { error: err });
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
  log.error("API failed to start", { error: err, tags: ["fatal"] });
  console.error(err);
  process.exit(1);
}
