import {
  and,
  db,
  desc,
  eq,
  formSettingTable,
  formTable,
  isNull,
  logicRuleTable,
  questionOptionTable,
  questionTable,
  sectionTable,
  sql,
  templateTable,
} from "@repo/database";
import FormService from "../form";
import { slugify } from "../form/slug";
import {
  createTemplateFromFormInput,
  updateTemplateInput,
  useTemplateInput,
  type CreateTemplateFromFormType,
  type UpdateTemplateType,
  type UseTemplateType,
} from "./model";

type SnapshotQuestion = {
  key: string;
  title: string;
  description: string | null;
  type: string;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  defaultValue: unknown;
  displayOrder: number;
  settings: unknown;
  options: Array<{
    label: string;
    value: string;
    displayOrder: number;
    isDefault: boolean;
  }>;
};

type SnapshotSection = {
  key: string;
  title: string;
  description: string | null;
  displayOrder: number;
  questions: SnapshotQuestion[];
};

type SnapshotLogicRule = {
  sourceQuestionKey: string;
  targetType: "QUESTION" | "SECTION" | "FORM_END";
  targetQuestionKey: string | null;
  targetSectionKey: string | null;
  operator: string;
  value: unknown;
  action: string;
  priority: number;
};

type FormSnapshot = {
  title: string;
  description: string | null;
  settings: Record<string, unknown> | null;
  sections: SnapshotSection[];
  logicRules: SnapshotLogicRule[];
};

class TemplateService {
  private formService = new FormService();

  private async uniqueSlug(ownerId: string, base: string) {
    const candidate = slugify(base);
    let suffix = 0;

    for (;;) {
      const trySlug = suffix === 0 ? candidate : `${candidate}-${suffix}`;
      const [existing] = await db
        .select({ id: formTable.id })
        .from(formTable)
        .where(
          and(
            eq(formTable.ownerId, ownerId),
            eq(formTable.slug, trySlug),
            isNull(formTable.deletedAt),
          ),
        )
        .limit(1);

      if (!existing) {
        return trySlug;
      }

      suffix += 1;
    }
  }

  private async assertOwnedTemplate(ownerId: string, templateId: string) {
    const [template] = await db
      .select()
      .from(templateTable)
      .where(
        and(
          eq(templateTable.id, templateId),
          eq(templateTable.ownerId, ownerId),
          isNull(templateTable.deletedAt),
        ),
      )
      .limit(1);

    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  }

  private async buildSnapshot(ownerId: string, formId: string): Promise<FormSnapshot> {
    const form = await this.formService.getFormById(ownerId, formId);

    const settings = form.settings
      ? {
          requireLogin: form.settings.requireLogin,
          allowMultipleResponses: form.settings.allowMultipleResponses,
          collectEmail: form.settings.collectEmail,
          showProgressBar: form.settings.showProgressBar,
          showQuestionNumbers: form.settings.showQuestionNumbers,
          acceptResponses: form.settings.acceptResponses,
          allowEditAfterSubmit: form.settings.allowEditAfterSubmit,
          shuffleQuestions: form.settings.shuffleQuestions,
          responseMessage: form.settings.responseMessage,
          redirectUrl: form.settings.redirectUrl,
          maxResponses: form.settings.maxResponses,
        }
      : null;

    const sections: SnapshotSection[] = (form.sections ?? []).map((section) => ({
      key: section.id,
      title: section.title,
      description: section.description,
      displayOrder: section.displayOrder,
      questions: (section.questions ?? []).map((question) => ({
        key: question.id,
        title: question.title,
        description: question.description,
        type: question.type,
        required: question.required,
        placeholder: question.placeholder,
        helpText: question.helpText,
        defaultValue: question.defaultValue,
        displayOrder: question.displayOrder,
        settings: question.settings,
        options: (question.options ?? []).map((option) => ({
          label: option.label,
          value: option.value,
          displayOrder: option.displayOrder,
          isDefault: option.isDefault,
        })),
      })),
    }));

    const logicRules: SnapshotLogicRule[] = (form.logicRules ?? []).map(
      (rule) => ({
        sourceQuestionKey: rule.sourceQuestionId,
        targetType: rule.targetType,
        targetQuestionKey: rule.targetQuestionId,
        targetSectionKey: rule.targetSectionId,
        operator: rule.operator,
        value: rule.value,
        action: rule.action,
        priority: rule.priority,
      }),
    );

    return {
      title: form.title,
      description: form.description,
      settings,
      sections,
      logicRules,
    };
  }

