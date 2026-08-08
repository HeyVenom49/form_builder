import {
  and,
  answerTable,
  count,
  db,
  desc,
  eq,
  formSettingTable,
  formTable,
  inArray,
  isNull,
  questionTable,
  responseTable,
} from "@repo/database";
import WebhookService from "../webhook";
import AnalyticsService from "../analytics";
import {
  abandonResponseInput,
  saveAnswersInput,
  startResponseInput,
  submitResponseInput,
  type AbandonResponseType,
  type SaveAnswersType,
  type StartResponseType,
  type SubmitResponseType,
} from "./model";

type SessionMeta = {
  ipAddress?: string;
  userAgent?: string;
};

function isEmptyAnswerValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

class ResponseService {
  private webhookService = new WebhookService();
  private analyticsService = new AnalyticsService();

  private async getAcceptingForm(formId: string) {
    const [row] = await db
      .select({
        form: formTable,
        settings: formSettingTable,
      })
      .from(formTable)
      .leftJoin(formSettingTable, eq(formSettingTable.formId, formTable.id))
      .where(
        and(
          eq(formTable.id, formId),
          eq(formTable.status, "PUBLISHED"),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Form not found");
    }

    const settings = row.settings;
    if (!settings) {
      throw new Error("Form settings not found");
    }

    if (!settings.acceptResponses) {
      throw new Error("This form is not accepting responses");
    }

    if (settings.expiresAt && settings.expiresAt < new Date()) {
      throw new Error("This form has expired");
    }

    if (settings.maxResponses !== null) {
      const [completed] = await db
        .select({ value: count() })
        .from(responseTable)
        .where(
          and(
            eq(responseTable.formId, formId),
            eq(responseTable.status, "COMPLETED"),
            isNull(responseTable.deletedAt),
          ),
        );

      if ((completed?.value ?? 0) >= settings.maxResponses) {
        throw new Error("This form has reached its response limit");
      }
    }

    return { form: row.form, settings };
  }

  private async assertOwnedForm(ownerId: string, formId: string) {
    const [form] = await db
      .select({ id: formTable.id })
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

  private async getWritableResponse(responseId: string, userId?: string | null) {
    const [response] = await db
      .select()
      .from(responseTable)
      .where(
        and(eq(responseTable.id, responseId), isNull(responseTable.deletedAt)),
      )
      .limit(1);

    if (!response) {
      throw new Error("Response not found");
    }

    if (response.status === "COMPLETED") {
      const [settings] = await db
        .select()
        .from(formSettingTable)
        .where(eq(formSettingTable.formId, response.formId))
        .limit(1);

      if (!settings?.allowEditAfterSubmit) {
        throw new Error("This response can no longer be edited");
      }
    }

    if (response.status === "ABANDONED") {
      throw new Error("This response was abandoned");
    }

    if (response.userId && response.userId !== userId) {
      throw new Error("Response not found");
    }

    return response;
  }

  private async upsertAnswers(
    responseId: string,
    formId: string,
    answers: Array<{ questionId: string; value: unknown }>,
  ) {
    const questionIds = answers.map((answer) => answer.questionId);
    const questions = await db
      .select({ id: questionTable.id })
      .from(questionTable)
      .where(
        and(
          eq(questionTable.formId, formId),
          isNull(questionTable.deletedAt),
          inArray(questionTable.id, questionIds),
        ),
      );

    if (questions.length !== questionIds.length) {
      throw new Error("One or more answers reference invalid questions");
    }

    const [current] = await db
      .select({ status: responseTable.status })
      .from(responseTable)
      .where(eq(responseTable.id, responseId))
      .limit(1);

    await db.transaction(async (tx) => {
      for (const answer of answers) {
        await tx
          .insert(answerTable)
          .values({
            responseId,
            questionId: answer.questionId,
            value: answer.value as never,
          })
          .onConflictDoUpdate({
            target: [answerTable.responseId, answerTable.questionId],
            set: {
              value: answer.value as never,
              updatedAt: new Date(),
            },
          });
      }

      await tx
        .update(responseTable)
        .set({
          lastSavedAt: new Date(),
          ...(current?.status === "STARTED" ? { status: "PARTIAL" as const } : {}),
        })
        .where(eq(responseTable.id, responseId));
    });
  }

  public async startResponse(
    payload: StartResponseType,
    opts?: { userId?: string | null; meta?: SessionMeta },
  ) {
    const input = await startResponseInput.parseAsync(payload);
    const { form, settings } = await this.getAcceptingForm(input.formId);

    if (settings.requireLogin && !opts?.userId) {
      throw new Error("Login is required to respond to this form");
    }

    if (!settings.allowMultipleResponses) {
      const conditions = [
        eq(responseTable.formId, form.id),
        eq(responseTable.status, "COMPLETED"),
        isNull(responseTable.deletedAt),
      ];

      if (opts?.userId) {
        conditions.push(eq(responseTable.userId, opts.userId));
      } else if (input.email) {
        conditions.push(eq(responseTable.email, input.email));
      } else if (opts?.meta?.ipAddress) {
        conditions.push(eq(responseTable.ipAddress, opts.meta.ipAddress));
      }

      if (opts?.userId || input.email || opts?.meta?.ipAddress) {
        const [existing] = await db
          .select({ id: responseTable.id })
          .from(responseTable)
          .where(and(...conditions))
          .limit(1);

        if (existing) {
          throw new Error("You have already submitted a response to this form");
        }
      }
    }

    // Resume in-progress response for same user/email/ip when multiple are disallowed.
    if (!settings.allowMultipleResponses) {
      const resumeConditions = [
        eq(responseTable.formId, form.id),
        isNull(responseTable.deletedAt),
        inArray(responseTable.status, ["STARTED", "PARTIAL"]),
      ];

      if (opts?.userId) {
        resumeConditions.push(eq(responseTable.userId, opts.userId));
      } else if (input.email) {
        resumeConditions.push(eq(responseTable.email, input.email));
      } else if (opts?.meta?.ipAddress) {
        resumeConditions.push(eq(responseTable.ipAddress, opts.meta.ipAddress));
      }

      if (opts?.userId || input.email || opts?.meta?.ipAddress) {
        const [inProgress] = await db
          .select()
          .from(responseTable)
          .where(and(...resumeConditions))
          .limit(1);

        if (inProgress) {
          return this.getResponseById(inProgress.id);
        }
      }
    }

    const [created] = await db
      .insert(responseTable)
      .values({
        formId: form.id,
        userId: opts?.userId ?? null,
        email: input.email ?? null,
        status: "STARTED",
        ipAddress: opts?.meta?.ipAddress,
        userAgent: opts?.meta?.userAgent,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to start response");
    }

    const started = await this.getResponseById(created.id);

    void this.analyticsService
      .trackEvent({
        formId: form.id,
        eventType: "FORM_START",
        responseId: started.id,
      })
      .catch(() => undefined);

    return started;
  }

  public async saveAnswers(
    payload: SaveAnswersType,
    opts?: { userId?: string | null },
  ) {
    const input = await saveAnswersInput.parseAsync(payload);
    const response = await this.getWritableResponse(
      input.responseId,
      opts?.userId,
    );

    await this.getAcceptingForm(response.formId);
    await this.upsertAnswers(response.id, response.formId, input.answers);

    return this.getResponseById(response.id);
  }

  public async submitResponse(
    payload: SubmitResponseType,
    opts?: { userId?: string | null },
  ) {
    const input = await submitResponseInput.parseAsync(payload);
    const response = await this.getWritableResponse(
      input.responseId,
      opts?.userId,
    );
    const { settings } = await this.getAcceptingForm(response.formId);

    if (settings.collectEmail && !response.email && !input.email) {
      throw new Error("Email is required to submit this response");
    }

    if (input.answers && input.answers.length > 0) {
      await this.upsertAnswers(response.id, response.formId, input.answers);
    }

    const requiredQuestions = await db
      .select({ id: questionTable.id, title: questionTable.title })
      .from(questionTable)
      .where(
        and(
          eq(questionTable.formId, response.formId),
          eq(questionTable.required, true),
          isNull(questionTable.deletedAt),
        ),
      );

    if (requiredQuestions.length > 0) {
      const answers = await db
        .select()
        .from(answerTable)
        .where(
          and(
            eq(answerTable.responseId, response.id),
            inArray(
              answerTable.questionId,
              requiredQuestions.map((question) => question.id),
            ),
          ),
        );

      const answered = new Map(
        answers.map((answer) => [answer.questionId, answer.value]),
      );

      for (const question of requiredQuestions) {
        if (isEmptyAnswerValue(answered.get(question.id))) {
          throw new Error(`Required question is missing: ${question.title}`);
        }
      }
    }

    const completionTimeSeconds = Math.max(
      0,
      Math.floor((Date.now() - response.createdAt.getTime()) / 1000),
    );

    const [updated] = await db
      .update(responseTable)
      .set({
        status: "COMPLETED",
        submittedAt: new Date(),
        lastSavedAt: new Date(),
        completionTimeSeconds,
        ...(input.email !== undefined ? { email: input.email } : {}),
      })
      .where(eq(responseTable.id, response.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to submit response");
    }

    const completed = await this.getResponseById(response.id);

    void this.webhookService
      .dispatchEvent(response.formId, "FORM_SUBMIT", {
        formId: response.formId,
        responseId: completed.id,
        status: completed.status,
        email: completed.email,
        submittedAt: completed.submittedAt,
        completionTimeSeconds: completed.completionTimeSeconds,
        answers: completed.answers.map((answer) => ({
          questionId: answer.questionId,
          value: answer.value,
        })),
      })
      .catch(() => undefined);

    void this.analyticsService
      .trackEvent({
        formId: response.formId,
        eventType: "FORM_SUBMIT",
        responseId: completed.id,
      })
      .catch(() => undefined);

    return completed;
  }

  public async abandonResponse(
    payload: AbandonResponseType,
    opts?: { userId?: string | null },
  ) {
    const input = await abandonResponseInput.parseAsync(payload);
    const response = await this.getWritableResponse(
      input.responseId,
      opts?.userId,
    );

    if (response.status === "COMPLETED") {
      throw new Error("Completed responses cannot be abandoned");
    }

    await db
      .update(responseTable)
      .set({
        status: "ABANDONED",
        lastSavedAt: new Date(),
      })
      .where(eq(responseTable.id, response.id));

    void this.analyticsService
      .trackEvent({
        formId: response.formId,
        eventType: "FORM_ABANDON",
        responseId: response.id,
      })
      .catch(() => undefined);

    return { ok: true as const };
  }

  public async getResponseById(responseId: string) {
    const response = await db.query.responseTable.findFirst({
      where: and(
        eq(responseTable.id, responseId),
        isNull(responseTable.deletedAt),
      ),
      with: {
        answers: true,
        form: {
          columns: {
            id: true,
            ownerId: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!response || response.form?.deletedAt) {
      throw new Error("Response not found");
    }

    const { form: _form, ...rest } = response;
    return rest;
  }

  public async getResponseForAccessor(
    responseId: string,
    userId?: string | null,
  ) {
    const response = await db.query.responseTable.findFirst({
      where: and(
        eq(responseTable.id, responseId),
        isNull(responseTable.deletedAt),
      ),
      with: {
        answers: true,
        form: {
          columns: {
            id: true,
            ownerId: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!response || response.form?.deletedAt) {
      throw new Error("Response not found");
    }

    const isOwner = !!userId && response.form.ownerId === userId;
    const isRespondent = !!userId && response.userId === userId;
    if (!isOwner && !isRespondent) {
      throw new Error("Response not found");
    }

    const { form: _form, ...rest } = response;
    return rest;
  }

  public async listResponsesForForm(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    return db
      .select()
      .from(responseTable)
      .where(
        and(eq(responseTable.formId, formId), isNull(responseTable.deletedAt)),
      )
      .orderBy(desc(responseTable.createdAt));
  }

  public async getResponseForOwner(ownerId: string, responseId: string) {
    const [row] = await db
      .select({
        responseId: responseTable.id,
        formId: formTable.id,
      })
      .from(responseTable)
      .innerJoin(formTable, eq(responseTable.formId, formTable.id))
      .where(
        and(
          eq(responseTable.id, responseId),
          eq(formTable.ownerId, ownerId),
          isNull(responseTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Response not found");
    }

    return this.getResponseById(row.responseId);
  }

  public async deleteResponse(ownerId: string, responseId: string) {
    const [row] = await db
      .select({ id: responseTable.id })
      .from(responseTable)
      .innerJoin(formTable, eq(responseTable.formId, formTable.id))
      .where(
        and(
          eq(responseTable.id, responseId),
          eq(formTable.ownerId, ownerId),
          isNull(responseTable.deletedAt),
          isNull(formTable.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new Error("Response not found");
    }

    await db
      .update(responseTable)
      .set({ deletedAt: new Date() })
      .where(eq(responseTable.id, responseId));

    return { ok: true as const };
  }
}

export default ResponseService;
