import { shareLinkService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  createShareLinkInput,
  formIdInput,
  idInput,
  okOutput,
  resolveShareLinkInput,
  resolveShareLinkOutput,
  shareLinkListOutput,
  shareLinkOutput,
  updateShareLinkRouteInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Share link request failed";
  const lower = message.toLowerCase();
  const notFound =
    lower.includes("not found") ||
    lower.includes("expired") ||
    lower.includes("visit limit");
  const forbidden =
    lower.includes("password is required") ||
    lower.includes("invalid share link password");

  throw new TRPCError({
    code: notFound ? "NOT_FOUND" : forbidden ? "FORBIDDEN" : "BAD_REQUEST",
    message,
  });
}

export const shareLinkRouter = router({
  createShareLink: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/share-links",
        tags: ["share-links"],
        summary: "Create a share link",
        protect: true,
      },
    })
    .input(createShareLinkInput)
    .output(shareLinkOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await shareLinkService.createShareLink(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listShareLinks: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/share-links",
        tags: ["share-links"],
        summary: "List share links for a form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(shareLinkListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await shareLinkService.listShareLinks(ctx.userId, input.formId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateShareLink: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/share-links/{id}",
        tags: ["share-links"],
        summary: "Update a share link",
        protect: true,
      },
    })
    .input(updateShareLinkRouteInput)
    .output(shareLinkOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...payload } = input;
        return await shareLinkService.updateShareLink(ctx.userId, id, payload);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deactivateShareLink: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/share-links/{id}/deactivate",
        tags: ["share-links"],
        summary: "Deactivate a share link",
        protect: true,
      },
    })
    .input(idInput)
    .output(shareLinkOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await shareLinkService.deactivateShareLink(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteShareLink: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/share-links/{id}",
        tags: ["share-links"],
        summary: "Delete a share link",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await shareLinkService.deleteShareLink(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  resolveBySlug: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/share-links/resolve",
        tags: ["share-links"],
        summary: "Resolve a share link slug to a published form",
      },
    })
    .input(resolveShareLinkInput)
    .output(resolveShareLinkOutput)
    .mutation(async ({ input }) => {
      try {
        return await shareLinkService.resolveBySlug(input);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
