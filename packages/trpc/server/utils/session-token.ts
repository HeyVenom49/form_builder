import { createHash } from "node:crypto";

/** Hash the opaque session token before looking up `sessions.token_hash`. */
export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
