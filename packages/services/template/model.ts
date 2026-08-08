import { z } from "zod";

export const createTemplateFromFormInput = z.object({
  formId: z.uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  category: z.string().trim().min(1).max(100),
  previewImageUrl: z.url().optional().nullable(),
  thumbnailUrl: z.url().optional().nullable(),
  isPublic: z.boolean().default(false),
});

export type CreateTemplateFromFormType = z.infer<
  typeof createTemplateFromFormInput
>;

export const updateTemplateInput = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  category: z.string().trim().min(1).max(100).optional(),
  previewImageUrl: z.url().optional().nullable(),
  thumbnailUrl: z.url().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export type UpdateTemplateType = z.infer<typeof updateTemplateInput>;

export const useTemplateInput = z.object({
  templateId: z.uuid(),
  title: z.string().trim().min(1).max(300).optional(),
});

export type UseTemplateType = z.infer<typeof useTemplateInput>;
