import {
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { collaboratorRoleEnum } from "./enums";
import { formTable } from "./form";
import { userTable } from "./user";

export const formCollaboratorTable = pgTable(
  "form_collaborators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    role: collaboratorRoleEnum("role").notNull().default("VIEWER"),
    invitedBy: uuid("invited_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique().on(table.formId, table.userId),
    index("form_collaborators_user_id_idx").on(table.userId),
  ],
);

export type SelectFormCollaborator = typeof formCollaboratorTable.$inferSelect;
export type InsertFormCollaborator = typeof formCollaboratorTable.$inferInsert;
