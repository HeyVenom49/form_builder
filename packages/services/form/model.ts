import { z } from "zod";

export const formStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "CLOSED",
]);

export const questionTypeSchema = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "TIME",
  "DATETIME",
  "URL",
  "RADIO",
  "CHECKBOX",
  "DROPDOWN",
  "FILE_UPLOAD",
  "RATING",
  "YES_NO",
  "SIGNATURE",
  "ADDRESS",
  "LINEAR_SCALE",
  "MULTIPLE_CHOICE_GRID",
  "CHECKBOX_GRID",
]);

export const logicOperatorSchema = z.enum([
  "EQUALS",
  "NOT_EQUALS",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "CONTAINS",
  "NOT_CONTAINS",
  "STARTS_WITH",
  "ENDS_WITH",
  "IS_EMPTY",
  "IS_NOT_EMPTY",
]);

export const logicActionSchema = z.enum([
  "SHOW",
  "HIDE",
  "JUMP_TO",
  "REQUIRE",
  "SKIP",
]);

export const targetTypeSchema = z.enum(["QUESTION", "SECTION", "FORM_END"]);

export const createFormInput = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional().nullable(),
});

export type CreateFormType = z.infer<typeof createFormInput>;

export const updateFormInput = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    })
    .optional(),
  themeId: z.uuid().optional().nullable(),
});

export type UpdateFormType = z.infer<typeof updateFormInput>;

export const updateFormSettingsInput = z.object({
  expiresAt: z.coerce.date().optional().nullable(),
  maxResponses: z.number().int().positive().optional().nullable(),
  requireLogin: z.boolean().optional(),
  allowMultipleResponses: z.boolean().optional(),
  collectEmail: z.boolean().optional(),
  showProgressBar: z.boolean().optional(),
  showQuestionNumbers: z.boolean().optional(),
  acceptResponses: z.boolean().optional(),
  allowEditAfterSubmit: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  responseMessage: z.string().trim().max(5000).optional().nullable(),
  redirectUrl: z.union([z.url(), z.literal("")]).optional().nullable(),
});

export type UpdateFormSettingsType = z.infer<typeof updateFormSettingsInput>;

export const setFormStatusInput = z.object({
  status: formStatusSchema,
});

export type SetFormStatusType = z.infer<typeof setFormStatusInput>;

export const createSectionInput = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
});

export type CreateSectionType = z.infer<typeof createSectionInput>;

export const updateSectionInput = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
});

export type UpdateSectionType = z.infer<typeof updateSectionInput>;

export const reorderInput = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

export type ReorderType = z.infer<typeof reorderInput>;

export const questionOptionInput = z.object({
  label: z.string().trim().min(1).max(500),
  value: z.string().trim().min(1).max(500),
  displayOrder: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
});

export const createQuestionInput = z.object({
  sectionId: z.uuid(),
  title: z.string().trim().min(1).max(1000),
  description: z.string().trim().max(5000).optional().nullable(),
  type: questionTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().trim().max(500).optional().nullable(),
  helpText: z.string().trim().max(2000).optional().nullable(),
  defaultValue: z.unknown().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
  options: z.array(questionOptionInput).optional(),
});

export type CreateQuestionType = z.infer<typeof createQuestionInput>;

export const updateQuestionInput = z.object({
  title: z.string().trim().min(1).max(1000).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  type: questionTypeSchema.optional(),
  required: z.boolean().optional(),
  placeholder: z.string().trim().max(500).optional().nullable(),
  helpText: z.string().trim().max(2000).optional().nullable(),
  defaultValue: z.unknown().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
  sectionId: z.uuid().optional(),
});

export type UpdateQuestionType = z.infer<typeof updateQuestionInput>;

export const createQuestionOptionInput = questionOptionInput.extend({
  questionId: z.uuid(),
});

export type CreateQuestionOptionType = z.infer<typeof createQuestionOptionInput>;

export const updateQuestionOptionInput = z.object({
  label: z.string().trim().min(1).max(500).optional(),
  value: z.string().trim().min(1).max(500).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateQuestionOptionType = z.infer<typeof updateQuestionOptionInput>;

export const createLogicRuleInput = z
  .object({
    sourceQuestionId: z.uuid(),
    targetType: targetTypeSchema,
    targetQuestionId: z.uuid().optional().nullable(),
    targetSectionId: z.uuid().optional().nullable(),
    operator: logicOperatorSchema,
    value: z.unknown().optional().nullable(),
    action: logicActionSchema,
    priority: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "QUESTION" && !data.targetQuestionId) {
      ctx.addIssue({
        code: "custom",
        message: "targetQuestionId is required when targetType is QUESTION",
        path: ["targetQuestionId"],
      });
    }
    if (data.targetType === "SECTION" && !data.targetSectionId) {
      ctx.addIssue({
        code: "custom",
        message: "targetSectionId is required when targetType is SECTION",
        path: ["targetSectionId"],
      });
    }
    if (
      data.targetType === "FORM_END" &&
      (data.targetQuestionId || data.targetSectionId)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "FORM_END must not set question/section targets",
        path: ["targetType"],
      });
    }
  });

export type CreateLogicRuleType = z.infer<typeof createLogicRuleInput>;

export const updateLogicRuleInput = z.object({
  operator: logicOperatorSchema.optional(),
  value: z.unknown().optional().nullable(),
  action: logicActionSchema.optional(),
  priority: z.number().int().min(0).optional(),
  targetType: targetTypeSchema.optional(),
  targetQuestionId: z.uuid().optional().nullable(),
  targetSectionId: z.uuid().optional().nullable(),
});

export type UpdateLogicRuleType = z.infer<typeof updateLogicRuleInput>;
