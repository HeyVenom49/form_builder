import { z } from "zod";
import { optionalEmailSchema } from "../../utils/email";

/**
 * Route API contract for responses.
 * Independent of @repo/services — services own domain validation separately.
 */

export const responseStatusSchema = z.enum([
  "STARTED",
  "COMPLETED",
  "ABANDONED",
  "PARTIAL",
]);

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

export const answerValueInput = z.object({
  questionId: z.uuid(),
  value: z.unknown(),
});

export const startResponseInput = z.object({
  formId: z.uuid(),
  email: optionalEmailSchema,
});

export const saveAnswersInput = z.object({
  responseId: z.uuid(),
  answers: z.array(answerValueInput).min(1),
});

export const submitResponseInput = z.object({
  responseId: z.uuid(),
  answers: z.array(answerValueInput).optional(),
  email: optionalEmailSchema,
});

export const abandonResponseInput = z.object({
  responseId: z.uuid(),
});

export const answerOutput = z.object({
  id: z.uuid(),
  responseId: z.uuid(),
  questionId: z.uuid(),
  value: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const responseOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  userId: z.uuid().nullable(),
  email: z.string().nullable(),
  status: responseStatusSchema,
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  submittedAt: z.date().nullable(),
  lastSavedAt: z.date(),
  completionTimeSeconds: z.number().int().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const responseDetailOutput = responseOutput.extend({
  answers: z.array(answerOutput),
});

export const responseListOutput = z.array(responseOutput);
