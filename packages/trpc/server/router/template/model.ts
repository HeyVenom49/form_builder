import { z } from "zod";
import { formDetailOutput } from "../form/model";

export const idInput = z.object({ id: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

export const createTemplateFromFormInput = z.object({
  formId: z.uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  category: z.string().trim().min(1).max(100),
  previewImageUrl: z.url().optional().nullable(),
  thumbnailUrl: z.url().optional().nullable(),
  isPublic: z.boolean().default(false),
});

export const updateTemplateInput = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  category: z.string().trim().min(1).max(100).optional(),
  previewImageUrl: z.url().optional().nullable(),
  thumbnailUrl: z.url().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const updateTemplateRouteInput = idInput.extend(
  updateTemplateInput.shape,
);

export const useTemplateInput = z.object({
  templateId: z.uuid(),
  title: z.string().trim().min(1).max(300).optional(),
});

export const listPublicTemplatesInput = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
  })
  .optional();

export const templateOutput = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  sourceFormId: z.uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  snapshot: z.record(z.string(), z.unknown()),
  previewImageUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  isPublic: z.boolean(),
  isOfficial: z.boolean(),
  usageCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const templateListOutput = z.array(templateOutput);

export { formDetailOutput };
