import type { ServerRouter } from "@repo/trpc/server";
import { createTRPCClient } from "@trpc/client";
import { createHttpBatchLinkClientClient } from "./create-client";

export const api = createTRPCClient<ServerRouter>({
  links: [createHttpBatchLinkClientClient()],
});

export const apiStreaming = createTRPCClient<ServerRouter>({
  links: [createHttpBatchLinkClientClient({ enableStreaming: true })],
});
