import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userTable } from "./user";

export const themeTable = pgTable(
  "themes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    primaryColor: text("primary_color").notNull(),
    secondaryColor: text("secondary_color").notNull(),
    backgroundColor: text("background_color").notNull(),
    textColor: text("text_color").notNull(),
    fontFamily: text("font_family").notNull(),
    borderRadius: integer("border_radius").notNull().default(8),
    logoUrl: text("logo_url"),
    backgroundImageUrl: text("background_image_url"),
    isPublic: boolean("is_public").notNull().default(false),
    isDefault: boolean("is_default").notNull().default(false),
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
    uniqueIndex("themes_owner_default_uidx")
      .on(table.ownerId)
      .where(sql`${table.isDefault} = true and ${table.deletedAt} is null`),
  ],
);

export type SelectTheme = typeof themeTable.$inferSelect;
export type InsertTheme = typeof themeTable.$inferInsert;
