import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useStartResponse = () => {
  const mutation = trpc.response.startResponse.useMutation();

  return {
    startResponse: mutation.mutate,
    startResponseAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useSaveAnswers = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.response.saveAnswers.useMutation({
    onSuccess: async (data) => {
      await utils.response.getResponse.invalidate({ id: data.id });
    },
  });

  return {
    saveAnswers: mutation.mutate,
    saveAnswersAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useSubmitResponse = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.response.submitResponse.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.response.getResponse.invalidate({ id: data.id }),
        utils.response.listResponses.invalidate({ formId: data.formId }),
      ]);
    },
  });

  return {
    submitResponse: mutation.mutate,
    submitResponseAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useAbandonResponse = () => {
  const mutation = trpc.response.abandonResponse.useMutation();

  return {
    abandonResponse: mutation.mutate,
    abandonResponseAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useResponse = (
  input: RouterInput["response"]["getResponse"],
  enabled = true,
) => {
  const query = trpc.response.getResponse.useQuery(input, { enabled });

  return {
    response: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useListResponses = (
  input: RouterInput["response"]["listResponses"],
  enabled = true,
) => {
  const query = trpc.response.listResponses.useQuery(input, { enabled });

  return {
    responses: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useOwnedResponse = (
  input: RouterInput["response"]["getOwnedResponse"],
  enabled = true,
) => {
  const query = trpc.response.getOwnedResponse.useQuery(input, { enabled });

  return {
    response: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useDeleteResponse = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.response.deleteResponse.useMutation({
    onSuccess: async () => {
      await utils.response.listResponses.invalidate();
    },
  });

  return {
    deleteResponse: mutation.mutate,
    deleteResponseAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};
