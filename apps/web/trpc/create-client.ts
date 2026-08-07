import {
  httpBatchLink,
  httpBatchStreamLink,
  type TRPCLink,
} from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { env } from "../env.js";

interface CreateHttpBatchLinkClientClientOpts {
  enableStreaming?: boolean;
}

export const createHttpBatchLinkClientClient = (
  opts?: CreateHttpBatchLinkClientClientOpts,
): TRPCLink<AnyRouter> => {
  const link = opts?.enableStreaming ? httpBatchStreamLink : httpBatchLink;

  return link({
    url: env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
    fetch(url, options) {
      return fetch(url, {
        ...options,
        // credentials: "include",
      });
    },
  });
};
