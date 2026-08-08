import { webhookService } from "../../services";
import { protectedProcedure, router, TRPCError } from "../../trpc";
import {
  createWebhookInput,
  formIdInput,
  idInput,
  okOutput,
  updateWebhookRouteInput,
  webhookDeliveryListOutput,
  webhookDeliveryOutput,
  webhookListOutput,
  webhookOutput,
} from "./model";

function toTrpcError(error: unknown): never {
  const message =
    error instanceof Error ? error.message : "Webhook request failed";
  const lower = message.toLowerCase();
  const notFound = lower.includes("not found");
  const forbidden = lower.includes("disabled");

  throw new TRPCError({
    code: notFound ? "NOT_FOUND" : forbidden ? "FORBIDDEN" : "BAD_REQUEST",
    message,
  });
}

export const webhookRouter = router({
  createWebhook: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/webhooks",
        tags: ["webhooks"],
        summary: "Create a webhook",
        protect: true,
      },
    })
    .input(createWebhookInput)
    .output(webhookOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await webhookService.createWebhook(ctx.userId, input);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listWebhooks: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}/webhooks",
        tags: ["webhooks"],
        summary: "List webhooks for a form",
        protect: true,
      },
    })
    .input(formIdInput)
    .output(webhookListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await webhookService.listWebhooks(ctx.userId, input.formId);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  getWebhook: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/webhooks/{id}",
        tags: ["webhooks"],
        summary: "Get a webhook",
        protect: true,
      },
    })
    .input(idInput)
    .output(webhookOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await webhookService.getWebhook(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  updateWebhook: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/webhooks/{id}",
        tags: ["webhooks"],
        summary: "Update a webhook",
        protect: true,
      },
    })
    .input(updateWebhookRouteInput)
    .output(webhookOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...payload } = input;
        return await webhookService.updateWebhook(ctx.userId, id, payload);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  rotateSecret: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/webhooks/{id}/rotate-secret",
        tags: ["webhooks"],
        summary: "Rotate webhook signing secret",
        protect: true,
      },
    })
    .input(idInput)
    .output(webhookOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await webhookService.rotateSecret(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  deleteWebhook: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/webhooks/{id}",
        tags: ["webhooks"],
        summary: "Delete a webhook",
        protect: true,
      },
    })
    .input(idInput)
    .output(okOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await webhookService.deleteWebhook(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  listDeliveries: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/webhooks/{id}/deliveries",
        tags: ["webhooks"],
        summary: "List recent webhook deliveries",
        protect: true,
      },
    })
    .input(idInput)
    .output(webhookDeliveryListOutput)
    .query(async ({ ctx, input }) => {
      try {
        return await webhookService.listDeliveries(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),

  retryDelivery: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/webhook-deliveries/{id}/retry",
        tags: ["webhooks"],
        summary: "Retry a failed webhook delivery",
        protect: true,
      },
    })
    .input(idInput)
    .output(webhookDeliveryOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await webhookService.retryDelivery(ctx.userId, input.id);
      } catch (error) {
        toTrpcError(error);
      }
    }),
});
