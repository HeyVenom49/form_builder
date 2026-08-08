"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { FormShell } from "../../../../components/layout/form-shell";
import { IntentIllustration } from "../../../../components/illustrations/intent";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { flattenForm } from "../../../../lib/form-mapper";
import { useForm } from "../../../../hook/api/form";
import {
  useDailyAnalyticsCounts,
  useFormAnalyticsSummary,
} from "../../../../hook/api/analytics";

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { form, isLoading, error: formError } = useForm({ id });
  const { summary } = useFormAnalyticsSummary({ formId: id });
  const { counts } = useDailyAnalyticsCounts({ formId: id, days: 7 });

  const view = useMemo(
    () => (form ? flattenForm(form as never) : null),
    [form],
  );

  const byDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    return days.map((day) => {
      const dayCounts = (counts ?? []).filter((c) => c.day.startsWith(day));
      const submits = dayCounts
        .filter((c) => c.eventType === "FORM_SUBMIT")
        .reduce((a, c) => a + c.count, 0);
      const views = dayCounts
        .filter((c) => c.eventType === "FORM_VIEW")
        .reduce((a, c) => a + c.count, 0);
      return {
        label: new Date(day).toLocaleDateString(undefined, { weekday: "short" }),
        count: submits || views,
      };
    });
  }, [counts]);

  const maxDay = Math.max(1, ...byDay.map((d) => d.count));

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!view) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-display text-3xl">Experience not found</p>
        <p className="text-sm text-[var(--atelier-ink-muted)]">
          {formError?.message || "Sign in and check the API."}
        </p>
        <Link href="/workspace">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    );
  }

  const empty = !summary || summary.totalEvents === 0;

  return (
    <FormShell form={{ id: view.id, title: view.title, status: view.status }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Insights</h1>
        <p className="mt-1 text-[var(--atelier-ink-soft)]">
          Live analytics from tracked events.
        </p>

        {empty ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="h-40 w-56">
              <IntentIllustration variant="research" />
            </div>
            <h2 className="mt-8 font-display text-3xl">No patterns yet</h2>
            <p className="mt-2 max-w-sm text-[var(--atelier-ink-soft)]">
              Open the live form — views and submits will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-10 sm:grid-cols-4">
              <Metric label="Views" value={String(summary.views)} />
              <Metric label="Starts" value={String(summary.starts)} />
              <Metric label="Submits" value={String(summary.submits)} />
              <Metric label="Abandons" value={String(summary.abandons)} />
            </div>
            <section className="mt-16">
              <h2 className="text-sm tracking-[0.12em] text-[var(--atelier-ink-muted)] uppercase">
                This week
              </h2>
              <div className="mt-6 flex items-end gap-3">
                {byDay.map((d, i) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max(8, (d.count / maxDay) * 120)}px`,
                      }}
                      transition={{ delay: i * 0.04 }}
                      className="w-full max-w-[48px] rounded-t-md bg-[var(--atelier-accent)]/80"
                    />
                    <span className="text-xs text-[var(--atelier-ink-muted)]">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            {summary.byType && (
              <section className="mt-16">
                <h2 className="text-sm tracking-[0.12em] text-[var(--atelier-ink-muted)] uppercase">
                  By event
                </h2>
                <ul className="mt-4 space-y-3">
                  {Object.entries(summary.byType).map(([type, count]) => (
                    <li key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span className="text-[var(--atelier-ink-muted)]">{count}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </FormShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-[var(--atelier-ink-muted)]">{label}</p>
      <p className="mt-1 font-display text-5xl tracking-tight">{value}</p>
    </div>
  );
}
