import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { formTable } from "./form";
import { questionTable } from "./question";
import { sectionTable } from "./section";
import { logicActionEnum, logicOperatorEnum, targetTypeEnum } from "./enums";

export const logicRuleTable = pgTable(
  "logic_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    sourceQuestionId: uuid("source_question_id")
      .notNull()
      .references(() => questionTable.id, { onDelete: "cascade" }),
    targetType: targetTypeEnum("target_type").notNull(),
    targetQuestionId: uuid("target_question_id").references(
      () => questionTable.id,
      { onDelete: "cascade" },
    ),
    targetSectionId: uuid("target_section_id").references(() => sectionTable.id, {
      onDelete: "cascade",
    }),
    operator: logicOperatorEnum("operator").notNull(),
    value: jsonb("value"),
    action: logicActionEnum("action").notNull(),
    priority: integer("priority").notNull().default(0),
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
    index("logic_rules_form_id_idx").on(table.formId),
    index("logic_rules_source_question_id_idx").on(table.sourceQuestionId),
    index("logic_rules_form_id_priority_idx").on(table.formId, table.priority),
    check(
      "logic_rules_target_check",
      sql`(
        (${table.targetType} = 'QUESTION' AND ${table.targetQuestionId} IS NOT NULL AND ${table.targetSectionId} IS NULL)
        OR (${table.targetType} = 'SECTION' AND ${table.targetSectionId} IS NOT NULL AND ${table.targetQuestionId} IS NULL)
        OR (${table.targetType} = 'FORM_END' AND ${table.targetQuestionId} IS NULL AND ${table.targetSectionId} IS NULL)
      )`,
    ),
  ],
);

export type SelectLogicRule = typeof logicRuleTable.$inferSelect;
export type InsertLogicRule = typeof logicRuleTable.$inferInsert;
