import { createHash, randomBytes } from "node:crypto";

/** Opaque token for cookies / email links. Never store raw in the DB. */
export function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

/** @deprecated use createOpaqueToken */
export const createSessionToken = createOpaqueToken;

/** Hash before writing/looking up `*_token_hash` columns. */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** @deprecated use hashToken */
export const hashSessionToken = hashToken;

export const SESSION_TTL_MS = 365 * 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
