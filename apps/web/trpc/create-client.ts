import {
  httpBatchLink,
  httpBatchStreamLink,
  type TRPCLink,
} from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { env } from "../env";

interface CreateHttpBatchLinkClientClientOpts {
  enableStreaming?: boolean;
}

export const createHttpBatchLinkClientClient = (
  opts?: CreateHttpBatchLinkClientClientOpts,
): TRPCLink<AnyRouter> => {
  const link = opts?.enableStreaming ? httpBatchStreamLink : httpBatchLink;

  return link({
    url: env.NEXT_PUBLIC_API_URL,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
