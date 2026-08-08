import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useCreateTemplateFromForm = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.template.createTemplateFromForm.useMutation({
    onSuccess: async () => {
      await utils.template.listMyTemplates.invalidate();
    },
  });

  return {
    createTemplateFromForm: mutation.mutate,
    createTemplateFromFormAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useMyTemplates = () => {
  const query = trpc.template.listMyTemplates.useQuery();

  return {
    templates: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const usePublicTemplates = (
  input?: RouterInput["template"]["listPublicTemplates"],
) => {
  const query = trpc.template.listPublicTemplates.useQuery(input);

  return {
    templates: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useTemplate = (
  input: RouterInput["template"]["getTemplate"],
  enabled = true,
) => {
  const query = trpc.template.getTemplate.useQuery(input, { enabled });

  return {
    template: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useUpdateTemplate = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.template.updateTemplate.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.template.getTemplate.invalidate({ id: data.id }),
        utils.template.listMyTemplates.invalidate(),
      ]);
    },
  });

  return {
    updateTemplate: mutation.mutate,
    updateTemplateAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteTemplate = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.template.deleteTemplate.useMutation({
    onSuccess: async () => {
      await utils.template.listMyTemplates.invalidate();
    },
  });

  return {
    deleteTemplate: mutation.mutate,
    deleteTemplateAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useUseTemplate = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.template.useTemplate.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.form.listForms.invalidate(),
        utils.template.listMyTemplates.invalidate(),
        utils.template.listPublicTemplates.invalidate(),
      ]);
    },
  });

  return {
    useTemplate: mutation.mutate,
    useTemplateAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};
