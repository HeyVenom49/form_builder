import { z } from "zod";

const colorInput = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Color must be a hex value like #fff or #ffffff",
  });

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

export type CreateThemeType = z.infer<typeof createThemeInput>;

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

export type UpdateThemeType = z.infer<typeof updateThemeInput>;

export const assignThemeInput = z.object({
  formId: z.uuid(),
  themeId: z.uuid().nullable(),
});

export type AssignThemeType = z.infer<typeof assignThemeInput>;
