import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { analyticsEventEnum } from "./enums";
import { formTable } from "./form";
import { questionTable } from "./question";
import { responseTable } from "./response";

export const analyticsEventTable = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    responseId: uuid("response_id").references(() => responseTable.id, {
      onDelete: "cascade",
    }),
    questionId: uuid("question_id").references(() => questionTable.id, {
      onDelete: "cascade",
    }),
    eventType: analyticsEventEnum("event_type").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_events_form_id_created_at_idx").on(
      table.formId,
      table.createdAt,
    ),
    index("analytics_events_form_id_event_type_idx").on(
      table.formId,
      table.eventType,
    ),
  ],
);

export type SelectAnalyticsEvent = typeof analyticsEventTable.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEventTable.$inferInsert;
