import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { webhookDeliveryStatusEnum } from "./enums";
import { webhookTable } from "./webhook";

export const webhookDeliveryTable = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    webhookId: uuid("webhook_id")
      .notNull()
      .references(() => webhookTable.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    status: webhookDeliveryStatusEnum("status").notNull().default("PENDING"),
    attempts: integer("attempts").notNull().default(0),
    responseStatusCode: integer("response_status_code"),
    responseBody: text("response_body"),
    errorMessage: text("error_message"),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("webhook_deliveries_webhook_id_idx").on(table.webhookId),
    index("webhook_deliveries_status_next_retry_idx").on(
      table.status,
      table.nextRetryAt,
    ),
  ],
);

export type SelectWebhookDelivery = typeof webhookDeliveryTable.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveryTable.$inferInsert;
