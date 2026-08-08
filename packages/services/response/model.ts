import { z } from "zod";
import { optionalEmailSchema } from "../utils/email";

export const responseStatusSchema = z.enum([
  "STARTED",
  "COMPLETED",
  "ABANDONED",
  "PARTIAL",
]);

export const sessionMetaInput = z
  .object({
    ipAddress: z.string().trim().min(1).optional(),
    userAgent: z.string().trim().min(1).optional(),
  })
  .optional();

export const answerValueInput = z.object({
  questionId: z.uuid(),
  value: z.unknown(),
});

export const startResponseInput = z.object({
  formId: z.uuid(),
  email: optionalEmailSchema,
});

export type StartResponseType = z.infer<typeof startResponseInput>;

export const saveAnswersInput = z.object({
  responseId: z.uuid(),
  answers: z.array(answerValueInput).min(1),
});

export type SaveAnswersType = z.infer<typeof saveAnswersInput>;

export const submitResponseInput = z.object({
  responseId: z.uuid(),
  answers: z.array(answerValueInput).optional(),
  email: optionalEmailSchema,
});

export type SubmitResponseType = z.infer<typeof submitResponseInput>;

export const abandonResponseInput = z.object({
  responseId: z.uuid(),
});

export type AbandonResponseType = z.infer<typeof abandonResponseInput>;
