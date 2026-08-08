import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useTrackEvent = () => {
  const mutation = trpc.analytics.trackEvent.useMutation();

  return {
    trackEvent: mutation.mutate,
    trackEventAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useAnalyticsEvents = (
  input: RouterInput["analytics"]["listEvents"],
  enabled = true,
) => {
  const query = trpc.analytics.listEvents.useQuery(input, { enabled });

  return {
    events: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useFormAnalyticsSummary = (
  input: RouterInput["analytics"]["getFormSummary"],
  enabled = true,
) => {
  const query = trpc.analytics.getFormSummary.useQuery(input, { enabled });

  return {
    summary: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useDailyAnalyticsCounts = (
  input: RouterInput["analytics"]["getDailyCounts"],
  enabled = true,
) => {
  const query = trpc.analytics.getDailyCounts.useQuery(input, { enabled });

  return {
    counts: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};
