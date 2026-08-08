import { trpc } from "../../../trpc/client";

export const useSignup = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user);
    },
  });

  return {
    createUserWithEmailAndPassword,
    createUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useSignin = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: loginWithEmailAndPasswordAsync,
    mutate: loginWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.loginWithEmailAndPassword.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user);
    },
  });

  return {
    loginWithEmailAndPassword,
    loginWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useLogout = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: logoutAsync,
    mutate: logout,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  return {
    logout,
    logoutAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useLogoutAll = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: logoutAllAsync,
    mutate: logoutAll,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.logoutAll.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  return {
    logoutAll,
    logoutAllAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useUser = () => {
  const {
    data: user,
    error,
    isFetched,
    isFetching,
    isLoading,
    isPending,
    status,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 15 * 60_000,
    gcTime: 60 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return {
    user,
    error,
    isFetched,
    isFetching,
    isLoading,
    isPending,
    status,
  };
};

export const useChangePassword = () => {
  const {
    mutateAsync: changePasswordAsync,
    mutate: changePassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.changePassword.useMutation();

  return {
    changePassword,
    changePasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useRequestPasswordReset = () => {
  const {
    mutateAsync: requestPasswordResetAsync,
    mutate: requestPasswordReset,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.requestPasswordReset.useMutation();

  return {
    requestPasswordReset,
    requestPasswordResetAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useResetPassword = () => {
  const {
    mutateAsync: resetPasswordAsync,
    mutate: resetPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.resetPassword.useMutation();

  return {
    resetPassword,
    resetPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useRequestEmailVerification = () => {
  const {
    mutateAsync: requestEmailVerificationAsync,
    mutate: requestEmailVerification,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.requestEmailVerification.useMutation();

  return {
    requestEmailVerification,
    requestEmailVerificationAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useVerifyEmail = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: verifyEmailAsync,
    mutate: verifyEmail,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.verifyEmail.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  return {
    verifyEmail,
    verifyEmailAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};
