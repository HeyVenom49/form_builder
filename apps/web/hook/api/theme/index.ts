import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useCreateTheme = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.theme.createTheme.useMutation({
    onSuccess: async () => {
      await utils.theme.listMyThemes.invalidate();
    },
  });

  return {
    createTheme: mutation.mutate,
    createThemeAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useMyThemes = (enabled = true) => {
  const query = trpc.theme.listMyThemes.useQuery(undefined, {
    enabled,
    staleTime: 5 * 60_000,
  });

  return {
    themes: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const usePublicThemes = () => {
  const query = trpc.theme.listPublicThemes.useQuery();

  return {
    themes: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useTheme = (
  input: RouterInput["theme"]["getTheme"],
  enabled = true,
) => {
  const query = trpc.theme.getTheme.useQuery(input, { enabled });

  return {
    theme: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useUpdateTheme = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.theme.updateTheme.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.theme.getTheme.invalidate({ id: data.id }),
        utils.theme.listMyThemes.invalidate(),
      ]);
    },
  });

  return {
    updateTheme: mutation.mutate,
    updateThemeAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useSetDefaultTheme = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.theme.setDefaultTheme.useMutation({
    onSuccess: async () => {
      await utils.theme.listMyThemes.invalidate();
    },
  });

  return {
    setDefaultTheme: mutation.mutate,
    setDefaultThemeAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteTheme = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.theme.deleteTheme.useMutation({
    onSuccess: async () => {
      await utils.theme.listMyThemes.invalidate();
    },
  });

  return {
    deleteTheme: mutation.mutate,
    deleteThemeAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useAssignThemeToForm = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.theme.assignThemeToForm.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.id });
    },
  });

  return {
    assignThemeToForm: mutation.mutate,
    assignThemeToFormAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};
