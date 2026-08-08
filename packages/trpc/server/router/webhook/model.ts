import { z } from "zod";

/**
 * Route API contract for webhooks.
 * Independent of @repo/services — services own domain validation separately.
 */

export const webhookEventSchema = z.enum(["FORM_SUBMIT"]);
export const webhookStatusSchema = z.enum(["ACTIVE", "DISABLED"]);
export const webhookDeliveryStatusSchema = z.enum([
  "PENDING",
  "SUCCESS",
  "FAILED",
]);

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

export const createWebhookInput = z.object({
  formId: z.uuid(),
  url: z.url(),
  events: z.array(webhookEventSchema).min(1).default(["FORM_SUBMIT"]),
});

export const updateWebhookInput = z.object({
  url: z.url().optional(),
  events: z.array(webhookEventSchema).min(1).optional(),
  status: webhookStatusSchema.optional(),
});

export const updateWebhookRouteInput = idInput.extend(updateWebhookInput.shape);

export const webhookOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  url: z.string(),
  secret: z.string(),
  status: webhookStatusSchema,
  events: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const webhookListOutput = z.array(webhookOutput);

export const webhookDeliveryOutput = z.object({
  id: z.uuid(),
  webhookId: z.uuid(),
  event: z.string(),
  payload: z.record(z.string(), z.unknown()),
  status: webhookDeliveryStatusSchema,
  attempts: z.number().int(),
  responseStatusCode: z.number().int().nullable(),
  responseBody: z.string().nullable(),
  errorMessage: z.string().nullable(),
  nextRetryAt: z.date().nullable(),
  deliveredAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const webhookDeliveryListOutput = z.array(webhookDeliveryOutput);
