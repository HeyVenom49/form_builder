import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { formStatusEnum } from "./enums";
import { themeTable } from "./theme";

export const formTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 300 }).notNull(),
    status: formStatusEnum("form_status").notNull().default("DRAFT"),
    themeId: uuid("theme_id").references(() => themeTable.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [unique().on(table.ownerId, table.slug)],
);

export type SelectForm = typeof formTable.$inferSelect;
export type InsertForm = typeof formTable.$inferInsert;
