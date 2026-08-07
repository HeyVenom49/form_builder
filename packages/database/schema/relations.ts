import { relations } from "drizzle-orm";
import { userTable } from "./user";
import { accountTable } from "./account";
import { sessionTable } from "./session";
import { authTokenTable } from "./auth-token";
import { themeTable } from "./theme";
import { formTable } from "./form";
import { formSettingTable } from "./form-setting";
import { formCollaboratorTable } from "./form-collaborator";
import { templateTable } from "./template";
import { sectionTable } from "./section";
import { questionTable } from "./question";
import { questionOptionTable } from "./question-option";
import { logicRuleTable } from "./logic-rule";
import { responseTable } from "./response";
import { answerTable } from "./answer";
import { fileTable } from "./file";
import { analyticsEventTable } from "./analyticsEvent";
import { shareLinkTable } from "./shareLink";
import { webhookTable } from "./webhook";
import { webhookDeliveryTable } from "./webhook-delivery";

export const userRelations = relations(userTable, ({ many }) => ({
  accounts: many(accountTable),
  sessions: many(sessionTable),
  authTokens: many(authTokenTable),
  themes: many(themeTable),
  ownedForms: many(formTable),
  templates: many(templateTable),
  responses: many(responseTable),
  files: many(fileTable),
  collaborations: many(formCollaboratorTable, {
    relationName: "collaborator_user",
  }),
  sentInvites: many(formCollaboratorTable, {
    relationName: "collaborator_inviter",
  }),
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const authTokenRelations = relations(authTokenTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authTokenTable.userId],
    references: [userTable.id],
  }),
}));

export const themeRelations = relations(themeTable, ({ one, many }) => ({
  owner: one(userTable, {
    fields: [themeTable.ownerId],
    references: [userTable.id],
  }),
  forms: many(formTable),
}));

export const formRelations = relations(formTable, ({ one, many }) => ({
  owner: one(userTable, {
    fields: [formTable.ownerId],
    references: [userTable.id],
  }),
  theme: one(themeTable, {
    fields: [formTable.themeId],
    references: [themeTable.id],
  }),
  settings: one(formSettingTable, {
    fields: [formTable.id],
    references: [formSettingTable.formId],
  }),
  sections: many(sectionTable),
  questions: many(questionTable),
  logicRules: many(logicRuleTable),
  responses: many(responseTable),
  collaborators: many(formCollaboratorTable),
  shareLinks: many(shareLinkTable),
  webhooks: many(webhookTable),
  templates: many(templateTable),
  files: many(fileTable),
  analyticsEvents: many(analyticsEventTable),
}));

export const formSettingRelations = relations(formSettingTable, ({ one }) => ({
  form: one(formTable, {
    fields: [formSettingTable.formId],
    references: [formTable.id],
  }),
}));

export const formCollaboratorRelations = relations(
  formCollaboratorTable,
  ({ one }) => ({
    form: one(formTable, {
      fields: [formCollaboratorTable.formId],
      references: [formTable.id],
    }),
    user: one(userTable, {
      fields: [formCollaboratorTable.userId],
      references: [userTable.id],
      relationName: "collaborator_user",
    }),
    inviter: one(userTable, {
      fields: [formCollaboratorTable.invitedBy],
      references: [userTable.id],
      relationName: "collaborator_inviter",
    }),
  }),
);

export const templateRelations = relations(templateTable, ({ one }) => ({
  owner: one(userTable, {
    fields: [templateTable.ownerId],
    references: [userTable.id],
  }),
  sourceForm: one(formTable, {
    fields: [templateTable.sourceFormId],
    references: [formTable.id],
  }),
}));

export const sectionRelations = relations(sectionTable, ({ one, many }) => ({
  form: one(formTable, {
    fields: [sectionTable.formId],
    references: [formTable.id],
  }),
  questions: many(questionTable),
  targetedLogicRules: many(logicRuleTable, {
    relationName: "logic_target_section",
  }),
}));

