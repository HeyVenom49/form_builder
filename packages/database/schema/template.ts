import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { formTable } from "./form";

export const templateTable = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  sourceFormId: uuid("source_form_id").references(() => formTable.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  snapshot: jsonb("snapshot").notNull().$type<Record<string, unknown>>(),
  previewImageUrl: text("preview_image_url"),
  thumbnailUrl: text("thumbnail_url"),
  isPublic: boolean("is_public").notNull().default(false),
  isOfficial: boolean("is_official").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type SelectTemplate = typeof templateTable.$inferSelect;
export type InsertTemplate = typeof templateTable.$inferInsert;
