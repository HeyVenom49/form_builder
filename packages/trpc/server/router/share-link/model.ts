import { z } from "zod";
import { formDetailOutput } from "../form/model";

/**
 * Route API contract for share links.
 * Independent of @repo/services — services own domain validation separately.
 */

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

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

export const updateShareLinkRouteInput = idInput.extend(
  updateShareLinkInput.shape,
);

export const resolveShareLinkInput = z.object({
  slug: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(128).optional(),
});

export const shareLinkOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  slug: z.string(),
  expiresAt: z.date().nullable(),
  maxVisits: z.number().int().nullable(),
  visitCount: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  hasPassword: z.boolean(),
});

export const shareLinkListOutput = z.array(shareLinkOutput);

export const resolveShareLinkOutput = z.object({
  shareLink: shareLinkOutput,
  form: formDetailOutput,
});
