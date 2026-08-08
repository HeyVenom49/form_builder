import { analyticsService } from "../../services";
import {
  protectedProcedure,
  publicProcedure,
  router,
  TRPCError,
} from "../../trpc";
import {
  analyticsEventListOutput,
  analyticsEventOutput,
  dailyCountListOutput,
  dailyCountsInput,
  formAnalyticsSummaryOutput,
  formIdInput,
  trackEventInput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Analytics request failed";
  throw new TRPCError({
    code: message.toLowerCase().includes("not found")
      ? "NOT_FOUND"
      : "BAD_REQUEST",
    message,
  });
}

export const analyticsRouter = router({
  trackEvent: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/analytics/events",
        tags: ["analytics"],
        summary: "Track an analytics event",
      },
    })
    .input(trackEventInput)
    .output(analyticsEventOutput)
    .mutation(async ({ input }) => {
      try {
        return await analyticsService.trackEvent(input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listEvents: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/analytics/events",
        tags: ["analytics"],
        summary: "List analytics events for a form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(analyticsEventListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await analyticsService.listEvents(ctx.userId, input.formId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getFormSummary: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/analytics/summary",
        tags: ["analytics"],
        summary: "Get analytics summary for a form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(formAnalyticsSummaryOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await analyticsService.getFormSummary(ctx.userId, input.formId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getDailyCounts: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/analytics/daily",
        tags: ["analytics"],
        summary: "Get daily analytics counts",
        protect: true,
      },
    })
    .input(dailyCountsInput)
    .output(dailyCountListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await analyticsService.getDailyCounts(
          ctx.userId,
          input.formId,
          input.days,
        );
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
