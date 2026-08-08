"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

import { FormShell } from "../../../../components/layout/form-shell";
import { IntentIllustration } from "../../../../components/illustrations/intent";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { cn } from "../../../../lib/utils";
import { flattenForm } from "../../../../lib/form-mapper";
import { useForm } from "../../../../hook/api/form";
import {
  useDeleteResponse,
  useListResponses,
  useOwnedResponse,
} from "../../../../hook/api/response";
import type { ResponseListItem, RouterOutput } from "../../../../types/api";

type OwnedAnswer = NonNullable<
  RouterOutput["response"]["getOwnedResponse"]["answers"]
>[number];

export default function ResponsesPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { form, isLoading: formLoading, error: formError } = useForm({ id });
  const { responses, isLoading } = useListResponses({ formId: id });
  const { deleteResponseAsync } = useDeleteResponse();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ?? responses?.[0]?.id ?? null;
  const { response: detail } = useOwnedResponse(
    { id: selected! },
    !!selected,
  );

  const view = useMemo(
    () => (form ? flattenForm(form as never) : null),
    [form],
  );

  if (formLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
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

  return (
    <FormShell
      form={{
        id: view.id,
        title: view.title,
        status: view.status,
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Responses</h1>
        <p className="mt-1 text-[var(--atelier-ink-soft)]">
          {(responses?.length ?? 0) === 0
            ? "Waiting for the first reply."
            : `${responses!.length} from the API`}
        </p>

        {isLoading ? (
          <Skeleton className="mt-10 h-64 w-full" />
        ) : !responses?.length ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="h-40 w-56">
              <IntentIllustration variant="empty" />
            </div>
            <h2 className="mt-8 font-display text-3xl">Still quiet</h2>
            <Link href={`/forms/${id}/edit`} className="mt-6">
              <Button variant="secondary">Back to editor</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
            <ul className="space-y-1">
              {responses.map((r: ResponseListItem, i: number) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-left",
                      selected === r.id
                        ? "bg-white shadow-[var(--atelier-shadow)]"
                        : "hover:bg-white/70",
                    )}
                  >
                    <p className="text-sm font-medium">
                      Response {responses.length - i}
                    </p>
                    <p className="text-xs text-[var(--atelier-ink-muted)]">
                      {r.status}
                      {r.submittedAt
                        ? ` · ${formatDistanceToNow(new Date(r.submittedAt), { addSuffix: true })}`
                        : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            {detail && (
              <motion.article
                key={detail.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white px-6 py-8 shadow-[var(--atelier-shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-[var(--atelier-ink-muted)]">
                    {detail.submittedAt
                      ? format(new Date(detail.submittedAt), "PPpp")
                      : detail.status}
                    {detail.completionTimeSeconds != null
                      ? ` · ${detail.completionTimeSeconds}s`
                      : ""}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-[var(--atelier-danger)]"
                    onClick={() => deleteResponseAsync({ id: detail.id })}
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-8 space-y-8">
                  {view.questions.map((q) => {
                    const answer = detail.answers?.find(
                      (a: OwnedAnswer) => a.questionId === q.id,
                    );
                    const raw = answer?.value;
                    const display = Array.isArray(raw)
                      ? raw.join(", ")
                      : raw == null
                        ? "—"
                        : typeof raw === "object"
                          ? JSON.stringify(raw)
                          : String(raw);
                    return (
                      <div key={q.id}>
                        <p className="text-sm text-[var(--atelier-ink-muted)]">
                          {q.title}
                        </p>
                        <p className="mt-1 text-lg">{display}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.article>
            )}
          </div>
        )}
      </div>
    </FormShell>
  );
}
