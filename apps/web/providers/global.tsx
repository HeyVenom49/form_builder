"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useState } from "react";

import { ClientErrorReporter } from "../components/logging/client-error-reporter";
import { trpc } from "../trpc/client";
import { createHttpBatchLinkClientClient } from "../trpc/create-client";

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [createHttpBatchLinkClientClient()],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <trpc.Provider queryClient={queryClient} client={trpcClient}>
          <ClientErrorReporter />
          {children}
        </trpc.Provider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};
