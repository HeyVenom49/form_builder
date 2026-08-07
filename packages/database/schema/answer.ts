import { jsonb, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { questionTable } from "./question";
import { responseTable } from "./response";

export const answerTable = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => responseTable.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionTable.id, { onDelete: "restrict" }),
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.responseId, table.questionId)],
);

export type SelectAnswer = typeof answerTable.$inferSelect;
export type InsertAnswer = typeof answerTable.$inferInsert;
