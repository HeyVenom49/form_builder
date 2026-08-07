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
import { questionTable } from "./question";

export const questionOptionTable = pgTable(
  "question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionTable.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
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
    uniqueIndex("question_options_question_value_active_uidx")
      .on(table.questionId, table.value)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("question_options_question_default_uidx")
      .on(table.questionId)
      .where(sql`${table.isDefault} = true and ${table.deletedAt} is null`),
  ],
);

export type SelectQuestionOption = typeof questionOptionTable.$inferSelect;
export type InsertQuestionOption = typeof questionOptionTable.$inferInsert;
