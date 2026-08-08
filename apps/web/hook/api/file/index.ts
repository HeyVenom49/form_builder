import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useRegisterFile = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.file.registerFile.useMutation({
    onSuccess: async (data) => {
      if (data.formId) {
        await utils.file.listFilesForForm.invalidate({ formId: data.formId });
      }
    },
  });

  return {
    registerFile: mutation.mutate,
    registerFileAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useListFilesForForm = (
  input: RouterInput["file"]["listFilesForForm"],
  enabled = true,
) => {
  const query = trpc.file.listFilesForForm.useQuery(input, { enabled });

  return {
    files: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useFile = (
  input: RouterInput["file"]["getFile"],
  enabled = true,
) => {
  const query = trpc.file.getFile.useQuery(input, { enabled });

  return {
    file: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useDeleteFile = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.file.deleteFile.useMutation({
    onSuccess: async () => {
      await utils.file.listFilesForForm.invalidate();
    },
  });

  return {
    deleteFile: mutation.mutate,
    deleteFileAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};
