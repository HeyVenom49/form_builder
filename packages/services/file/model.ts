import { z } from "zod";

export const fileProviderSchema = z.enum([
  "LOCAL",
  "S3",
  "R2",
  "CLOUDINARY",
  "SUPABASE",
]);

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

export type RegisterFileType = z.infer<typeof registerFileInput>;
