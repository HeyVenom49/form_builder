import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authTokenTypeEnum } from "./enums";
import { userTable } from "./user";

export const authTokenTable = pgTable(
  "auth_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    email: varchar("email", { length: 256 }).notNull(),
    type: authTokenTypeEnum("type").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(table.tokenHash),
    index("auth_tokens_email_type_idx").on(table.email, table.type),
    index("auth_tokens_user_id_idx").on(table.userId),
  ],
);

export type SelectAuthToken = typeof authTokenTable.$inferSelect;
export type InsertAuthToken = typeof authTokenTable.$inferInsert;