export const questionRelations = relations(questionTable, ({ one, many }) => ({
  form: one(formTable, {
    fields: [questionTable.formId],
    references: [formTable.id],
  }),
  section: one(sectionTable, {
    fields: [questionTable.sectionId],
    references: [sectionTable.id],
  }),
  options: many(questionOptionTable),
  answers: many(answerTable),
  analyticsEvents: many(analyticsEventTable),
  sourceLogicRules: many(logicRuleTable, {
    relationName: "logic_source_question",
  }),
  targetedLogicRules: many(logicRuleTable, {
    relationName: "logic_target_question",
  }),
}));

export const questionOptionRelations = relations(
  questionOptionTable,
  ({ one }) => ({
    question: one(questionTable, {
      fields: [questionOptionTable.questionId],
      references: [questionTable.id],
    }),
  }),
);

export const logicRuleRelations = relations(logicRuleTable, ({ one }) => ({
  form: one(formTable, {
    fields: [logicRuleTable.formId],
    references: [formTable.id],
  }),
  sourceQuestion: one(questionTable, {
    fields: [logicRuleTable.sourceQuestionId],
    references: [questionTable.id],
    relationName: "logic_source_question",
  }),
  targetQuestion: one(questionTable, {
    fields: [logicRuleTable.targetQuestionId],
    references: [questionTable.id],
    relationName: "logic_target_question",
  }),
  targetSection: one(sectionTable, {
    fields: [logicRuleTable.targetSectionId],
    references: [sectionTable.id],
    relationName: "logic_target_section",
  }),
}));

export const responseRelations = relations(responseTable, ({ one, many }) => ({
  form: one(formTable, {
    fields: [responseTable.formId],
    references: [formTable.id],
  }),
  user: one(userTable, {
    fields: [responseTable.userId],
    references: [userTable.id],
  }),
  answers: many(answerTable),
  files: many(fileTable),
  analyticsEvents: many(analyticsEventTable),
}));

export const answerRelations = relations(answerTable, ({ one, many }) => ({
  response: one(responseTable, {
    fields: [answerTable.responseId],
    references: [responseTable.id],
  }),
  question: one(questionTable, {
    fields: [answerTable.questionId],
    references: [questionTable.id],
  }),
  files: many(fileTable),
}));

export const fileRelations = relations(fileTable, ({ one }) => ({
  form: one(formTable, {
    fields: [fileTable.formId],
    references: [formTable.id],
  }),
  owner: one(userTable, {
    fields: [fileTable.ownerId],
    references: [userTable.id],
  }),
  response: one(responseTable, {
    fields: [fileTable.responseId],
    references: [responseTable.id],
  }),
  answer: one(answerTable, {
    fields: [fileTable.answerId],
    references: [answerTable.id],
  }),
}));

export const analyticsEventRelations = relations(
  analyticsEventTable,
  ({ one }) => ({
    form: one(formTable, {
      fields: [analyticsEventTable.formId],
      references: [formTable.id],
    }),
    response: one(responseTable, {
      fields: [analyticsEventTable.responseId],
      references: [responseTable.id],
    }),
    question: one(questionTable, {
      fields: [analyticsEventTable.questionId],
      references: [questionTable.id],
    }),
  }),
);

export const shareLinkRelations = relations(shareLinkTable, ({ one }) => ({
  form: one(formTable, {
    fields: [shareLinkTable.formId],
    references: [formTable.id],
  }),
}));

export const webhookRelations = relations(webhookTable, ({ one, many }) => ({
  form: one(formTable, {
    fields: [webhookTable.formId],
    references: [formTable.id],
  }),
  deliveries: many(webhookDeliveryTable),
}));

export const webhookDeliveryRelations = relations(
  webhookDeliveryTable,
  ({ one }) => ({
    webhook: one(webhookTable, {
      fields: [webhookDeliveryTable.webhookId],
      references: [webhookTable.id],
    }),
  }),
);
