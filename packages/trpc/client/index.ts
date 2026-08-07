import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { ServerRouter } from "../server";

export type { ServerRouter } from "../server";
export type RouterInput = inferRouterInputs<ServerRouter>;
export type RouterOutput = inferRouterOutputs<ServerRouter>;

export * from "@trpc/client";
