import { appendFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

import type { IngestPayload, LogEvent, LogLevel, LogService } from "./types";
import { logFileForDate, securityLogFile } from "./paths";

function sanitizeMeta(
  meta?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (
      lower.includes("password") ||
      lower.includes("token") ||
      lower.includes("secret") ||
      lower.includes("authorization") ||
      lower.includes("cookie")
    ) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function createLogEvent(
  payload: IngestPayload & { service: LogService; level: LogLevel },
): LogEvent {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    level: payload.level,
    service: payload.service,
    message: payload.message,
    requestId: payload.requestId,
    method: payload.method,
    path: payload.path,
    status: payload.status,
    durationMs: payload.durationMs,
    ip: payload.ip,
    userAgent: payload.userAgent,
    userId: payload.userId,
    error: payload.error,
    meta: sanitizeMeta(payload.meta),
    tags: payload.tags,
  };
}

export function writeLogEvent(event: LogEvent): void {
  const line = `${JSON.stringify(event)}\n`;
  appendFileSync(logFileForDate(), line, "utf8");
  if (event.level === "security" || event.tags?.includes("attack")) {
    appendFileSync(securityLogFile(), line, "utf8");
  }
}

export function writeLog(
  payload: IngestPayload & { service: LogService; level: LogLevel },
): LogEvent {
  const event = createLogEvent(payload);
  writeLogEvent(event);
  return event;
}
