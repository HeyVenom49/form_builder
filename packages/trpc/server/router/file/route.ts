import { fileService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  fileListOutput,
  fileOutput,
  formIdInput,
  idInput,
  okOutput,
  registerFileInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "File request failed";
  throw new TRPCError({
    code: message.toLowerCase().includes("not found")
      ? "NOT_FOUND"
      : "BAD_REQUEST",
    message,
  });
}

export const fileRouter = router({
  registerFile: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/files",
        tags: ["files"],
        summary: "Register an uploaded file",
      },
    })
    .input(registerFileInput)
    .output(fileOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await fileService.registerFile(input, {
          ownerId: ctx.userId,
        });
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listFilesForForm: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/files",
        tags: ["files"],
        summary: "List files for an owned form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(fileListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await fileService.listFilesForForm(ctx.userId, input.formId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getFile: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/files/{id}",
        tags: ["files"],
        summary: "Get a file",
        protect: true,
      },
    })
    .input(idInput)
    .output(fileOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await fileService.getFile(input.id, { ownerId: ctx.userId });
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteFile: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/files/{id}",
        tags: ["files"],
        summary: "Soft-delete a file",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await fileService.deleteFile(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
