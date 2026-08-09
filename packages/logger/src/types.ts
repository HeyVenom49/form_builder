export type LogLevel = "debug" | "info" | "warn" | "error" | "security";

export type LogService = "api" | "web" | "logger" | "system";

export type LogEvent = {
  id: string;
  ts: string;
  level: LogLevel;
  service: LogService;
  message: string;
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  ip?: string;
  userAgent?: string;
  userId?: string | null;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
  tags?: string[];
};

export type IngestPayload = {
  level?: LogLevel;
  service?: LogService;
  message: string;
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  ip?: string;
  userAgent?: string;
  userId?: string | null;
  error?: LogEvent["error"];
  meta?: Record<string, unknown>;
  tags?: string[];
};
