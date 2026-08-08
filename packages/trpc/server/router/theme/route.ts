import { themeService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  assignThemeInput,
  assignedFormOutput,
  createThemeInput,
  idInput,
  okOutput,
  themeListOutput,
  themeOutput,
  updateThemeRouteInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Theme request failed";
  const notFound = message.toLowerCase().includes("not found");

  throw new TRPCError({
    code: notFound ? "NOT_FOUND" : "BAD_REQUEST",
    message,
  });
}

export const themeRouter = router({
  createTheme: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/themes",
        tags: ["themes"],
        summary: "Create a theme",
        protect: true,
      },
    })
    .input(createThemeInput)
    .output(themeOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await themeService.createTheme(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listMyThemes: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/themes",
        tags: ["themes"],
        summary: "List my themes",
        protect: true,
      },
    })
    .output(themeListOutput)
    .query(async ({ ctx }) => {
      try {
        return await themeService.listMyThemes(ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listPublicThemes: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/themes/public",
        tags: ["themes"],
        summary: "List public themes",
      },
    })
    .output(themeListOutput)
    .query(async () => {
      try {
        return await themeService.listPublicThemes();
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getTheme: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/themes/{id}",
        tags: ["themes"],
        summary: "Get a theme (owned or public)",
      },
    })
    .input(idInput)
    .output(themeOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await themeService.getTheme(input.id, ctx.userId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateTheme: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/themes/{id}",
        tags: ["themes"],
        summary: "Update a theme",
        protect: true,
      },
    })
    .input(updateThemeRouteInput)
    .output(themeOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...payload } = input;
        return await themeService.updateTheme(ctx.userId, id, payload);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  setDefaultTheme: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/themes/{id}/default",
        tags: ["themes"],
        summary: "Set default theme",
        protect: true,
      },
    })
    .input(idInput)
    .output(themeOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await themeService.setDefaultTheme(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteTheme: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/themes/{id}",
        tags: ["themes"],
        summary: "Soft-delete a theme",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await themeService.deleteTheme(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  assignThemeToForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/themes/assign",
        tags: ["themes"],
        summary: "Assign or clear a form theme",
        protect: true,
      },
    })
    .input(assignThemeInput)
    .output(assignedFormOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await themeService.assignThemeToForm(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
