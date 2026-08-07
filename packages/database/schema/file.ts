import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { answerTable } from "./answer";
import { responseTable } from "./response";
import { userTable } from "./user";
import { formTable } from "./form";
import { fileProviderEnum } from "./enums";

export const fileTable = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").references(() => formTable.id, {
      onDelete: "cascade",
    }),
    ownerId: uuid("owner_id").references(() => userTable.id, {
      onDelete: "set null",
    }),
    responseId: uuid("response_id").references(() => responseTable.id, {
      onDelete: "cascade",
    }),
    answerId: uuid("answer_id").references(() => answerTable.id, {
      onDelete: "cascade",
    }),
    provider: fileProviderEnum("provider").notNull(),
    objectKey: text("object_key").notNull(),
    url: text("url").notNull(),
    originalFileName: text("original_file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
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
    index("files_form_id_idx").on(table.formId),
    index("files_response_id_idx").on(table.responseId),
    index("files_answer_id_idx").on(table.answerId),
  ],
);

export type SelectFile = typeof fileTable.$inferSelect;
export type InsertFile = typeof fileTable.$inferInsert;
