import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { formTable } from "./form";

export const shareLinkTable = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    passwordHash: text("password_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    maxVisits: integer("max_visits"),
    visitCount: integer("visit_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.slug)],
);

export type SelectShareLink = typeof shareLinkTable.$inferSelect;
export type InsertShareLink = typeof shareLinkTable.$inferInsert;
