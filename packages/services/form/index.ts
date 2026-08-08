import {
  and,
  asc,
  db,
  eq,
  formSettingTable,
  formTable,
  inArray,
  isNull,
  logicRuleTable,
  or,
  questionOptionTable,
  questionTable,
  sectionTable,
  shareLinkTable,
  themeTable,
  type SelectForm,
} from "@repo/database";
import { slugify } from "./slug";
import {
  createFormInput,
  createLogicRuleInput,
  createQuestionInput,
  createQuestionOptionInput,
  createSectionInput,
  reorderInput,
  setFormStatusInput,
  updateFormInput,
  updateFormSettingsInput,
  updateLogicRuleInput,
  updateQuestionInput,
  updateQuestionOptionInput,
  updateSectionInput,
  type CreateFormType,
  type CreateLogicRuleType,
  type CreateQuestionOptionType,
  type CreateQuestionType,
  type CreateSectionType,
  type ReorderType,
  type SetFormStatusType,
  type UpdateFormSettingsType,
  type UpdateFormType,
  type UpdateLogicRuleType,
  type UpdateQuestionOptionType,
  type UpdateQuestionType,
  type UpdateSectionType,
} from "./model";

class FormService {
  private async assertOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select()
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

  private async assertOwnedSection(ownerId: string, sectionId: string) {
    const [row] = await db
      .select({
        section: sectionTable,
        formId: formTable.id,
      })
      .from(sectionTable)
      .innerJoin(formTable, eq(sectionTable.formId, formTable.id))
      .where(
        and(
          eq(sectionTable.id, sectionId),
          eq(formTable.ownerId, ownerId),
          isNull(sectionTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Section not found");
    }

    return row;
  }

  private async assertOwnedQuestion(ownerId: string, questionId: string) {
    const [row] = await db
      .select({
        question: questionTable,
        formId: formTable.id,
      })
      .from(questionTable)
      .innerJoin(formTable, eq(questionTable.formId, formTable.id))
      .where(
        and(
          eq(questionTable.id, questionId),
          eq(formTable.ownerId, ownerId),
          isNull(questionTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Question not found");
    }

    return row;
  }

  private async uniqueSlug(
    ownerId: string,
    base: string,
    excludeFormId?: string,
  ) {
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

      if (!existing || existing.id === excludeFormId) {
        return trySlug;
      }

      suffix += 1;
    }
  }

  public async createForm(ownerId: string, payload: CreateFormType) {
    const input = await createFormInput.parseAsync(payload);
    const slug = await this.uniqueSlug(ownerId, input.title);

    const form = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(formTable)
        .values({
          ownerId,
          title: input.title,
          description: input.description ?? null,
          slug,
          status: "DRAFT",
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create form");
      }

      await tx.insert(formSettingTable).values({
        formId: created.id,
      });

      await tx.insert(sectionTable).values({
        formId: created.id,
        title: "Untitled section",
        displayOrder: 0,
      });

      return created;
    });

    return this.getFormById(ownerId, form.id);
  }

  public async listForms(ownerId: string) {
    return db
      .select()
      .from(formTable)
      .where(and(eq(formTable.ownerId, ownerId), isNull(formTable.deletedAt)))
      .orderBy(asc(formTable.createdAt));
  }

  public async getFormById(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    const form = await db.query.formTable.findFirst({
      where: and(
        eq(formTable.id, formId),
        eq(formTable.ownerId, ownerId),
        isNull(formTable.deletedAt),
      ),
      with: {
        settings: true,
        sections: {
          where: isNull(sectionTable.deletedAt),
          orderBy: [asc(sectionTable.displayOrder)],
          with: {
            questions: {
              where: isNull(questionTable.deletedAt),
              orderBy: [asc(questionTable.displayOrder)],
              with: {
                options: {
                  where: isNull(questionOptionTable.deletedAt),
                  orderBy: [asc(questionOptionTable.displayOrder)],
                },
              },
            },
          },
        },
        logicRules: {
          where: isNull(logicRuleTable.deletedAt),
          orderBy: [asc(logicRuleTable.priority)],
        },
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    return form;
  }

  public async getPublishedFormById(formId: string) {
    const form = await db.query.formTable.findFirst({
      where: and(
        eq(formTable.id, formId),
        eq(formTable.status, "PUBLISHED"),
        isNull(formTable.deletedAt),
      ),
      with: {
        settings: true,
        sections: {
          where: isNull(sectionTable.deletedAt),
          orderBy: [asc(sectionTable.displayOrder)],
          with: {
            questions: {
              where: isNull(questionTable.deletedAt),
              orderBy: [asc(questionTable.displayOrder)],
              with: {
                options: {
                  where: isNull(questionOptionTable.deletedAt),
                  orderBy: [asc(questionOptionTable.displayOrder)],
                },
              },
            },
          },
        },
        logicRules: {
          where: isNull(logicRuleTable.deletedAt),
          orderBy: [asc(logicRuleTable.priority)],
        },
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.settings && !form.settings.acceptResponses) {
      throw new Error("This form is not accepting responses");
    }

    if (form.settings?.expiresAt && form.settings.expiresAt < new Date()) {
      throw new Error("This form has expired");
    }

    return form;
  }

  public async updateForm(
    ownerId: string,
    formId: string,
    payload: UpdateFormType,
  ) {
    const input = await updateFormInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, formId);

    let slug = input.slug;
    if (slug) {
      slug = await this.uniqueSlug(ownerId, slug, formId);
    }

    if (input.themeId) {
      const [theme] = await db
        .select({ id: themeTable.id })
        .from(themeTable)
        .where(
          and(
            eq(themeTable.id, input.themeId),
            isNull(themeTable.deletedAt),
            or(eq(themeTable.ownerId, ownerId), eq(themeTable.isPublic, true)),
          ),
        )
        .limit(1);

      if (!theme) {
        throw new Error("Theme not found");
      }
    }

    const [updated] = await db
      .update(formTable)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(input.themeId !== undefined ? { themeId: input.themeId } : {}),
      })
      .where(eq(formTable.id, formId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update form");
    }

    return this.getFormById(ownerId, formId);
  }

  public async updateFormSettings(
    ownerId: string,
    formId: string,
    payload: UpdateFormSettingsType,
  ) {
    const input = await updateFormSettingsInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, formId);

    const redirectUrl = input.redirectUrl === "" ? null : input.redirectUrl;

    const [settings] = await db
      .update(formSettingTable)
      .set({
        ...(input.expiresAt !== undefined
          ? { expiresAt: input.expiresAt }
          : {}),
        ...(input.maxResponses !== undefined
          ? { maxResponses: input.maxResponses }
          : {}),
        ...(input.requireLogin !== undefined
          ? { requireLogin: input.requireLogin }
          : {}),
        ...(input.allowMultipleResponses !== undefined
          ? { allowMultipleResponses: input.allowMultipleResponses }
          : {}),
        ...(input.collectEmail !== undefined
          ? { collectEmail: input.collectEmail }
          : {}),
        ...(input.showProgressBar !== undefined
          ? { showProgressBar: input.showProgressBar }
          : {}),
        ...(input.showQuestionNumbers !== undefined
          ? { showQuestionNumbers: input.showQuestionNumbers }
          : {}),
        ...(input.acceptResponses !== undefined
          ? { acceptResponses: input.acceptResponses }
          : {}),
        ...(input.allowEditAfterSubmit !== undefined
          ? { allowEditAfterSubmit: input.allowEditAfterSubmit }
          : {}),
        ...(input.shuffleQuestions !== undefined
          ? { shuffleQuestions: input.shuffleQuestions }
          : {}),
        ...(input.responseMessage !== undefined
          ? { responseMessage: input.responseMessage }
          : {}),
        ...(input.redirectUrl !== undefined ? { redirectUrl } : {}),
      })
      .where(eq(formSettingTable.formId, formId))
      .returning();

    if (!settings) {
      throw new Error("Form settings not found");
    }

    return settings;
  }

  public async setFormStatus(
    ownerId: string,
    formId: string,
    payload: SetFormStatusType,
  ) {
    const { status } = await setFormStatusInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, formId);

    const [updated] = await db
      .update(formTable)
      .set({
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      })
      .where(eq(formTable.id, formId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update form status");
    }

    return updated;
  }

  public async deleteForm(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    const [form] = await db
      .select({ id: formTable.id, slug: formTable.slug })
      .from(formTable)
      .where(eq(formTable.id, formId))
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    const deletedSlug = `${form.slug}-deleted-${form.id.slice(0, 8)}`;

    await db
      .update(formTable)
      .set({ deletedAt: new Date(), slug: deletedSlug })
      .where(eq(formTable.id, formId));

    await db
      .update(shareLinkTable)
      .set({ isActive: false })
      .where(eq(shareLinkTable.formId, formId));

    return { ok: true as const };
  }

  public async createSection(
    ownerId: string,
    formId: string,
    payload: CreateSectionType,
  ) {
    const input = await createSectionInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, formId);

    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const existing = await db
        .select({ displayOrder: sectionTable.displayOrder })
        .from(sectionTable)
        .where(
          and(eq(sectionTable.formId, formId), isNull(sectionTable.deletedAt)),
        )
        .orderBy(asc(sectionTable.displayOrder));
      displayOrder = existing.length;
    }

    const [section] = await db
      .insert(sectionTable)
      .values({
        formId,
        title: input.title,
        description: input.description ?? null,
        displayOrder,
      })
      .returning();

    if (!section) {
      throw new Error("Failed to create section");
    }

    return section;
  }

  public async updateSection(
    ownerId: string,
    sectionId: string,
    payload: UpdateSectionType,
  ) {
    const input = await updateSectionInput.parseAsync(payload);
    await this.assertOwnedSection(ownerId, sectionId);

    const [section] = await db
      .update(sectionTable)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      })
      .where(eq(sectionTable.id, sectionId))
      .returning();

    if (!section) {
      throw new Error("Failed to update section");
    }

    return section;
  }

