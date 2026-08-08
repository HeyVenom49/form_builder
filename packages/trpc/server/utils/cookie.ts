import type { CookieOptions, Request, Response } from "express";

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_YEAR = 365 * ONE_DAY;

function getDefaultCookieOptions(): CookieOptions {
  return {
    path: "/",
    sameSite: "strict",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
  };
}

export type CookieHelpers = {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
};

type RequestWithCookies = Request & {
  cookies?: Record<string, unknown>;
};

export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    opts: CookieOptions = {},
  ) {
    res.cookie(name, value, { ...getDefaultCookieOptions(), ...opts });
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string): string | undefined {
    const value = (req as RequestWithCookies).cookies?.[name];
    return typeof value === "string" ? value : undefined;
  };
}

export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string) {
    const defaults = getDefaultCookieOptions();
    res.clearCookie(name, {
      path: defaults.path,
      sameSite: defaults.sameSite,
      httpOnly: defaults.httpOnly,
      secure: defaults.secure,
    });
  };
}

const AUTHENTICATION_COOKIE_NAME = "authentication-token";

export function setAuthenticationCookie(
  ctx: CookieHelpers,
  sessionToken: string,
) {
  ctx.createCookie(AUTHENTICATION_COOKIE_NAME, sessionToken);
}

export function getAuthenticationCookie(ctx: CookieHelpers) {
  return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function clearAuthenticationCookie(ctx: CookieHelpers) {
  ctx.clearCookie(AUTHENTICATION_COOKIE_NAME);
}
