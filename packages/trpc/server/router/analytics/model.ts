import { z } from "zod";

export const analyticsEventTypeSchema = z.enum([
  "FORM_VIEW",
  "FORM_START",
  "QUESTION_VIEW",
  "QUESTION_ANSWER",
  "SECTION_CHANGE",
  "FORM_SUBMIT",
  "FORM_ABANDON",
  "FOCUS",
  "BLUR",
]);

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });

export const trackEventInput = z.object({
  formId: z.uuid(),
  eventType: analyticsEventTypeSchema,
  responseId: z.uuid().optional().nullable(),
  questionId: z.uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const analyticsEventOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  responseId: z.uuid().nullable(),
  questionId: z.uuid().nullable(),
  eventType: analyticsEventTypeSchema,
  metadata: z.unknown().nullable(),
  createdAt: z.date(),
});

export const analyticsEventListOutput = z.array(analyticsEventOutput);

export const formAnalyticsSummaryOutput = z.object({
  formId: z.uuid(),
  totalEvents: z.number().int(),
  byType: z.record(z.string(), z.number()),
  views: z.number().int(),
  starts: z.number().int(),
  submits: z.number().int(),
  abandons: z.number().int(),
  lastEventAt: z.date().nullable(),
});

export const dailyCountsInput = formIdInput.extend({
  days: z.number().int().min(1).max(90).default(30),
});

export const dailyCountOutput = z.object({
  day: z.string(),
  eventType: analyticsEventTypeSchema,
  count: z.number().int(),
});

export const dailyCountListOutput = z.array(dailyCountOutput);
