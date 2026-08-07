import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { formTable } from "./form";
import { userTable } from "./user";
import { responseStatusEnum } from "./enums";

export const responseTable = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => userTable.id, {
      onDelete: "set null",
    }),
    email: varchar("email", { length: 256 }),
    status: responseStatusEnum("status").notNull().default("STARTED"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    lastSavedAt: timestamp("last_saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completionTimeSeconds: integer("completion_time_seconds"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("responses_form_id_status_idx").on(table.formId, table.status),
    index("responses_form_id_user_id_idx").on(table.formId, table.userId),
  ],
);

export type SelectResponse = typeof responseTable.$inferSelect;
export type InsertResponse = typeof responseTable.$inferInsert;
