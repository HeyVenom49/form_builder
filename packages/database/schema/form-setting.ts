import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { formTable } from "./form";

export const formSettingTable = pgTable("form_settings", {
  formId: uuid("form_id")
    .primaryKey()
    .references(() => formTable.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  maxResponses: integer("max_responses"),
  requireLogin: boolean("require_login").notNull().default(false),
  allowMultipleResponses: boolean("allow_multiple_responses")
    .notNull()
    .default(false),
  collectEmail: boolean("collect_email").notNull().default(false),
  showProgressBar: boolean("show_progress_bar").notNull().default(true),
  showQuestionNumbers: boolean("show_question_numbers").notNull().default(true),
  acceptResponses: boolean("accept_responses").notNull().default(true),
  allowEditAfterSubmit: boolean("allow_edit_after_submit")
    .notNull()
    .default(false),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  responseMessage: text("response_message"),
  redirectUrl: text("redirect_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SelectFormSetting = typeof formSettingTable.$inferSelect;
export type InsertFormSetting = typeof formSettingTable.$inferInsert;
