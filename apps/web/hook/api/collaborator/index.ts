import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

export const useInviteCollaborator = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.collaborator.inviteCollaborator.useMutation({
    onSuccess: async (data) => {
      await utils.collaborator.listCollaborators.invalidate({
        formId: data.formId,
      });
    },
  });

  return {
    inviteCollaborator: mutation.mutate,
    inviteCollaboratorAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useListCollaborators = (
  input: RouterInput["collaborator"]["listCollaborators"],
  enabled = true,
) => {
  const query = trpc.collaborator.listCollaborators.useQuery(input, {
    enabled,
  });

  return {
    collaborators: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useUpdateCollaboratorRole = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.collaborator.updateCollaboratorRole.useMutation({
    onSuccess: async (data) => {
      await utils.collaborator.listCollaborators.invalidate({
        formId: data.formId,
      });
    },
  });

  return {
    updateCollaboratorRole: mutation.mutate,
    updateCollaboratorRoleAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useRemoveCollaborator = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.collaborator.removeCollaborator.useMutation({
    onSuccess: async () => {
      await utils.collaborator.listCollaborators.invalidate();
    },
  });

  return {
    removeCollaborator: mutation.mutate,
    removeCollaboratorAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useAcceptInvite = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.collaborator.acceptInvite.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.collaborator.listMyInvites.invalidate(),
        utils.collaborator.listSharedWithMe.invalidate(),
      ]);
    },
  });

  return {
    acceptInvite: mutation.mutate,
    acceptInviteAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeclineInvite = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.collaborator.declineInvite.useMutation({
    onSuccess: async () => {
      await utils.collaborator.listMyInvites.invalidate();
    },
  });

  return {
    declineInvite: mutation.mutate,
    declineInviteAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useLeaveForm = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.collaborator.leaveForm.useMutation({
    onSuccess: async () => {
      await utils.collaborator.listSharedWithMe.invalidate();
    },
  });

  return {
    leaveForm: mutation.mutate,
    leaveFormAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useMyInvites = (enabled = true) => {
  const query = trpc.collaborator.listMyInvites.useQuery(undefined, {
    enabled,
    staleTime: 60_000,
  });

  return {
    invites: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useSharedWithMe = (enabled = true) => {
  const query = trpc.collaborator.listSharedWithMe.useQuery(undefined, {
    enabled,
    staleTime: 60_000,
  });

  return {
    shared: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};
