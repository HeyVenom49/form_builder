import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { createLogger } from "./logger";
import { detectSuspiciousRequest, isAuthFailurePath } from "./detect";

const apiLogger = createLogger({ service: "api" });

function clientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim();
  }
  return req.socket.remoteAddress;
}

export function requestLoggingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId =
      (typeof req.headers["x-request-id"] === "string" &&
        req.headers["x-request-id"]) ||
      randomUUID();
    const started = Date.now();
    const ip = clientIp(req);
    const userAgent =
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : undefined;

    res.setHeader("x-request-id", requestId);

    const contentLengthHeader = req.headers["content-length"];
    const contentLength =
      typeof contentLengthHeader === "string"
        ? Number(contentLengthHeader)
        : undefined;

    const probe = detectSuspiciousRequest({
      method: req.method,
      path: req.path,
      query: req.url.includes("?") ? req.url.split("?")[1] : undefined,
      userAgent,
      contentLength: Number.isFinite(contentLength) ? contentLength : undefined,
    });

    if (probe.suspicious) {
      apiLogger.security("Suspicious request detected", {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        ip,
        userAgent,
        tags: ["probe", ...probe.reasons],
        meta: { reasons: probe.reasons },
      });
    }

    res.on("finish", () => {
      const durationMs = Date.now() - started;
      const path = req.originalUrl || req.url;
      const level =
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "info";

      apiLogger[level]("HTTP request", {
        requestId,
        method: req.method,
        path,
        status: res.statusCode,
        durationMs,
        ip,
        userAgent,
      });

      if (
        res.statusCode === 401 &&
        isAuthFailurePath(path)
      ) {
        apiLogger.security("Authentication failure", {
          requestId,
          method: req.method,
          path,
          status: 401,
          durationMs,
          ip,
          userAgent,
          tags: ["auth_failure"],
        });
      }
    });

    next();
  };
}

export function errorLoggingMiddleware() {
  return (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const requestId =
      (typeof res.getHeader("x-request-id") === "string" &&
        (res.getHeader("x-request-id") as string)) ||
      undefined;

    apiLogger.error("Unhandled API error", {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      ip: clientIp(req),
      userAgent:
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : undefined,
      error: err,
    });

    if (res.headersSent) {
      next(err);
      return;
    }

    res.status(500).json({
      message: "Internal server error",
      requestId,
    });
  };
}

export function installProcessHandlers(service: "api" | "web" | "logger" = "api") {
  const log = createLogger({ service });

  process.on("uncaughtException", (error) => {
    log.error("uncaughtException", { error, tags: ["fatal"] });
  });

  process.on("unhandledRejection", (reason) => {
    log.error("unhandledRejection", {
      error: reason instanceof Error ? reason : new Error(String(reason)),
      tags: ["fatal"],
    });
  });
}

export { apiLogger };
