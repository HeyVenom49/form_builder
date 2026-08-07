import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { roleEnum, themeModeEnum } from "./enums";

export const userTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    username: varchar("username", { length: 50 }),
    email: varchar("email", { length: 256 }).notNull(),
    avatarUrl: text("avatar_url"),
    role: roleEnum("user_role").notNull().default("USER"),
    themeMode: themeModeEnum("theme_mode").notNull().default("SYSTEM"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
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
    uniqueIndex("users_email_active_uidx")
      .on(table.email)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("users_username_active_uidx")
      .on(table.username)
      .where(sql`${table.deletedAt} is null and ${table.username} is not null`),
  ],
);

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;
