import { z } from "zod";
import { emailSchema } from "../utils/email";

export const collaboratorRoleSchema = z.enum(["EDITOR", "VIEWER"]);

export const inviteCollaboratorInput = z.object({
  formId: z.uuid(),
  email: emailSchema,
  role: collaboratorRoleSchema.default("VIEWER"),
});

export type InviteCollaboratorType = z.infer<typeof inviteCollaboratorInput>;

export const updateCollaboratorRoleInput = z.object({
  role: collaboratorRoleSchema,
});

export type UpdateCollaboratorRoleType = z.infer<
  typeof updateCollaboratorRoleInput
>;