  public async createTemplateFromForm(
    ownerId: string,
    payload: CreateTemplateFromFormType,
  ) {
    const input = await createTemplateFromFormInput.parseAsync(payload);
    const snapshot = await this.buildSnapshot(ownerId, input.formId);

    const [created] = await db
      .insert(templateTable)
      .values({
        ownerId,
        sourceFormId: input.formId,
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        snapshot,
        previewImageUrl: input.previewImageUrl ?? null,
        thumbnailUrl: input.thumbnailUrl ?? null,
        isPublic: input.isPublic,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create template");
    }

    return created;
  }

  public async listMyTemplates(ownerId: string) {
    return db
      .select()
      .from(templateTable)
      .where(
        and(eq(templateTable.ownerId, ownerId), isNull(templateTable.deletedAt)),
      )
      .orderBy(desc(templateTable.createdAt));
  }

  public async listPublicTemplates(category?: string) {
    return db
      .select()
      .from(templateTable)
      .where(
        and(
          eq(templateTable.isPublic, true),
          isNull(templateTable.deletedAt),
          category ? eq(templateTable.category, category) : undefined,
        ),
      )
      .orderBy(desc(templateTable.usageCount), desc(templateTable.createdAt));
  }

  public async getTemplate(templateId: string, viewerId?: string | null) {
    const [template] = await db
      .select()
      .from(templateTable)
      .where(
        and(eq(templateTable.id, templateId), isNull(templateTable.deletedAt)),
      )
      .limit(1);

    if (!template) {
      throw new Error("Template not found");
    }

    const canView =
      template.isPublic ||
      template.isOfficial ||
      (viewerId != null && template.ownerId === viewerId);

    if (!canView) {
      throw new Error("Template not found");
    }

    return template;
  }

  public async updateTemplate(
    ownerId: string,
    templateId: string,
    payload: UpdateTemplateType,
  ) {
    const input = await updateTemplateInput.parseAsync(payload);
    await this.assertOwnedTemplate(ownerId, templateId);

    const [updated] = await db
      .update(templateTable)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.previewImageUrl !== undefined
          ? { previewImageUrl: input.previewImageUrl }
          : {}),
        ...(input.thumbnailUrl !== undefined
          ? { thumbnailUrl: input.thumbnailUrl }
          : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
      })
      .where(eq(templateTable.id, templateId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update template");
    }

    return updated;
  }

  public async deleteTemplate(ownerId: string, templateId: string) {
    await this.assertOwnedTemplate(ownerId, templateId);

    await db
      .update(templateTable)
      .set({ deletedAt: new Date() })
      .where(eq(templateTable.id, templateId));

    return { ok: true as const };
  }

  public async useTemplate(ownerId: string, payload: UseTemplateType) {
    const input = await useTemplateInput.parseAsync(payload);
    const template = await this.getTemplate(input.templateId, ownerId);
    const snapshot = template.snapshot as FormSnapshot;

    const title = input.title?.trim() || snapshot.title || template.name;
    const slug = await this.uniqueSlug(ownerId, title);

    const form = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(formTable)
        .values({
          ownerId,
          title,
          description: snapshot.description,
          slug,
          status: "DRAFT",
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create form from template");
      }

      const settings = snapshot.settings ?? {};
      await tx.insert(formSettingTable).values({
        formId: created.id,
        requireLogin: Boolean(settings.requireLogin ?? false),
        allowMultipleResponses: Boolean(
          settings.allowMultipleResponses ?? false,
        ),
        collectEmail: Boolean(settings.collectEmail ?? false),
        showProgressBar: Boolean(settings.showProgressBar ?? true),
        showQuestionNumbers: Boolean(settings.showQuestionNumbers ?? true),
        acceptResponses: Boolean(settings.acceptResponses ?? true),
        allowEditAfterSubmit: Boolean(settings.allowEditAfterSubmit ?? false),
        shuffleQuestions: Boolean(settings.shuffleQuestions ?? false),
        responseMessage:
          typeof settings.responseMessage === "string"
            ? settings.responseMessage
            : null,
        redirectUrl:
          typeof settings.redirectUrl === "string" ? settings.redirectUrl : null,
        maxResponses:
          typeof settings.maxResponses === "number"
            ? settings.maxResponses
            : null,
      });

      const sectionKeyToId = new Map<string, string>();
      const questionKeyToId = new Map<string, string>();

      for (const section of snapshot.sections ?? []) {
        const [createdSection] = await tx
          .insert(sectionTable)
          .values({
            formId: created.id,
            title: section.title,
            description: section.description,
            displayOrder: section.displayOrder,
          })
          .returning();

        if (!createdSection) {
          throw new Error("Failed to create section from template");
        }

        sectionKeyToId.set(section.key, createdSection.id);

        for (const question of section.questions ?? []) {
          const [createdQuestion] = await tx
            .insert(questionTable)
            .values({
              formId: created.id,
              sectionId: createdSection.id,
              title: question.title,
              description: question.description,
              type: question.type as never,
              required: question.required,
              placeholder: question.placeholder,
              helpText: question.helpText,
              defaultValue: question.defaultValue as never,
              displayOrder: question.displayOrder,
              settings: question.settings as never,
            })
            .returning();

          if (!createdQuestion) {
            throw new Error("Failed to create question from template");
          }

          questionKeyToId.set(question.key, createdQuestion.id);

          if (question.options.length > 0) {
            await tx.insert(questionOptionTable).values(
              question.options.map((option) => ({
                questionId: createdQuestion.id,
                label: option.label,
                value: option.value,
                displayOrder: option.displayOrder,
                isDefault: option.isDefault,
              })),
            );
          }
        }
      }

      for (const rule of snapshot.logicRules ?? []) {
        const sourceQuestionId = questionKeyToId.get(rule.sourceQuestionKey);
        if (!sourceQuestionId) continue;

        await tx.insert(logicRuleTable).values({
          formId: created.id,
          sourceQuestionId,
          targetType: rule.targetType,
          targetQuestionId: rule.targetQuestionKey
            ? (questionKeyToId.get(rule.targetQuestionKey) ?? null)
            : null,
          targetSectionId: rule.targetSectionKey
            ? (sectionKeyToId.get(rule.targetSectionKey) ?? null)
            : null,
          operator: rule.operator as never,
          value: rule.value as never,
          action: rule.action as never,
          priority: rule.priority,
        });
      }

      await tx
        .update(templateTable)
        .set({ usageCount: sql`${templateTable.usageCount} + 1` })
        .where(eq(templateTable.id, template.id));

      return created;
    });

    return this.formService.getFormById(ownerId, form.id);
  }
}

export default TemplateService;
