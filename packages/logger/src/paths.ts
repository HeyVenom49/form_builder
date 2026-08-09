import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

/** Monorepo root (packages/logger/src → ../../..) */
export function repoRoot(): string {
  return resolve(import.meta.dirname, "../../..");
}

export function logsDir(): string {
  const dir = join(repoRoot(), "logs");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function logFileForDate(date = new Date()): string {
  const day = date.toISOString().slice(0, 10);
  return join(logsDir(), `${day}.jsonl`);
}

export function securityLogFile(date = new Date()): string {
  const day = date.toISOString().slice(0, 10);
  return join(logsDir(), `${day}-security.jsonl`);
}
