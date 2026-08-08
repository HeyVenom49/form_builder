import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useCreateShareLink = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.shareLink.createShareLink.useMutation({
    onSuccess: async (data) => {
      await utils.shareLink.listShareLinks.invalidate({ formId: data.formId });
    },
  });

  return {
    createShareLink: mutation.mutate,
    createShareLinkAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useListShareLinks = (
  input: RouterInput["shareLink"]["listShareLinks"],
  enabled = true,
) => {
  const query = trpc.shareLink.listShareLinks.useQuery(input, { enabled });

  return {
    shareLinks: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useUpdateShareLink = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.shareLink.updateShareLink.useMutation({
    onSuccess: async (data) => {
      await utils.shareLink.listShareLinks.invalidate({ formId: data.formId });
    },
  });

  return {
    updateShareLink: mutation.mutate,
    updateShareLinkAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeactivateShareLink = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.shareLink.deactivateShareLink.useMutation({
    onSuccess: async (data) => {
      await utils.shareLink.listShareLinks.invalidate({ formId: data.formId });
    },
  });

  return {
    deactivateShareLink: mutation.mutate,
    deactivateShareLinkAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteShareLink = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.shareLink.deleteShareLink.useMutation({
    onSuccess: async () => {
      await utils.shareLink.listShareLinks.invalidate();
    },
  });

  return {
    deleteShareLink: mutation.mutate,
    deleteShareLinkAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useResolveShareLink = () => {
  const mutation = trpc.shareLink.resolveBySlug.useMutation();

  return {
    resolveBySlug: mutation.mutate,
    resolveBySlugAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
    data: mutation.data,
  };
};
