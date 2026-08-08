import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request } from "express";
import {
  and,
  db,
  eq,
  gt,
  isNull,
  sessionTable,
  type Database,
} from "@repo/database";
import { hashSessionToken } from "./utils/session-token";
import {
  clearCookieFactory,
  createCookieFactory,
  getAuthenticationCookie,
  getCookieFactory,
  type CookieHelpers,
} from "./utils/cookie";

export type Context = CookieHelpers & {
  db: Database;
  req: Request;
  userId: string | null;
};

export function getSessionMeta(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ipAddress =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : req.socket.remoteAddress;

  const userAgentHeader = req.headers["user-agent"];
  const userAgent =
    typeof userAgentHeader === "string" ? userAgentHeader : undefined;

  return {
    ipAddress: ipAddress || undefined,
    userAgent,
  };
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> {
  const cookieHelpers: CookieHelpers = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
  };

  const sessionToken = getAuthenticationCookie(cookieHelpers);
  let userId: string | null = null;

  if (sessionToken) {
    const tokenHash = hashSessionToken(sessionToken);
    const session = await db.query.sessionTable.findFirst({
      where: and(
        eq(sessionTable.tokenHash, tokenHash),
        isNull(sessionTable.revokedAt),
        gt(sessionTable.expiresAt, new Date()),
      ),
      columns: {
        userId: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            deletedAt: true,
          },
        },
      },
    });

    if (session?.user && !session.user.deletedAt) {
      userId = session.user.id;
    }
  }

  return {
    ...cookieHelpers,
    db,
    req,
    userId,
  };
}
