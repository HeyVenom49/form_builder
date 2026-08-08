import { createHmac, randomBytes } from "node:crypto";
import {
  and,
  db,
  desc,
  eq,
  formTable,
  isNull,
  sql,
  webhookDeliveryTable,
  webhookTable,
} from "@repo/database";
import {
  createWebhookInput,
  updateWebhookInput,
  type CreateWebhookType,
  type UpdateWebhookType,
  type webhookEventSchema,
} from "./model";
import type { z } from "zod";

type WebhookEvent = z.infer<typeof webhookEventSchema>;

const DELIVERY_TIMEOUT_MS = 10_000;
const RESPONSE_BODY_LIMIT = 4_000;

function createWebhookSecret() {
  return randomBytes(32).toString("hex");
}

function signPayload(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function truncateBody(value: string) {
  if (value.length <= RESPONSE_BODY_LIMIT) return value;
  return `${value.slice(0, RESPONSE_BODY_LIMIT)}…`;
}

class WebhookService {
  private async assertOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select({ id: formTable.id })
      .from(formTable)
      .where(
        and(
          eq(formTable.id, formId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    return form;
  }

  private async assertOwnedWebhook(ownerId: string, webhookId: string) {
    const [row] = await db
      .select({
        webhook: webhookTable,
      })
      .from(webhookTable)
      .innerJoin(formTable, eq(webhookTable.formId, formTable.id))
      .where(
        and(
          eq(webhookTable.id, webhookId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Webhook not found");
    }

    return row.webhook;
  }

  public async createWebhook(ownerId: string, payload: CreateWebhookType) {
    const input = await createWebhookInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, input.formId);

    const [created] = await db
      .insert(webhookTable)
      .values({
        formId: input.formId,
        url: input.url,
        secret: createWebhookSecret(),
        events: input.events,
        status: "ACTIVE",
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create webhook");
    }

    return created;
  }

  public async listWebhooks(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    return db
      .select()
      .from(webhookTable)
      .where(eq(webhookTable.formId, formId))
      .orderBy(desc(webhookTable.createdAt));
  }

  public async getWebhook(ownerId: string, webhookId: string) {
    return this.assertOwnedWebhook(ownerId, webhookId);
  }

  public async updateWebhook(
    ownerId: string,
    webhookId: string,
    payload: UpdateWebhookType,
  ) {
    const input = await updateWebhookInput.parseAsync(payload);
    await this.assertOwnedWebhook(ownerId, webhookId);

    const [updated] = await db
      .update(webhookTable)
      .set({
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.events !== undefined ? { events: input.events } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      })
      .where(eq(webhookTable.id, webhookId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update webhook");
    }

    return updated;
  }

  public async rotateSecret(ownerId: string, webhookId: string) {
    await this.assertOwnedWebhook(ownerId, webhookId);

    const [updated] = await db
      .update(webhookTable)
      .set({ secret: createWebhookSecret() })
      .where(eq(webhookTable.id, webhookId))
      .returning();

    if (!updated) {
      throw new Error("Failed to rotate webhook secret");
    }

    return updated;
  }

  public async deleteWebhook(ownerId: string, webhookId: string) {
    await this.assertOwnedWebhook(ownerId, webhookId);

    await db.delete(webhookTable).where(eq(webhookTable.id, webhookId));

    return { ok: true as const };
  }

  public async listDeliveries(ownerId: string, webhookId: string) {
    await this.assertOwnedWebhook(ownerId, webhookId);

    return db
      .select()
      .from(webhookDeliveryTable)
      .where(eq(webhookDeliveryTable.webhookId, webhookId))
      .orderBy(desc(webhookDeliveryTable.createdAt))
      .limit(100);
  }

  public async dispatchEvent(
    formId: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ) {
    const webhooks = await db
      .select()
      .from(webhookTable)
      .where(
        and(eq(webhookTable.formId, formId), eq(webhookTable.status, "ACTIVE")),
      );

    const matching = webhooks.filter((webhook) =>
      webhook.events.includes(event),
    );

    await Promise.allSettled(
      matching.map((webhook) =>
        this.deliver(webhook.id, webhook.url, webhook.secret, event, payload),
      ),
    );

    return { ok: true as const, attempted: matching.length };
  }

  public async retryDelivery(ownerId: string, deliveryId: string) {
    const [row] = await db
      .select({
        delivery: webhookDeliveryTable,
        webhook: webhookTable,
        formOwnerId: formTable.ownerId,
      })
      .from(webhookDeliveryTable)
      .innerJoin(
        webhookTable,
        eq(webhookDeliveryTable.webhookId, webhookTable.id),
      )
      .innerJoin(formTable, eq(webhookTable.formId, formTable.id))
      .where(
        and(
          eq(webhookDeliveryTable.id, deliveryId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Delivery not found");
    }

    if (row.webhook.status !== "ACTIVE") {
      throw new Error("Webhook is disabled");
    }

    return this.deliver(
      row.webhook.id,
      row.webhook.url,
      row.webhook.secret,
      row.delivery.event as WebhookEvent,
      row.delivery.payload,
      row.delivery.id,
    );
  }

  private async deliver(
    webhookId: string,
    url: string,
    secret: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
    existingDeliveryId?: string,
  ) {
    let deliveryId = existingDeliveryId;
    if (!deliveryId) {
      const [created] = await db
        .insert(webhookDeliveryTable)
        .values({
          webhookId,
          event,
          payload,
          status: "PENDING",
          attempts: 0,
        })
        .returning({ id: webhookDeliveryTable.id });

      if (!created) {
        throw new Error("Failed to create webhook delivery");
      }

      deliveryId = created.id;
    }

    await db
      .update(webhookDeliveryTable)
      .set({
        status: "PENDING",
        attempts: sql`${webhookDeliveryTable.attempts} + 1`,
        errorMessage: null,
      })
      .where(eq(webhookDeliveryTable.id, deliveryId));

    const body = JSON.stringify({
      id: deliveryId,
      event,
      createdAt: new Date().toISOString(),
      data: payload,
    });
    const signature = signPayload(secret, body);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "form-builder-webhooks/1.0",
          "x-form-builder-event": event,
          "x-form-builder-signature": signature,
          "x-form-builder-delivery": deliveryId,
        },
        body,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const responseBody = truncateBody(await response.text().catch(() => ""));

      if (!response.ok) {
        const [failed] = await db
          .update(webhookDeliveryTable)
          .set({
            status: "FAILED",
            responseStatusCode: response.status,
            responseBody,
            errorMessage: `HTTP ${response.status}`,
            nextRetryAt: new Date(Date.now() + 5 * 60_000),
          })
          .where(eq(webhookDeliveryTable.id, deliveryId))
          .returning();

        if (!failed) {
          throw new Error(`HTTP ${response.status}`);
        }

        return failed;
      }

      const [success] = await db
        .update(webhookDeliveryTable)
        .set({
          status: "SUCCESS",
          responseStatusCode: response.status,
          responseBody,
          errorMessage: null,
          nextRetryAt: null,
          deliveredAt: new Date(),
        })
        .where(eq(webhookDeliveryTable.id, deliveryId))
        .returning();

      if (!success) {
        throw new Error("Failed to update webhook delivery");
      }

      return success;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Failed to update webhook delivery"
      ) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Webhook delivery failed";

      const [failed] = await db
        .update(webhookDeliveryTable)
        .set({
          status: "FAILED",
          responseStatusCode: null,
          responseBody: null,
          errorMessage: message,
          nextRetryAt: new Date(Date.now() + 5 * 60_000),
        })
        .where(eq(webhookDeliveryTable.id, deliveryId))
        .returning();

      if (!failed) {
        throw new Error(message);
      }

      return failed;
    }
  }
}

export default WebhookService;
