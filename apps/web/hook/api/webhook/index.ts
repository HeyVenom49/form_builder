import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useCreateWebhook = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.webhook.createWebhook.useMutation({
    onSuccess: async (data) => {
      await utils.webhook.listWebhooks.invalidate({ formId: data.formId });
    },
  });

  return {
    createWebhook: mutation.mutate,
    createWebhookAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useListWebhooks = (
  input: RouterInput["webhook"]["listWebhooks"],
  enabled = true,
) => {
  const query = trpc.webhook.listWebhooks.useQuery(input, { enabled });

  return {
    webhooks: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useWebhook = (
  input: RouterInput["webhook"]["getWebhook"],
  enabled = true,
) => {
  const query = trpc.webhook.getWebhook.useQuery(input, { enabled });

  return {
    webhook: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useUpdateWebhook = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.webhook.updateWebhook.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.webhook.getWebhook.invalidate({ id: data.id }),
        utils.webhook.listWebhooks.invalidate({ formId: data.formId }),
      ]);
    },
  });

  return {
    updateWebhook: mutation.mutate,
    updateWebhookAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useRotateWebhookSecret = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.webhook.rotateSecret.useMutation({
    onSuccess: async (data) => {
      await utils.webhook.getWebhook.invalidate({ id: data.id });
    },
  });

  return {
    rotateSecret: mutation.mutate,
    rotateSecretAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteWebhook = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.webhook.deleteWebhook.useMutation({
    onSuccess: async () => {
      await utils.webhook.listWebhooks.invalidate();
    },
  });

  return {
    deleteWebhook: mutation.mutate,
    deleteWebhookAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useWebhookDeliveries = (
  input: RouterInput["webhook"]["listDeliveries"],
  enabled = true,
) => {
  const query = trpc.webhook.listDeliveries.useQuery(input, { enabled });

  return {
    deliveries: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useRetryWebhookDelivery = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.webhook.retryDelivery.useMutation({
    onSuccess: async (data) => {
      if (data) {
        await utils.webhook.listDeliveries.invalidate({ id: data.webhookId });
      }
    },
  });

  return {
    retryDelivery: mutation.mutate,
    retryDeliveryAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};
