import {
  and,
  db,
  desc,
  eq,
  formCollaboratorTable,
  formTable,
  isNotNull,
  isNull,
  userTable,
} from "@repo/database";
import {
  inviteCollaboratorInput,
  updateCollaboratorRoleInput,
  type InviteCollaboratorType,
  type UpdateCollaboratorRoleType,
} from "./model";

const collaboratorUserColumns = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

class CollaboratorService {
  private async assertOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select({ id: formTable.id, ownerId: formTable.ownerId })
      .from(formTable)
      .where(
        and(
          eq(formTable.id, formId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    return form;
  }

  private async assertOwnedCollaborator(
    ownerId: string,
    collaboratorId: string,
  ) {
    const [row] = await db
      .select({
        collaborator: formCollaboratorTable,
        formOwnerId: formTable.ownerId,
      })
      .from(formCollaboratorTable)
      .innerJoin(formTable, eq(formCollaboratorTable.formId, formTable.id))
      .where(
        and(
          eq(formCollaboratorTable.id, collaboratorId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Collaborator not found");
    }

    return row.collaborator;
  }

  private async getCollaboratorDetail(collaboratorId: string) {
    const row = await db.query.formCollaboratorTable.findFirst({
      where: eq(formCollaboratorTable.id, collaboratorId),
      with: {
        user: {
          columns: collaboratorUserColumns,
        },
        form: {
          columns: {
            id: true,
            title: true,
            slug: true,
            status: true,
            ownerId: true,
          },
        },
      },
    });

    if (!row) {
      throw new Error("Collaborator not found");
    }

    return row;
  }

  public async inviteCollaborator(
    ownerId: string,
    payload: InviteCollaboratorType,
  ) {
    const input = await inviteCollaboratorInput.parseAsync(payload);
    const form = await this.assertOwnedForm(ownerId, input.formId);

    const [invitee] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.email, input.email), isNull(userTable.deletedAt)))
      .limit(1);

    if (!invitee) {
      throw new Error("User not found for that email");
    }

    if (invitee.id === form.ownerId) {
      throw new Error("Form owner cannot be invited as a collaborator");
    }

    const [existing] = await db
      .select({ id: formCollaboratorTable.id })
      .from(formCollaboratorTable)
      .where(
        and(
          eq(formCollaboratorTable.formId, form.id),
          eq(formCollaboratorTable.userId, invitee.id),
        ),
      )
      .limit(1);

    if (existing) {
      throw new Error("User is already a collaborator on this form");
    }

    const [created] = await db
      .insert(formCollaboratorTable)
      .values({
        formId: form.id,
        userId: invitee.id,
        role: input.role,
        invitedBy: ownerId,
        acceptedAt: null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to invite collaborator");
    }

    return this.getCollaboratorDetail(created.id);
  }

  public async listCollaborators(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    return db.query.formCollaboratorTable.findMany({
      where: eq(formCollaboratorTable.formId, formId),
      orderBy: [desc(formCollaboratorTable.createdAt)],
      with: {
        user: {
          columns: collaboratorUserColumns,
        },
      },
    });
  }

  public async updateCollaboratorRole(
    ownerId: string,
    collaboratorId: string,
    payload: UpdateCollaboratorRoleType,
  ) {
    const input = await updateCollaboratorRoleInput.parseAsync(payload);
    await this.assertOwnedCollaborator(ownerId, collaboratorId);

    const [updated] = await db
      .update(formCollaboratorTable)
      .set({ role: input.role })
      .where(eq(formCollaboratorTable.id, collaboratorId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update collaborator role");
    }

    return this.getCollaboratorDetail(updated.id);
  }

  public async removeCollaborator(ownerId: string, collaboratorId: string) {
    await this.assertOwnedCollaborator(ownerId, collaboratorId);

    await db
      .delete(formCollaboratorTable)
      .where(eq(formCollaboratorTable.id, collaboratorId));

    return { ok: true as const };
  }

  public async acceptInvite(userId: string, collaboratorId: string) {
    const [row] = await db
      .select()
      .from(formCollaboratorTable)
      .where(
        and(
          eq(formCollaboratorTable.id, collaboratorId),
          eq(formCollaboratorTable.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Invite not found");
    }

    if (row.acceptedAt) {
      return this.getCollaboratorDetail(row.id);
    }

    const [updated] = await db
      .update(formCollaboratorTable)
      .set({ acceptedAt: new Date() })
      .where(eq(formCollaboratorTable.id, collaboratorId))
      .returning();

    if (!updated) {
      throw new Error("Failed to accept invite");
    }

    return this.getCollaboratorDetail(updated.id);
  }

  public async declineInvite(userId: string, collaboratorId: string) {
    const [row] = await db
      .select({ id: formCollaboratorTable.id, acceptedAt: formCollaboratorTable.acceptedAt })
      .from(formCollaboratorTable)
      .where(
        and(
          eq(formCollaboratorTable.id, collaboratorId),
          eq(formCollaboratorTable.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Invite not found");
    }

    if (row.acceptedAt) {
      throw new Error("Accepted invites cannot be declined; leave the form instead");
    }

    await db
      .delete(formCollaboratorTable)
      .where(eq(formCollaboratorTable.id, collaboratorId));

    return { ok: true as const };
  }

  public async leaveForm(userId: string, collaboratorId: string) {
    const [row] = await db
      .select({ id: formCollaboratorTable.id })
      .from(formCollaboratorTable)
      .where(
        and(
          eq(formCollaboratorTable.id, collaboratorId),
          eq(formCollaboratorTable.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Collaborator not found");
    }

    await db
      .delete(formCollaboratorTable)
      .where(eq(formCollaboratorTable.id, collaboratorId));

    return { ok: true as const };
  }

  public async listMyInvites(userId: string) {
    return db.query.formCollaboratorTable.findMany({
      where: and(
        eq(formCollaboratorTable.userId, userId),
        isNull(formCollaboratorTable.acceptedAt),
      ),
      orderBy: [desc(formCollaboratorTable.createdAt)],
      with: {
        form: {
          columns: {
            id: true,
            title: true,
            slug: true,
            status: true,
            ownerId: true,
          },
        },
      },
    });
  }

  public async listSharedWithMe(userId: string) {
    return db.query.formCollaboratorTable.findMany({
      where: and(
        eq(formCollaboratorTable.userId, userId),
        isNotNull(formCollaboratorTable.acceptedAt),
      ),
      orderBy: [desc(formCollaboratorTable.createdAt)],
      with: {
        form: {
          columns: {
            id: true,
            title: true,
            slug: true,
            status: true,
            ownerId: true,
          },
        },
      },
    });
  }
}

export default CollaboratorService;
