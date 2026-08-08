import { responseService } from "../../services";
import { getSessionMeta } from "../../context";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  abandonResponseInput,
  formIdInput,
  idInput,
  okOutput,
  responseDetailOutput,
  responseListOutput,
  saveAnswersInput,
  startResponseInput,
  submitResponseInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Response request failed";
  const lower = message.toLowerCase();
  const notFound =
    lower.includes("not found") ||
    lower.includes("not accepting") ||
    lower.includes("expired");
  const forbidden =
    lower.includes("login is required") ||
    lower.includes("already submitted") ||
    lower.includes("can no longer be edited") ||
    lower.includes("abandoned");

  throw new TRPCError({
    code: notFound ? "NOT_FOUND" : forbidden ? "FORBIDDEN" : "BAD_REQUEST",
    message,
  });
}

export const responseRouter = router({
  startResponse: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/responses/start",
        tags: ["responses"],
        summary: "Start a form response",
      },
    })
    .input(startResponseInput)
    .output(responseDetailOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await responseService.startResponse(input, {
          userId: ctx.userId,
          meta: getSessionMeta(ctx.req),
        });
      } catch (error) {
        toTrpcError(error);
      }
    }),

  saveAnswers: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/responses/save",
        tags: ["responses"],
        summary: "Save draft answers",
      },
    })
    .input(saveAnswersInput)
    .output(responseDetailOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await responseService.saveAnswers(input, {
          userId: ctx.userId,
        });
      } catch (error) {
        toTrpcError(error);
      }
    }),

  submitResponse: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/responses/submit",
        tags: ["responses"],
        summary: "Submit a form response",
      },
    })
    .input(submitResponseInput)
    .output(responseDetailOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await responseService.submitResponse(input, {
          userId: ctx.userId,
        });
      } catch (error) {
        toTrpcError(error);
      }
    }),

  abandonResponse: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/responses/abandon",
        tags: ["responses"],
        summary: "Abandon an in-progress response",
      },
    })
    .input(abandonResponseInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await responseService.abandonResponse(input, {
          userId: ctx.userId,
        });
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getResponse: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/responses/{id}",
        tags: ["responses"],
        summary: "Get a response by id (owner or respondent)",
      },
    })
    .input(idInput)
    .output(responseDetailOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.getResponseForAccessor(
          input.id,
          ctx.userId,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listResponses: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/responses",
        tags: ["responses"],
        summary: "List responses for an owned form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(responseListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.listResponsesForForm(
          ctx.userId,
          input.formId,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getOwnedResponse: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/responses/{id}",
        tags: ["responses"],
        summary: "Get a response for an owned form",
        protect: true,
      },
    })
    .input(idInput)
    .output(responseDetailOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await responseService.getResponseForOwner(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteResponse: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/forms/responses/{id}",
        tags: ["responses"],
        summary: "Soft-delete a response",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await responseService.deleteResponse(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
