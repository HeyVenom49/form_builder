import { z } from "zod";

export const createShareLinkInput = z.object({
  formId: z.uuid(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric with hyphens",
    })
    .optional(),
  password: z.string().min(4).max(128).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  maxVisits: z.number().int().positive().optional().nullable(),
});

export type CreateShareLinkType = z.infer<typeof createShareLinkInput>;

export const updateShareLinkInput = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric with hyphens",
    })
    .optional(),
  password: z.string().min(4).max(128).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  maxVisits: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateShareLinkType = z.infer<typeof updateShareLinkInput>;

export const resolveShareLinkInput = z.object({
  slug: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(128).optional(),
});

export type ResolveShareLinkType = z.infer<typeof resolveShareLinkInput>;
