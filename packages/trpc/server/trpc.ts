import { initTRPC } from "@trpc/server";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { Context } from "./context";

const server = initTRPC.meta<OpenApiMeta>().context<Context>().create({});

export const router = server.router;
export const publicProcedure = server.procedure;

export { TRPCError } from "@trpc/server";
