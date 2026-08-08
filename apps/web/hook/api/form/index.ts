import type { RouterInput } from "@repo/trpc/client";
import { trpc } from "../../../trpc/client";

type FormId = RouterInput["form"]["getFormById"];

export const useCreateForm = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    createForm: mutation.mutate,
    createFormAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useListForms = (enabled = true) => {
  const query = trpc.form.listForms.useQuery(undefined, {
    enabled,
    staleTime: 60_000,
  });

  return {
    forms: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useForm = (input: FormId, enabled = true) => {
  const query = trpc.form.getFormById.useQuery(input, {
    enabled,
    staleTime: 30_000,
  });

  return {
    form: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const usePublishedForm = (
  input: RouterInput["form"]["getPublishedFormById"],
  enabled = true,
) => {
  const query = trpc.form.getPublishedFormById.useQuery(input, { enabled });

  return {
    form: query.data,
    error: query.error,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isPending: query.isPending,
    status: query.status,
  };
};

export const useUpdateForm = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateForm.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.form.listForms.invalidate(),
        utils.form.getFormById.invalidate({ id: data.id }),
      ]);
    },
  });

  return {
    updateForm: mutation.mutate,
    updateFormAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useUpdateFormSettings = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateFormSettings.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    updateFormSettings: mutation.mutate,
    updateFormSettingsAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useSetFormStatus = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.setFormStatus.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.form.listForms.invalidate(),
        utils.form.getFormById.invalidate({ id: data.id }),
      ]);
    },
  });

  return {
    setFormStatus: mutation.mutate,
    setFormStatusAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    deleteForm: mutation.mutate,
    deleteFormAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useCreateSection = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.createSection.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    createSection: mutation.mutate,
    createSectionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useUpdateSection = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateSection.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    updateSection: mutation.mutate,
    updateSectionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteSection = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.deleteSection.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    deleteSection: mutation.mutate,
    deleteSectionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useReorderSections = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.reorderSections.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.form.getFormById.invalidate({ id: variables.formId });
    },
  });

  return {
    reorderSections: mutation.mutate,
    reorderSectionsAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useCreateQuestion = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.createQuestion.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    createQuestion: mutation.mutate,
    createQuestionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useUpdateQuestion = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateQuestion.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    updateQuestion: mutation.mutate,
    updateQuestionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteQuestion = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.deleteQuestion.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.form.getFormById.invalidate(),
        utils.form.listForms.invalidate(),
      ]);
    },
  });

  return {
    deleteQuestion: mutation.mutate,
    deleteQuestionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useReorderQuestions = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.reorderQuestions.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    reorderQuestions: mutation.mutate,
    reorderQuestionsAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useCreateQuestionOption = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.createQuestionOption.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    createQuestionOption: mutation.mutate,
    createQuestionOptionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useUpdateQuestionOption = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateQuestionOption.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    updateQuestionOption: mutation.mutate,
    updateQuestionOptionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteQuestionOption = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.deleteQuestionOption.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    deleteQuestionOption: mutation.mutate,
    deleteQuestionOptionAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useReorderQuestionOptions = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.reorderQuestionOptions.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    reorderQuestionOptions: mutation.mutate,
    reorderQuestionOptionsAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useCreateLogicRule = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.createLogicRule.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    createLogicRule: mutation.mutate,
    createLogicRuleAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useUpdateLogicRule = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.updateLogicRule.useMutation({
    onSuccess: async (data) => {
      await utils.form.getFormById.invalidate({ id: data.formId });
    },
  });

  return {
    updateLogicRule: mutation.mutate,
    updateLogicRuleAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

export const useDeleteLogicRule = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.form.deleteLogicRule.useMutation({
    onSuccess: async () => {
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    deleteLogicRule: mutation.mutate,
    deleteLogicRuleAsync: mutation.mutateAsync,
    error: mutation.error,
    failureCount: mutation.failureCount,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};
