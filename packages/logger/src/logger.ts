import type { LogLevel, LogService } from "./types";
import { writeLog } from "./write";

export type LoggerOptions = {
  service: LogService;
  defaultMeta?: Record<string, unknown>;
};

export function createLogger(options: LoggerOptions) {
  const base = options.defaultMeta ?? {};

  function log(
    level: LogLevel,
    message: string,
    extra?: {
      requestId?: string;
      method?: string;
      path?: string;
      status?: number;
      durationMs?: number;
      ip?: string;
      userAgent?: string;
      userId?: string | null;
      error?: unknown;
      meta?: Record<string, unknown>;
      tags?: string[];
    },
  ) {
    const err = normalizeError(extra?.error);
    return writeLog({
      level,
      service: options.service,
      message,
      requestId: extra?.requestId,
      method: extra?.method,
      path: extra?.path,
      status: extra?.status,
      durationMs: extra?.durationMs,
      ip: extra?.ip,
      userAgent: extra?.userAgent,
      userId: extra?.userId,
      error: err,
      meta: { ...base, ...extra?.meta },
      tags: extra?.tags,
    });
  }

  return {
    debug: (message: string, extra?: Parameters<typeof log>[2]) =>
      log("debug", message, extra),
    info: (message: string, extra?: Parameters<typeof log>[2]) =>
      log("info", message, extra),
    warn: (message: string, extra?: Parameters<typeof log>[2]) =>
      log("warn", message, extra),
    error: (message: string, extra?: Parameters<typeof log>[2]) =>
      log("error", message, extra),
    security: (message: string, extra?: Parameters<typeof log>[2]) =>
      log("security", message, {
        ...extra,
        tags: [...(extra?.tags ?? []), "attack"],
      }),
  };
}

function normalizeError(error: unknown):
  | { name?: string; message: string; stack?: string }
  | undefined {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

export type AppLogger = ReturnType<typeof createLogger>;
