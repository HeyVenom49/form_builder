import {
  and,
  analyticsEventTable,
  count,
  db,
  desc,
  eq,
  formTable,
  isNull,
  sql,
} from "@repo/database";
import { trackEventInput, type TrackEventType } from "./model";

class AnalyticsService {
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

  public async trackEvent(payload: TrackEventType) {
    const input = await trackEventInput.parseAsync(payload);

    const [form] = await db
      .select({ id: formTable.id, status: formTable.status })
      .from(formTable)
      .where(and(eq(formTable.id, input.formId), isNull(formTable.deletedAt)))
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    const [created] = await db
      .insert(analyticsEventTable)
      .values({
        formId: input.formId,
        eventType: input.eventType,
        responseId: input.responseId ?? null,
        questionId: input.questionId ?? null,
        metadata: input.metadata ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to track event");
    }

    return created;
  }

  public async listEvents(
    ownerId: string,
    formId: string,
    opts?: { limit?: number },
  ) {
    await this.assertOwnedForm(ownerId, formId);

    return db
      .select()
      .from(analyticsEventTable)
      .where(eq(analyticsEventTable.formId, formId))
      .orderBy(desc(analyticsEventTable.createdAt))
      .limit(opts?.limit ?? 200);
  }

  public async getFormSummary(ownerId: string, formId: string) {
    await this.assertOwnedForm(ownerId, formId);

    const rows = await db
      .select({
        eventType: analyticsEventTable.eventType,
        value: count(),
      })
      .from(analyticsEventTable)
      .where(eq(analyticsEventTable.formId, formId))
      .groupBy(analyticsEventTable.eventType);

    const byType = Object.fromEntries(
      rows.map((row) => [row.eventType, Number(row.value)]),
    ) as Record<string, number>;

    const [latest] = await db
      .select({ createdAt: analyticsEventTable.createdAt })
      .from(analyticsEventTable)
      .where(eq(analyticsEventTable.formId, formId))
      .orderBy(desc(analyticsEventTable.createdAt))
      .limit(1);

    const [total] = await db
      .select({ value: count() })
      .from(analyticsEventTable)
      .where(eq(analyticsEventTable.formId, formId));

    return {
      formId,
      totalEvents: Number(total?.value ?? 0),
      byType,
      views: byType.FORM_VIEW ?? 0,
      starts: byType.FORM_START ?? 0,
      submits: byType.FORM_SUBMIT ?? 0,
      abandons: byType.FORM_ABANDON ?? 0,
      lastEventAt: latest?.createdAt ?? null,
    };
  }

  public async getDailyCounts(ownerId: string, formId: string, days = 30) {
    await this.assertOwnedForm(ownerId, formId);

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - Math.max(1, Math.min(days, 90)));

    const rows = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${analyticsEventTable.createdAt}), 'YYYY-MM-DD')`,
        eventType: analyticsEventTable.eventType,
        value: count(),
      })
      .from(analyticsEventTable)
      .where(
        and(
          eq(analyticsEventTable.formId, formId),
          sql`${analyticsEventTable.createdAt} >= ${since}`,
        ),
      )
      .groupBy(
        sql`date_trunc('day', ${analyticsEventTable.createdAt})`,
        analyticsEventTable.eventType,
      )
      .orderBy(sql`date_trunc('day', ${analyticsEventTable.createdAt})`);

    return rows.map((row) => ({
      day: row.day,
      eventType: row.eventType,
      count: Number(row.value),
    }));
  }
}

export default AnalyticsService;
