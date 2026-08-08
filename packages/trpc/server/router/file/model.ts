import { z } from "zod";

export const fileProviderSchema = z.enum([
  "LOCAL",
  "S3",
  "R2",
  "CLOUDINARY",
  "SUPABASE",
]);

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

export const registerFileInput = z.object({
  formId: z.uuid().optional().nullable(),
  responseId: z.uuid().optional().nullable(),
  answerId: z.uuid().optional().nullable(),
  provider: fileProviderSchema,
  objectKey: z.string().trim().min(1).max(1024),
  url: z.url(),
  originalFileName: z.string().trim().min(1).max(500),
  mimeType: z.string().trim().min(1).max(200),
  size: z.number().int().nonnegative(),
});

export const fileOutput = z.object({
  id: z.uuid(),
  formId: z.uuid().nullable(),
  ownerId: z.uuid().nullable(),
  responseId: z.uuid().nullable(),
  answerId: z.uuid().nullable(),
  provider: fileProviderSchema,
  objectKey: z.string(),
  url: z.string(),
  originalFileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const fileListOutput = z.array(fileOutput);
