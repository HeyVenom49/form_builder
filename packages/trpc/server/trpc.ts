import { initTRPC, TRPCError } from "@trpc/server";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { Context } from "./context";

const server = initTRPC.meta<OpenApiMeta>().context<Context>().create({});

export const router = server.router;
export const publicProcedure = server.procedure;

/**
 * Requires a valid session (`ctx.userId`).
 * After this middleware, `userId` is narrowed from `string | null` → `string`.
 */
export const protectedProcedure = server.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

export { TRPCError };
