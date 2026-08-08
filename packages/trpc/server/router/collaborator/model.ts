import { z } from "zod";
import { emailSchema } from "../../utils/email";

/**
 * Route API contract for collaborators.
 * Independent of @repo/services — services own domain validation separately.
 */

export const collaboratorRoleSchema = z.enum(["EDITOR", "VIEWER"]);

export const idInput = z.object({ id: z.uuid() });
export const formIdInput = z.object({ formId: z.uuid() });
export const okOutput = z.object({ ok: z.literal(true) });

export const inviteCollaboratorInput = z.object({
  formId: z.uuid(),
  email: emailSchema,
  role: collaboratorRoleSchema.default("VIEWER"),
});

export const updateCollaboratorRoleRouteInput = idInput.extend({
  role: collaboratorRoleSchema,
});

export const collaboratorUserOutput = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
});

export const collaboratorFormOutput = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "CLOSED"]),
  ownerId: z.uuid(),
});

export const collaboratorOutput = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  userId: z.uuid(),
  role: collaboratorRoleSchema,
  invitedBy: z.uuid().nullable(),
  acceptedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: collaboratorUserOutput.optional(),
  form: collaboratorFormOutput.optional(),
});

export const collaboratorListOutput = z.array(collaboratorOutput);
