import {
  clearAuthenticationCookie,
  getAuthenticationCookie,
  setAuthenticationCookie,
} from "../../utils/cookie";
import { getSessionMeta } from "../../context";
import { authService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  changePasswordInput,
  changePasswordOutput,
  createUserWithEmailAndPasswordInput,
  createUserWithEmailAndPasswordOutput,
  loginWithEmailAndPasswordInput,
  loginWithEmailAndPasswordOutput,
  logoutOutput,
  meOutput,
  meQueryOutput,
  requestEmailVerificationOutput,
  requestPasswordResetInput,
  requestPasswordResetOutput,
  resetPasswordInput,
  resetPasswordOutput,
  verifyEmailInput,
  verifyEmailOutput,
} from "./model";

function toTrpcError(
  error: unknown,
  code: "UNAUTHORIZED" | "BAD_REQUEST",
): never {
  const message =
    error instanceof Error ? error.message : "Authentication failed";
  throw new TRPCError({ code, message });
}

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/create-user-with-email-and-password",
        tags: ["auth"],
        summary: "Create a user with email and password",
      },
    })
    .input(createUserWithEmailAndPasswordInput)
    .output(createUserWithEmailAndPasswordOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await authService.createUserWithEmailAndPassword(
          input,
          getSessionMeta(ctx.req),
        );
        setAuthenticationCookie(ctx, result.sessionToken);
        return { id: result.id, user: result.user };
      } catch (error) {
        toTrpcError(error, "BAD_REQUEST");
      }
    }),

  loginWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login-with-email-and-password",
        tags: ["auth"],
        summary: "Login with email and password",
      },
    })
    .input(loginWithEmailAndPasswordInput)
    .output(loginWithEmailAndPasswordOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await authService.loginWithEmailAndPassword(
          input,
          getSessionMeta(ctx.req),
        );
        setAuthenticationCookie(ctx, result.sessionToken);
        return { id: result.id, user: result.user };
      } catch (error) {
        toTrpcError(error, "UNAUTHORIZED");
      }
    }),

  logout: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/logout",
        tags: ["auth"],
        summary: "Logout and revoke the current session",
      },
    })
    .output(logoutOutput)
    .mutation(async ({ ctx }) => {
      const sessionToken = getAuthenticationCookie(ctx);
      if (sessionToken) {
        await authService.logout(sessionToken);
      }
      clearAuthenticationCookie(ctx);
      return { ok: true as const };
    }),

  logoutAll: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/logout-all",
        tags: ["auth"],
        summary: "Revoke all sessions for the current user",
        protect: true,
      },
    })
    .output(logoutOutput)
    .mutation(async ({ ctx }) => {
      await authService.logoutAll(ctx.userId);
      clearAuthenticationCookie(ctx);
      return { ok: true as const };
    }),

  me: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/me",
        tags: ["auth"],
        summary: "Get the current authenticated user, or null if signed out",
      },
    })
    .output(meQueryOutput)
    .query(async ({ ctx }) => {
      if (!ctx.userId) return null;
      return (await authService.getMe(ctx.userId)) ?? null;
    }),

  changePassword: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/change-password",
        tags: ["auth"],
        summary: "Change password for the current user",
        protect: true,
      },
    })
    .input(changePasswordInput)
    .output(changePasswordOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await authService.changePassword(
          ctx.userId,
          input,
          getSessionMeta(ctx.req),
        );
        setAuthenticationCookie(ctx, result.sessionToken);
        return { ok: true as const };
      } catch (error) {
        toTrpcError(error, "BAD_REQUEST");
      }
    }),

  requestPasswordReset: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/request-password-reset",
        tags: ["auth"],
        summary: "Request a password reset email",
      },
    })
    .input(requestPasswordResetInput)
    .output(requestPasswordResetOutput)
    .mutation(async ({ input }) => {
      await authService.requestPasswordReset(input);
      return { ok: true as const };
    }),

  resetPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/reset-password",
        tags: ["auth"],
        summary: "Reset password with a reset token",
      },
    })
    .input(resetPasswordInput)
    .output(resetPasswordOutput)
    .mutation(async ({ input }) => {
      try {
        await authService.resetPassword(input);
        return { ok: true as const };
      } catch (error) {
        toTrpcError(error, "BAD_REQUEST");
      }
    }),

  requestEmailVerification: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/request-email-verification",
        tags: ["auth"],
        summary: "Request an email verification link",
        protect: true,
      },
    })
    .output(requestEmailVerificationOutput)
    .mutation(async ({ ctx }) => {
      try {
        const result = await authService.requestEmailVerification(ctx.userId);
        return {
          ok: true as const,
          alreadyVerified: result.alreadyVerified,
        };
      } catch (error) {
        toTrpcError(error, "BAD_REQUEST");
      }
    }),

  verifyEmail: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/verify-email",
        tags: ["auth"],
        summary: "Verify email with a verification token",
      },
    })
    .input(verifyEmailInput)
    .output(verifyEmailOutput)
    .mutation(async ({ input }) => {
      try {
        await authService.verifyEmail(input);
        return { ok: true as const };
      } catch (error) {
        toTrpcError(error, "BAD_REQUEST");
      }
    }),
});
