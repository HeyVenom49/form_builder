import { z } from "zod";

export const webhookEventSchema = z.enum(["FORM_SUBMIT"]);
export const webhookStatusSchema = z.enum(["ACTIVE", "DISABLED"]);

export const createWebhookInput = z.object({
  formId: z.uuid(),
  url: z.url(),
  events: z.array(webhookEventSchema).min(1).default(["FORM_SUBMIT"]),
});

export type CreateWebhookType = z.infer<typeof createWebhookInput>;

export const updateWebhookInput = z.object({
  url: z.url().optional(),
  events: z.array(webhookEventSchema).min(1).optional(),
  status: webhookStatusSchema.optional(),
});

export type UpdateWebhookType = z.infer<typeof updateWebhookInput>;