  public async deleteSection(ownerId: string, sectionId: string) {
    await this.assertOwnedSection(ownerId, sectionId);

    await db
      .update(sectionTable)
      .set({ deletedAt: new Date() })
      .where(eq(sectionTable.id, sectionId));

    await db
      .update(questionTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(questionTable.sectionId, sectionId),
          isNull(questionTable.deletedAt),
        ),
      );

    return { ok: true as const };
  }

  public async reorderSections(
    ownerId: string,
    formId: string,
    payload: ReorderType,
  ) {
    const { orderedIds } = await reorderInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, formId);

    const sections = await db
      .select({ id: sectionTable.id })
      .from(sectionTable)
      .where(
        and(
          eq(sectionTable.formId, formId),
          isNull(sectionTable.deletedAt),
          inArray(sectionTable.id, orderedIds),
        ),
      );

    if (sections.length !== orderedIds.length) {
      throw new Error("Invalid section reorder payload");
    }

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(sectionTable)
          .set({ displayOrder: index })
          .where(eq(sectionTable.id, id));
      }
    });

    return { ok: true as const };
  }

  public async createQuestion(ownerId: string, payload: CreateQuestionType) {
    const input = await createQuestionInput.parseAsync(payload);
    const { formId } = await this.assertOwnedSection(ownerId, input.sectionId);

    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const existing = await db
        .select({ displayOrder: questionTable.displayOrder })
        .from(questionTable)
        .where(
          and(
            eq(questionTable.sectionId, input.sectionId),
            isNull(questionTable.deletedAt),
          ),
        );
      displayOrder = existing.length;
    }

    const question = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(questionTable)
        .values({
          formId,
          sectionId: input.sectionId,
          title: input.title,
          description: input.description ?? null,
          type: input.type,
          required: input.required ?? false,
          placeholder: input.placeholder ?? null,
          helpText: input.helpText ?? null,
          defaultValue: input.defaultValue ?? null,
          displayOrder,
          settings: input.settings ?? null,
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create question");
      }

      if (input.options && input.options.length > 0) {
        await tx.insert(questionOptionTable).values(
          input.options.map((option, index) => ({
            questionId: created.id,
            label: option.label,
            value: option.value,
            displayOrder: option.displayOrder ?? index,
            isDefault: option.isDefault ?? false,
          })),
        );
      }

      return created;
    });

    return db.query.questionTable.findFirst({
      where: eq(questionTable.id, question.id),
      with: {
        options: {
          where: isNull(questionOptionTable.deletedAt),
          orderBy: [asc(questionOptionTable.displayOrder)],
        },
      },
    });
  }

  public async updateQuestion(
    ownerId: string,
    questionId: string,
    payload: UpdateQuestionType,
  ) {
    const input = await updateQuestionInput.parseAsync(payload);
    const owned = await this.assertOwnedQuestion(ownerId, questionId);

    if (input.sectionId) {
      const section = await this.assertOwnedSection(ownerId, input.sectionId);
      if (section.formId !== owned.formId) {
        throw new Error("Section does not belong to this form");
      }
    }

    const [updated] = await db
      .update(questionTable)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.required !== undefined ? { required: input.required } : {}),
        ...(input.placeholder !== undefined
          ? { placeholder: input.placeholder }
          : {}),
        ...(input.helpText !== undefined ? { helpText: input.helpText } : {}),
        ...(input.defaultValue !== undefined
          ? { defaultValue: input.defaultValue }
          : {}),
        ...(input.settings !== undefined ? { settings: input.settings } : {}),
        ...(input.sectionId !== undefined
          ? { sectionId: input.sectionId }
          : {}),
      })
      .where(eq(questionTable.id, questionId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update question");
    }

    return db.query.questionTable.findFirst({
      where: eq(questionTable.id, questionId),
      with: {
        options: {
          where: isNull(questionOptionTable.deletedAt),
          orderBy: [asc(questionOptionTable.displayOrder)],
        },
      },
    });
  }

  public async deleteQuestion(ownerId: string, questionId: string) {
    await this.assertOwnedQuestion(ownerId, questionId);

    await db
      .update(questionTable)
      .set({ deletedAt: new Date() })
      .where(eq(questionTable.id, questionId));

    await db
      .update(questionOptionTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(questionOptionTable.questionId, questionId),
          isNull(questionOptionTable.deletedAt),
        ),
      );

    return { ok: true as const };
  }

  public async reorderQuestions(
    ownerId: string,
    sectionId: string,
    payload: ReorderType,
  ) {
    const { orderedIds } = await reorderInput.parseAsync(payload);
    await this.assertOwnedSection(ownerId, sectionId);

    const questions = await db
      .select({ id: questionTable.id })
      .from(questionTable)
      .where(
        and(
          eq(questionTable.sectionId, sectionId),
          isNull(questionTable.deletedAt),
          inArray(questionTable.id, orderedIds),
        ),
      );

    if (questions.length !== orderedIds.length) {
      throw new Error("Invalid question reorder payload");
    }

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(questionTable)
          .set({ displayOrder: index })
          .where(eq(questionTable.id, id));
      }
    });

    return { ok: true as const };
  }

  public async createQuestionOption(
    ownerId: string,
    payload: CreateQuestionOptionType,
  ) {
    const input = await createQuestionOptionInput.parseAsync(payload);
    await this.assertOwnedQuestion(ownerId, input.questionId);

    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const existing = await db
        .select({ id: questionOptionTable.id })
        .from(questionOptionTable)
        .where(
          and(
            eq(questionOptionTable.questionId, input.questionId),
            isNull(questionOptionTable.deletedAt),
          ),
        );
      displayOrder = existing.length;
    }

    if (input.isDefault) {
      await db
        .update(questionOptionTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(questionOptionTable.questionId, input.questionId),
            isNull(questionOptionTable.deletedAt),
          ),
        );
    }

    const [option] = await db
      .insert(questionOptionTable)
      .values({
        questionId: input.questionId,
        label: input.label,
        value: input.value,
        displayOrder,
        isDefault: input.isDefault ?? false,
      })
      .returning();

    if (!option) {
      throw new Error("Failed to create option");
    }

    return option;
  }

  public async updateQuestionOption(
    ownerId: string,
    optionId: string,
    payload: UpdateQuestionOptionType,
  ) {
    const input = await updateQuestionOptionInput.parseAsync(payload);

    const [row] = await db
      .select({
        option: questionOptionTable,
        questionId: questionTable.id,
      })
      .from(questionOptionTable)
      .innerJoin(
        questionTable,
        eq(questionOptionTable.questionId, questionTable.id),
      )
      .innerJoin(formTable, eq(questionTable.formId, formTable.id))
      .where(
        and(
          eq(questionOptionTable.id, optionId),
          eq(formTable.ownerId, ownerId),
          isNull(questionOptionTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Option not found");
    }

    if (input.isDefault) {
      await db
        .update(questionOptionTable)
        .set({ isDefault: false })
        .where(
          and(
            eq(questionOptionTable.questionId, row.questionId),
            isNull(questionOptionTable.deletedAt),
          ),
        );
    }

    const [option] = await db
      .update(questionOptionTable)
      .set({
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.value !== undefined ? { value: input.value } : {}),
        ...(input.isDefault !== undefined
          ? { isDefault: input.isDefault }
          : {}),
      })
      .where(eq(questionOptionTable.id, optionId))
      .returning();

    if (!option) {
      throw new Error("Failed to update option");
    }

    return option;
  }

  public async deleteQuestionOption(ownerId: string, optionId: string) {
    const [row] = await db
      .select({ id: questionOptionTable.id })
      .from(questionOptionTable)
      .innerJoin(
        questionTable,
        eq(questionOptionTable.questionId, questionTable.id),
      )
      .innerJoin(formTable, eq(questionTable.formId, formTable.id))
      .where(
        and(
          eq(questionOptionTable.id, optionId),
          eq(formTable.ownerId, ownerId),
          isNull(questionOptionTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Option not found");
    }

    await db
      .update(questionOptionTable)
      .set({ deletedAt: new Date() })
      .where(eq(questionOptionTable.id, optionId));

    return { ok: true as const };
  }

  public async reorderQuestionOptions(
    ownerId: string,
    questionId: string,
    payload: ReorderType,
  ) {
    const { orderedIds } = await reorderInput.parseAsync(payload);
    await this.assertOwnedQuestion(ownerId, questionId);

    const options = await db
      .select({ id: questionOptionTable.id })
      .from(questionOptionTable)
      .where(
        and(
          eq(questionOptionTable.questionId, questionId),
          isNull(questionOptionTable.deletedAt),
          inArray(questionOptionTable.id, orderedIds),
        ),
      );

    if (options.length !== orderedIds.length) {
      throw new Error("Invalid option reorder payload");
    }

    await db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(questionOptionTable)
          .set({ displayOrder: index })
          .where(eq(questionOptionTable.id, id));
      }
    });

    return { ok: true as const };
  }

  public async createLogicRule(
    ownerId: string,
    formId: string,
    payload: CreateLogicRuleType,
  ) {
    const input = await createLogicRuleInput.parseAsync(payload);
    await this.assertOwnedForm(ownerId, formId);
    const source = await this.assertOwnedQuestion(
      ownerId,
      input.sourceQuestionId,
    );
    if (source.formId !== formId) {
      throw new Error("Source question must belong to this form");
    }

    if (input.targetQuestionId) {
      const target = await this.assertOwnedQuestion(
        ownerId,
        input.targetQuestionId,
      );
      if (target.formId !== formId) {
        throw new Error("Target question must belong to this form");
      }
    }

    if (input.targetSectionId) {
      const target = await this.assertOwnedSection(
        ownerId,
        input.targetSectionId,
      );
      if (target.formId !== formId) {
        throw new Error("Target section must belong to this form");
      }
    }

    const [rule] = await db
      .insert(logicRuleTable)
      .values({
        formId,
        sourceQuestionId: input.sourceQuestionId,
        targetType: input.targetType,
        targetQuestionId:
          input.targetType === "QUESTION" ? input.targetQuestionId : null,
        targetSectionId:
          input.targetType === "SECTION" ? input.targetSectionId : null,
        operator: input.operator,
        value: input.value ?? null,
        action: input.action,
        priority: input.priority ?? 0,
      })
      .returning();

    if (!rule) {
      throw new Error("Failed to create logic rule");
    }

    return rule;
  }

  public async updateLogicRule(
    ownerId: string,
    ruleId: string,
    payload: UpdateLogicRuleType,
  ) {
    const input = await updateLogicRuleInput.parseAsync(payload);

    const [existing] = await db
      .select({
        rule: logicRuleTable,
        formId: formTable.id,
      })
      .from(logicRuleTable)
      .innerJoin(formTable, eq(logicRuleTable.formId, formTable.id))
      .where(
        and(
          eq(logicRuleTable.id, ruleId),
          eq(formTable.ownerId, ownerId),
          isNull(logicRuleTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new Error("Logic rule not found");
    }

    const [rule] = await db
      .update(logicRuleTable)
      .set({
        ...(input.operator !== undefined ? { operator: input.operator } : {}),
        ...(input.value !== undefined ? { value: input.value } : {}),
        ...(input.action !== undefined ? { action: input.action } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.targetType !== undefined
          ? { targetType: input.targetType }
          : {}),
        ...(input.targetQuestionId !== undefined
          ? { targetQuestionId: input.targetQuestionId }
          : {}),
        ...(input.targetSectionId !== undefined
          ? { targetSectionId: input.targetSectionId }
          : {}),
      })
      .where(eq(logicRuleTable.id, ruleId))
      .returning();

    if (!rule) {
      throw new Error("Failed to update logic rule");
    }

    return rule;
  }

  public async deleteLogicRule(ownerId: string, ruleId: string) {
    const [existing] = await db
      .select({ id: logicRuleTable.id })
      .from(logicRuleTable)
      .innerJoin(formTable, eq(logicRuleTable.formId, formTable.id))
      .where(
        and(
          eq(logicRuleTable.id, ruleId),
          eq(formTable.ownerId, ownerId),
          isNull(logicRuleTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new Error("Logic rule not found");
    }

    await db
      .update(logicRuleTable)
      .set({ deletedAt: new Date() })
      .where(eq(logicRuleTable.id, ruleId));

    return { ok: true as const };
  }
}

export default FormService;
export type { SelectForm };
