import { z } from "zod";

/**
 * Route API contract for forms.
 * Independent of @repo/services — services own domain validation separately.
 */

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

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });
export const sectionIdInput = z.object({ sectionId: z.uuid() });
export const questionIdInput = z.object({ questionId: z.uuid() });
export const optionIdInput = z.object({ optionId: z.uuid() });
export const ruleIdInput = z.object({ ruleId: z.uuid() });

export const okOutput = z.object({ ok: z.literal(true) });

export const createFormInput = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const updateFormInput = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  themeId: z.uuid().optional().nullable(),
});

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

export const setFormStatusInput = z.object({
  status: formStatusSchema,
});

export const createSectionInput = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateSectionInput = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const reorderInput = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

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

export const createQuestionOptionInput = questionOptionInput.extend({
  questionId: z.uuid(),
});

export const updateQuestionOptionInput = z.object({
  label: z.string().trim().min(1).max(500).optional(),
  value: z.string().trim().min(1).max(500).optional(),
  isDefault: z.boolean().optional(),
});

/** Shared field shape — keep as ZodObject (no .and / .superRefine) for OpenAPI. */
const createLogicRuleFields = {
  sourceQuestionId: z.uuid(),
  targetType: targetTypeSchema,
  targetQuestionId: z.uuid().optional().nullable(),
  targetSectionId: z.uuid().optional().nullable(),
  operator: logicOperatorSchema,
  value: z.unknown().optional().nullable(),
  action: logicActionSchema,
  priority: z.number().int().min(0).optional(),
};

function refineCreateLogicRule(
  data: {
    targetType: z.infer<typeof targetTypeSchema>;
    targetQuestionId?: string | null;
    targetSectionId?: string | null;
  },
  ctx: z.RefinementCtx,
) {
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
}

export const createLogicRuleInput = z
  .object(createLogicRuleFields)
  .superRefine(refineCreateLogicRule);

export const updateLogicRuleInput = z.object({
  operator: logicOperatorSchema.optional(),
  value: z.unknown().optional().nullable(),
  action: logicActionSchema.optional(),
  priority: z.number().int().min(0).optional(),
  targetType: targetTypeSchema.optional(),
  targetQuestionId: z.uuid().optional().nullable(),
  targetSectionId: z.uuid().optional().nullable(),
});

export const formOutput = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: formStatusSchema,
  themeId: z.uuid().nullable(),
  publishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const formSettingsOutput = z.object({
  formId: z.uuid(),
  passwordHash: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  maxResponses: z.number().nullable(),
  requireLogin: z.boolean(),
  allowMultipleResponses: z.boolean(),
  collectEmail: z.boolean(),
  showProgressBar: z.boolean(),
  showQuestionNumbers: z.boolean(),
  acceptResponses: z.boolean(),
  allowEditAfterSubmit: z.boolean(),
  shuffleQuestions: z.boolean(),
  responseMessage: z.string().nullable(),
  redirectUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const questionOptionOutput = z.object({
  id: z.uuid(),
  questionId: z.uuid(),
  label: z.string(),
  value: z.string(),
  displayOrder: z.number(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const questionOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  sectionId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  type: questionTypeSchema,
  required: z.boolean(),
  placeholder: z.string().nullable(),
  helpText: z.string().nullable(),
  defaultValue: z.unknown().nullable(),
  displayOrder: z.number(),
  settings: z.unknown().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  options: z.array(questionOptionOutput).optional(),
});

export const sectionOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  displayOrder: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  questions: z.array(questionOutput).optional(),
});

export const logicRuleOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  sourceQuestionId: z.uuid(),
  targetType: targetTypeSchema,
  targetQuestionId: z.uuid().nullable(),
  targetSectionId: z.uuid().nullable(),
  operator: logicOperatorSchema,
  value: z.unknown().nullable(),
  action: logicActionSchema,
  priority: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const formDetailOutput = formOutput.extend({
  settings: formSettingsOutput.nullable(),
  sections: z.array(sectionOutput),
  logicRules: z.array(logicRuleOutput),
});

export const createSectionRouteInput = formIdInput.extend(
  createSectionInput.shape,
);
export const reorderSectionsRouteInput = formIdInput.extend(reorderInput.shape);
export const reorderQuestionsRouteInput = sectionIdInput.extend(
  reorderInput.shape,
);
export const reorderOptionsRouteInput = questionIdInput.extend(
  reorderInput.shape,
);
/** Must stay a plain ZodObject — trpc-to-openapi rejects .and() / ZodEffects. */
export const createLogicRuleRouteInput =
  formIdInput.extend(createLogicRuleFields);
export const updateFormRouteInput = idInput.extend(updateFormInput.shape);
export const updateFormSettingsRouteInput = formIdInput.extend(
  updateFormSettingsInput.shape,
);
export const setFormStatusRouteInput = idInput.extend(setFormStatusInput.shape);
export const updateSectionRouteInput = idInput.extend(updateSectionInput.shape);
export const updateQuestionRouteInput = idInput.extend(
  updateQuestionInput.shape,
);
export const updateOptionRouteInput = optionIdInput.extend(
  updateQuestionOptionInput.shape,
);
export const updateLogicRuleRouteInput = ruleIdInput.extend(
  updateLogicRuleInput.shape,
);
