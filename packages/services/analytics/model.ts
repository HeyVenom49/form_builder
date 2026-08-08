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

export const trackEventInput = z.object({
  formId: z.uuid(),
  eventType: analyticsEventTypeSchema,
  responseId: z.uuid().optional().nullable(),
  questionId: z.uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type TrackEventType = z.infer<typeof trackEventInput>;
