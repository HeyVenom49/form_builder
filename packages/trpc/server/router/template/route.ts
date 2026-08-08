import { templateService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  createTemplateFromFormInput,
  formDetailOutput,
  idInput,
  listPublicTemplatesInput,
  okOutput,
  templateListOutput,
  templateOutput,
  updateTemplateRouteInput,
  useTemplateInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Template request failed";
  throw new TRPCError({
    code: message.toLowerCase().includes("not found")
      ? "NOT_FOUND"
      : "BAD_REQUEST",
    message,
  });
}

export const templateRouter = router({
  createTemplateFromForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/templates/from-form",
        tags: ["templates"],
        summary: "Create a template from an owned form",
        protect: true,
      },
    })
    .input(createTemplateFromFormInput)
    .output(templateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await templateService.createTemplateFromForm(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listMyTemplates: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/templates",
        tags: ["templates"],
        summary: "List my templates",
        protect: true,
      },
    })
    .output(templateListOutput)
    .query(async ({ ctx }) => {
      try {
        return await templateService.listMyTemplates(ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listPublicTemplates: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/templates/public",
        tags: ["templates"],
        summary: "List public templates",
      },
    })
    .input(listPublicTemplatesInput)
    .output(templateListOutput)
    .query(async ({ input }) => {
      try {
        return await templateService.listPublicTemplates(input?.category);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getTemplate: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/templates/{id}",
        tags: ["templates"],
        summary: "Get a template",
      },
    })
    .input(idInput)
    .output(templateOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await templateService.getTemplate(input.id, ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateTemplate: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/templates/{id}",
        tags: ["templates"],
        summary: "Update a template",
        protect: true,
      },
    })
    .input(updateTemplateRouteInput)
    .output(templateOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...payload } = input;
        return await templateService.updateTemplate(ctx.userId, id, payload);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteTemplate: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/templates/{id}",
        tags: ["templates"],
        summary: "Soft-delete a template",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await templateService.deleteTemplate(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  useTemplate: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/templates/use",
        tags: ["templates"],
        summary: "Create a form from a template",
        protect: true,
      },
    })
    .input(useTemplateInput)
    .output(formDetailOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await templateService.useTemplate(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
