import { existsSync, watchFile } from "node:fs";
import { open } from "node:fs/promises";
import type { Server } from "node:http";

import { createLogger } from "./logger";
import { logFileForDate, logsDir } from "./paths";
import { isLoggerHealthy, startIngestServer } from "./server";
import type { LogEvent } from "./types";

const PORT = Number(process.env.LOGGER_PORT ?? 4319);
const COLORS: Record<string, string> = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  security: "\x1b[35m",
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

function printEvent(event: LogEvent) {
  const color = COLORS[event.level] ?? COLORS.info;
  const time = event.ts.slice(11, 19);
  const svc = event.service.padEnd(6);
  const status = event.status != null ? ` ${event.status}` : "";
  const path = event.path ? ` ${event.method ?? ""} ${event.path}` : "";
  const dur = event.durationMs != null ? ` ${event.durationMs}ms` : "";
  console.log(
    `${COLORS.dim}${time}${COLORS.reset} ${color}${COLORS.bold}${event.level.toUpperCase().padEnd(8)}${COLORS.reset} ${svc}${path}${status}${dur} — ${event.message}`,
  );
  if (event.error?.message) {
    console.log(`         ${COLORS.dim}${event.error.message}${COLORS.reset}`);
  }
  if (event.tags?.length) {
    console.log(
      `         ${COLORS.dim}tags: ${event.tags.join(", ")}${COLORS.reset}`,
    );
  }
}

async function tailFile(filePath: string) {
  if (!existsSync(filePath)) {
    await open(filePath, "a").then((h) => h.close());
  }

  let offset = 0;
  try {
    const handle = await open(filePath, "r");
    const stat = await handle.stat();
    offset = stat.size;
    await handle.close();
  } catch {
    offset = 0;
  }

  const flush = async () => {
    try {
      const handle = await open(filePath, "r");
      const stat = await handle.stat();
      if (stat.size < offset) offset = 0;
      if (stat.size > offset) {
        const length = stat.size - offset;
        const buffer = Buffer.alloc(length);
        await handle.read(buffer, 0, length, offset);
        offset = stat.size;
        const text = buffer.toString("utf8");
        for (const line of text.split("\n")) {
          if (!line.trim()) continue;
          try {
            printEvent(JSON.parse(line) as LogEvent);
          } catch {
            console.log(line);
          }
        }
      }
      await handle.close();
    } catch {
      /* file may rotate */
    }
  };

  watchFile(filePath, { interval: 400 }, () => {
    void flush();
  });
}

async function ensureIngest(port: number): Promise<Server | null> {
  if (await isLoggerHealthy(port)) {
    console.log(
      `[logger] ingest already running on http://localhost:${port} — attaching tail only`,
    );
    return null;
  }

  try {
    return await startIngestServer(port);
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code)
        : "";

    if (code === "EADDRINUSE") {
      // Race: another process bound the port between health check and listen.
      if (await isLoggerHealthy(port)) {
        console.log(
          `[logger] ingest became ready on http://localhost:${port} — attaching tail only`,
        );
        return null;
      }
      console.error(
        `[logger] port ${port} is in use by something else. Set LOGGER_PORT or free the port.`,
      );
      process.exit(1);
    }

    throw err;
  }
}

async function main() {
  const log = createLogger({ service: "logger" });
  const server = await ensureIngest(PORT);

  const file = logFileForDate();
  console.log(`[logger] writing to ${logsDir()}`);
  console.log(`[logger] tailing ${file}`);
  log.info("Logger service started", {
    meta: { port: PORT, file, ingestOwned: Boolean(server) },
    tags: ["startup"],
  });

  await tailFile(file);

  const shutdown = () => {
    log.info("Logger service stopping", { tags: ["shutdown"] });
    if (server) {
      server.close(() => process.exit(0));
      return;
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
