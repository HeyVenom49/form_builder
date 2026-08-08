import { collaboratorService } from "../../services";
import { protectedProcedure, router, TRPCError } from "../../trpc";
import {
  collaboratorListOutput,
  collaboratorOutput,
  formIdInput,
  idInput,
  inviteCollaboratorInput,
  okOutput,
  updateCollaboratorRoleRouteInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Collaborator request failed";
  const lower = message.toLowerCase();
  const notFound = lower.includes("not found");
  const conflict =
    lower.includes("already a collaborator") ||
    lower.includes("cannot be invited") ||
    lower.includes("cannot be declined");

  throw new TRPCError({
    code: notFound ? "NOT_FOUND" : conflict ? "CONFLICT" : "BAD_REQUEST",
    message,
  });
}

export const collaboratorRouter = router({
  inviteCollaborator: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/collaborators/invite",
        tags: ["collaborators"],
        summary: "Invite a collaborator by email",
        protect: true,
      },
    })
    .input(inviteCollaboratorInput)
    .output(collaboratorOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await collaboratorService.inviteCollaborator(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listCollaborators: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/collaborators",
        tags: ["collaborators"],
        summary: "List collaborators for an owned form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(collaboratorListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await collaboratorService.listCollaborators(
          ctx.userId,
          input.formId,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateCollaboratorRole: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/collaborators/{id}/role",
        tags: ["collaborators"],
        summary: "Update collaborator role",
        protect: true,
      },
    })
    .input(updateCollaboratorRoleRouteInput)
    .output(collaboratorOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, role } = input;
        return await collaboratorService.updateCollaboratorRole(
          ctx.userId,
          id,
          { role },
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  removeCollaborator: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/collaborators/{id}",
        tags: ["collaborators"],
        summary: "Remove a collaborator",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await collaboratorService.removeCollaborator(
          ctx.userId,
          input.id,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  acceptInvite: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/collaborators/{id}/accept",
        tags: ["collaborators"],
        summary: "Accept a collaborator invite",
        protect: true,
      },
    })
    .input(idInput)
    .output(collaboratorOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await collaboratorService.acceptInvite(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  declineInvite: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/collaborators/{id}/decline",
        tags: ["collaborators"],
        summary: "Decline a collaborator invite",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await collaboratorService.declineInvite(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  leaveForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/collaborators/{id}/leave",
        tags: ["collaborators"],
        summary: "Leave a shared form",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await collaboratorService.leaveForm(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listMyInvites: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/collaborators/invites",
        tags: ["collaborators"],
        summary: "List pending collaborator invites",
        protect: true,
      },
    })
    .output(collaboratorListOutput)
    .query(async ({ ctx }) => {
      try {
        return await collaboratorService.listMyInvites(ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listSharedWithMe: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/collaborators/shared",
        tags: ["collaborators"],
        summary: "List forms shared with me",
        protect: true,
      },
    })
    .output(collaboratorListOutput)
    .query(async ({ ctx }) => {
      try {
        return await collaboratorService.listSharedWithMe(ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
