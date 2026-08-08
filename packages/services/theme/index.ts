import {
  and,
  db,
  desc,
  eq,
  formTable,
  isNull,
  or,
  themeTable,
} from "@repo/database";
import {
  assignThemeInput,
  createThemeInput,
  updateThemeInput,
  type AssignThemeType,
  type CreateThemeType,
  type UpdateThemeType,
} from "./model";

class ThemeService {
  private async assertOwnedTheme(ownerId: string, themeId: string) {
    const [theme] = await db
      .select()
      .from(themeTable)
      .where(
        and(
          eq(themeTable.id, themeId),
          eq(themeTable.ownerId, ownerId),
          isNull(themeTable.deletedAt),
        ),
      )
      .limit(1);

    if (!theme) {
      throw new Error("Theme not found");
    }

    return theme;
  }

  private async assertUsableTheme(ownerId: string, themeId: string) {
    const [theme] = await db
      .select()
      .from(themeTable)
      .where(
        and(
          eq(themeTable.id, themeId),
          isNull(themeTable.deletedAt),
          or(eq(themeTable.ownerId, ownerId), eq(themeTable.isPublic, true)),
        ),
      )
      .limit(1);

    if (!theme) {
      throw new Error("Theme not found");
    }

    return theme;
  }

  public async createTheme(ownerId: string, payload: CreateThemeType) {
    const input = await createThemeInput.parseAsync(payload);

    if (input.isDefault) {
      await db
        .update(themeTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(themeTable.ownerId, ownerId),
            eq(themeTable.isDefault, true),
            isNull(themeTable.deletedAt),
          ),
        );
    }

    const [created] = await db
      .insert(themeTable)
      .values({
        ownerId,
        name: input.name,
        description: input.description ?? null,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        backgroundColor: input.backgroundColor,
        textColor: input.textColor,
        fontFamily: input.fontFamily,
        borderRadius: input.borderRadius,
        logoUrl: input.logoUrl ?? null,
        backgroundImageUrl: input.backgroundImageUrl ?? null,
        isPublic: input.isPublic,
        isDefault: input.isDefault,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create theme");
    }

    return created;
  }

  public async listMyThemes(ownerId: string) {
    return db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.ownerId, ownerId), isNull(themeTable.deletedAt)))
      .orderBy(desc(themeTable.createdAt));
  }

  public async listPublicThemes() {
    return db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.isPublic, true), isNull(themeTable.deletedAt)))
      .orderBy(desc(themeTable.createdAt));
  }

  public async getTheme(themeId: string, viewerId?: string | null) {
    const [theme] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), isNull(themeTable.deletedAt)))
      .limit(1);

    if (!theme) {
      throw new Error("Theme not found");
    }

    const canView =
      theme.isPublic || (viewerId != null && theme.ownerId === viewerId);

    if (!canView) {
      throw new Error("Theme not found");
    }

    return theme;
  }

  public async updateTheme(
    ownerId: string,
    themeId: string,
    payload: UpdateThemeType,
  ) {
    const input = await updateThemeInput.parseAsync(payload);
    await this.assertOwnedTheme(ownerId, themeId);

    if (input.isDefault === true) {
      await db
        .update(themeTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(themeTable.ownerId, ownerId),
            eq(themeTable.isDefault, true),
            isNull(themeTable.deletedAt),
          ),
        );
    }

    const [updated] = await db
      .update(themeTable)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.primaryColor !== undefined
          ? { primaryColor: input.primaryColor }
          : {}),
        ...(input.secondaryColor !== undefined
          ? { secondaryColor: input.secondaryColor }
          : {}),
        ...(input.backgroundColor !== undefined
          ? { backgroundColor: input.backgroundColor }
          : {}),
        ...(input.textColor !== undefined ? { textColor: input.textColor } : {}),
        ...(input.fontFamily !== undefined
          ? { fontFamily: input.fontFamily }
          : {}),
        ...(input.borderRadius !== undefined
          ? { borderRadius: input.borderRadius }
          : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.backgroundImageUrl !== undefined
          ? { backgroundImageUrl: input.backgroundImageUrl }
          : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      })
      .where(eq(themeTable.id, themeId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update theme");
    }

    return updated;
  }

  public async setDefaultTheme(ownerId: string, themeId: string) {
    await this.assertOwnedTheme(ownerId, themeId);

    await db.transaction(async (tx) => {
      await tx
        .update(themeTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(themeTable.ownerId, ownerId),
            eq(themeTable.isDefault, true),
            isNull(themeTable.deletedAt),
          ),
        );

      await tx
        .update(themeTable)
        .set({ isDefault: true })
        .where(eq(themeTable.id, themeId));
    });

    return this.assertOwnedTheme(ownerId, themeId);
  }

  public async deleteTheme(ownerId: string, themeId: string) {
    await this.assertOwnedTheme(ownerId, themeId);

    await db
      .update(themeTable)
      .set({ deletedAt: new Date(), isDefault: false })
      .where(eq(themeTable.id, themeId));

    await db
      .update(formTable)
      .set({ themeId: null })
      .where(and(eq(formTable.themeId, themeId), eq(formTable.ownerId, ownerId)));

    return { ok: true as const };
  }

  public async assignThemeToForm(ownerId: string, payload: AssignThemeType) {
    const input = await assignThemeInput.parseAsync(payload);

    const [form] = await db
      .select({ id: formTable.id })
      .from(formTable)
      .where(
        and(
          eq(formTable.id, input.formId),
          eq(formTable.ownerId, ownerId),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (input.themeId) {
      await this.assertUsableTheme(ownerId, input.themeId);
    }

    const [updated] = await db
      .update(formTable)
      .set({ themeId: input.themeId })
      .where(eq(formTable.id, input.formId))
      .returning();

    if (!updated) {
      throw new Error("Failed to assign theme");
    }

    return updated;
  }
}

export default ThemeService;
