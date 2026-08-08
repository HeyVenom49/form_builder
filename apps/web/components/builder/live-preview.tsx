"use client";

import { themeToCssVars, themes } from "../../lib/design-tokens";
import type { AtelierFormView, AtelierQuestion } from "../../lib/form-mapper";
import {
  inputTypeForQuestion,
  needsGridSettings,
  needsOptions,
} from "../../lib/question-types";
import { cn } from "../../lib/utils";

function FieldPreview({ question }: { question: AtelierQuestion }) {
  const settings = (question.settings ?? {}) as Record<string, unknown>;

  if (question.type === "LONG_TEXT" || question.type === "ADDRESS") {
    return (
      <div
        className="min-h-20 rounded-[var(--form-radius)] px-3 py-2 text-sm"
        style={{
          background: "var(--form-input-bg)",
          boxShadow: "inset 0 0 0 1px var(--form-border)",
          color: "var(--form-muted)",
        }}
      >
        {question.type === "ADDRESS"
          ? "Street, city, postal code…"
          : question.placeholder || "Your answer"}
      </div>
    );
  }
  if (question.type === "RATING" || question.type === "LINEAR_SCALE") {
    const min = Number(settings.min ?? 1);
    const max = Number(settings.max ?? (question.type === "RATING" ? 5 : 10));
    const values =
      question.type === "RATING"
        ? [1, 2, 3, 4, 5]
        : Array.from(
            { length: Math.max(2, Math.min(12, max - min + 1)) },
            (_, i) => min + i,
          );
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((n) => (
          <span
            key={n}
            className="flex h-9 min-w-9 items-center justify-center rounded-full px-1 text-sm"
            style={{ boxShadow: "inset 0 0 0 1px var(--form-border)" }}
          >
            {n}
          </span>
        ))}
      </div>
    );
  }
  if (question.type === "YES_NO") {
    return (
      <div className="flex gap-3">
        {["Yes", "No"].map((label) => (
          <span
            key={label}
            className="rounded-[var(--form-radius)] px-5 py-2.5 text-sm"
            style={{ boxShadow: "inset 0 0 0 1px var(--form-border)" }}
          >
            {label}
          </span>
        ))}
      </div>
    );
  }
  if (needsOptions(question.type)) {
    return (
      <div className="space-y-2">
        {(question.optionLabels || question.options?.map((o) => o.label) || [])
          .slice(0, 4)
          .map((opt) => (
            <div
              key={opt}
              className="rounded-[var(--form-radius)] px-3 py-2.5 text-sm"
              style={{ boxShadow: "inset 0 0 0 1px var(--form-border)" }}
            >
              {opt}
            </div>
          ))}
      </div>
    );
  }
  if (question.type === "FILE_UPLOAD" || question.type === "SIGNATURE") {
    return (
      <div
        className="flex h-14 items-center justify-center rounded-[var(--form-radius)] text-sm"
        style={{
          color: "var(--form-muted)",
          boxShadow: "inset 0 0 0 1px dashed var(--form-border)",
        }}
      >
        {question.type === "SIGNATURE" ? "Sign here" : "Upload a file"}
      </div>
    );
  }
  if (needsGridSettings(question.type)) {
    const rows = ((settings.rows as string[]) ?? ["Row 1", "Row 2"]).slice(
      0,
      3,
    );
    const cols = (
      (settings.columns as string[]) ?? ["Col 1", "Col 2"]
    ).slice(0, 3);
    return (
      <div className="overflow-hidden text-xs">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `minmax(4rem,1fr) repeat(${cols.length}, 1fr)`,
          }}
        >
          <span />
          {cols.map((c) => (
            <span key={c} className="truncate text-center" style={{ color: "var(--form-muted)" }}>
              {c}
            </span>
          ))}
          {rows.map((r) => (
            <div key={r} className="contents">
              <span className="truncate" style={{ color: "var(--form-muted)" }}>
                {r}
              </span>
              {cols.map((c) => (
                <span
                  key={`${r}-${c}`}
                  className="mx-auto h-5 w-5 rounded-full"
                  style={{ boxShadow: "inset 0 0 0 1px var(--form-border)" }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      className="h-11 rounded-[var(--form-radius)] px-3 text-sm leading-[2.75rem]"
      style={{
        background: "var(--form-input-bg)",
        boxShadow: "inset 0 0 0 1px var(--form-border)",
        color: "var(--form-muted)",
      }}
    >
      {question.placeholder ||
        (inputTypeForQuestion(question.type) !== "text"
          ? question.type.replaceAll("_", " ").toLowerCase()
          : "Your answer")}
    </div>
  );
}

export function LivePreview({
  form,
  focusQuestionId,
}: {
  form: AtelierFormView;
  focusQuestionId?: string | null;
}) {
  const theme = themes[form.meta.atelierThemeKey] ?? themes.minimal;
  const vars = themeToCssVars(theme);
  const q =
    form.questions.find((question) => question.id === focusQuestionId) ??
    form.questions[0];

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl"
      style={{ ...vars, background: "var(--form-bg)", color: "var(--form-text)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-xs tracking-wide uppercase"
        style={{
          color: "var(--form-muted)",
          borderBottom: "1px solid var(--form-border)",
        }}
      >
        <span>Live preview</span>
        <span>{form.meta.presentationMode}</span>
      </div>
      <div className="atelier-scroll flex flex-1 items-center justify-center overflow-auto p-6">
        <div className="w-full max-w-sm">
          <h3
            className="text-3xl leading-tight tracking-tight"
            style={{ fontFamily: "var(--form-font-display)" }}
          >
            {form.meta.welcomeTitle || form.title}
          </h3>
          <p className="mt-2 text-sm" style={{ color: "var(--form-muted)" }}>
            {form.meta.welcomeDescription || form.description}
          </p>
          {q && (
            <div className="mt-8">
              <p className={cn("text-lg font-medium")}>{q.title}</p>
              <div className="mt-4">
                <FieldPreview question={q} />
              </div>
              <button
                type="button"
                className="mt-6 h-11 rounded-[var(--form-radius)] px-6 text-sm font-medium"
                style={{
                  background: "var(--form-primary)",
                  color: "var(--form-primary-text)",
                }}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
