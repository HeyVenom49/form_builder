import http from "node:http";
import { env } from "./env";

async function init() {
  try {
    const server = http.createServer();

    server.listen(env.PORT, () => {
      console.log();
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
init();
