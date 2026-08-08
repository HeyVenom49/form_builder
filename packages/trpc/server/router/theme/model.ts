import { z } from "zod";

/**
 * Route API contract for themes.
 * Independent of @repo/services — services own domain validation separately.
 */

const colorInput = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Color must be a hex value like #fff or #ffffff",
  });

export const idInput = z.object({ id: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

export const createThemeInput = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  primaryColor: colorInput,
  secondaryColor: colorInput,
  backgroundColor: colorInput,
  textColor: colorInput,
  fontFamily: z.string().trim().min(1).max(120),
  borderRadius: z.number().int().min(0).max(64).default(8),
  logoUrl: z.url().optional().nullable(),
  backgroundImageUrl: z.url().optional().nullable(),
  isPublic: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export const updateThemeInput = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  primaryColor: colorInput.optional(),
  secondaryColor: colorInput.optional(),
  backgroundColor: colorInput.optional(),
  textColor: colorInput.optional(),
  fontFamily: z.string().trim().min(1).max(120).optional(),
  borderRadius: z.number().int().min(0).max(64).optional(),
  logoUrl: z.url().optional().nullable(),
  backgroundImageUrl: z.url().optional().nullable(),
  isPublic: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const updateThemeRouteInput = idInput.extend(updateThemeInput.shape);

export const assignThemeInput = z.object({
  formId: z.uuid(),
  themeId: z.uuid().nullable(),
});

export const themeOutput = z.object({
  id: z.uuid(),
  ownerId: z.uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  fontFamily: z.string(),
  borderRadius: z.number().int(),
  logoUrl: z.string().nullable(),
  backgroundImageUrl: z.string().nullable(),
  isPublic: z.boolean(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const themeListOutput = z.array(themeOutput);

export const assignedFormOutput = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "CLOSED"]),
  themeId: z.uuid().nullable(),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
