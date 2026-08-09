"use client";

import { useEffect } from "react";

const LOGGER_URL =
  process.env.NEXT_PUBLIC_LOGGER_URL ?? "http://localhost:4319";

function report(payload: {
  level: "error" | "warn" | "info" | "security";
  message: string;
  error?: { name?: string; message: string; stack?: string };
  meta?: Record<string, unknown>;
  tags?: string[];
  path?: string;
}) {
  const body = JSON.stringify({
    service: "web",
    ...payload,
    path: payload.path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });

  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon(`${LOGGER_URL}/ingest`, new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through */
  }

  void fetch(`${LOGGER_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* logger may be down in prod — ignore */
  });
}

export function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      report({
        level: "error",
        message: event.message || "window.error",
        error: {
          name: event.error instanceof Error ? event.error.name : "Error",
          message: event.message,
          stack: event.error instanceof Error ? event.error.stack : undefined,
        },
        meta: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        tags: ["client", "window.error"],
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const err =
        reason instanceof Error
          ? reason
          : new Error(typeof reason === "string" ? reason : "Unhandled rejection");
      report({
        level: "error",
        message: err.message,
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
        tags: ["client", "unhandledrejection"],
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

export { report as reportClientLog };
