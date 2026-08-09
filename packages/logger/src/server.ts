import { createServer, type Server } from "node:http";
import { z } from "zod";

import { createLogEvent, writeLogEvent } from "./write";
import type { IngestPayload } from "./types";

const ingestSchema = z.object({
  level: z
    .enum(["debug", "info", "warn", "error", "security"])
    .optional()
    .default("info"),
  service: z.enum(["api", "web", "logger", "system"]).optional().default("web"),
  message: z.string().min(1).max(4000),
  requestId: z.string().optional(),
  method: z.string().optional(),
  path: z.string().optional(),
  status: z.number().int().optional(),
  durationMs: z.number().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string().nullable().optional(),
  error: z
    .object({
      name: z.string().optional(),
      message: z.string(),
      stack: z.string().optional(),
    })
    .optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function isLoggerHealthy(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(800),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { service?: string };
    return body.service === "logger";
  } catch {
    return false;
  }
}

export function startIngestServer(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, service: "logger" }));
        return;
      }

      if (req.method === "POST" && req.url === "/ingest") {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const raw = Buffer.concat(chunks).toString("utf8");
          const json = raw ? JSON.parse(raw) : {};
          const parsed = ingestSchema.safeParse(json);
          if (!parsed.success) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Invalid payload" }));
            return;
          }

          const payload = parsed.data as IngestPayload & {
            level: NonNullable<IngestPayload["level"]>;
            service: NonNullable<IngestPayload["service"]>;
          };

          const event = createLogEvent({
            ...payload,
            level: payload.level ?? "info",
            service: payload.service ?? "web",
            message: payload.message,
          });
          writeLogEvent(event);

          res.writeHead(202, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, id: event.id }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : "Ingest failed",
            }),
          );
        }
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Not found" }));
    });

    server.once("error", (err) => {
      reject(err);
    });

    server.listen(port, () => {
      console.log(`[logger] ingest listening on http://localhost:${port}`);
      console.log(`[logger]   POST /ingest`);
      console.log(`[logger]   GET  /health`);
      resolve(server);
    });
  });
}
