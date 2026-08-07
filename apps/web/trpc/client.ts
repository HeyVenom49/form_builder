import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import type { ServerRouter } from "@repo/trpc/client";

export const trpc: CreateTRPCReact<ServerRouter, unknown> =
  createTRPCReact<ServerRouter>();
