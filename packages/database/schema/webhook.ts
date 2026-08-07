import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { formTable } from "./form";
import { webhookStatusEnum } from "./enums";
import { sql } from "drizzle-orm";

export const webhookTable = pgTable(
  "webhooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    secret: text("secret").notNull(),
    status: webhookStatusEnum("status").notNull().default("ACTIVE"),
    events: text("events")
      .array()
      .notNull()
      .default(sql`ARRAY['FORM_SUBMIT']::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("webhooks_form_id_idx").on(table.formId)],
);

export type SelectWebhook = typeof webhookTable.$inferSelect;
export type InsertWebhook = typeof webhookTable.$inferInsert;
