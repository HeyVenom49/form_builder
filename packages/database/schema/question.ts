import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { formTable } from "./form";
import { sectionTable } from "./section";
import { questionTypeEnum } from "./enums";

export const questionTable = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sectionTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    type: questionTypeEnum("type").notNull(),
    required: boolean("required").notNull().default(false),
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    defaultValue: jsonb("default_value"),
    displayOrder: integer("display_order").notNull().default(0),
    settings: jsonb("settings"),
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
    index("questions_form_id_idx").on(table.formId),
    index("questions_section_id_display_order_idx").on(
      table.sectionId,
      table.displayOrder,
    ),
  ],
);

export type SelectQuestion = typeof questionTable.$inferSelect;
export type InsertQuestion = typeof questionTable.$inferInsert;
