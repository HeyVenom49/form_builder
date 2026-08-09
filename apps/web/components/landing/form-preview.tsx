"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  themeToCssVars,
  themes,
  type FormTheme,
  type PresentationMode,
  type ThemeId,
} from "../../lib/design-tokens";
import { cn } from "../../lib/utils";
import type { DemoForm, DemoQuestion } from "./demo-data";

function densityGap(theme: FormTheme) {
  if (theme.density === "airy") return "gap-6";
  if (theme.density === "compact") return "gap-3";
  return "gap-4";
}

function densityPad(theme: FormTheme, compact?: boolean) {
  if (compact) return "p-5 sm:p-6";
  if (theme.density === "airy") return "p-8 sm:p-10";
  if (theme.density === "compact") return "p-5 sm:p-6";
  return "p-6 sm:p-8";
}

function PrimaryButton({
  theme,
  children,
  onClick,
  className,
  type = "button",
  disabled,
}: {
  theme: FormTheme;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const style =
    theme.buttonStyle === "outline"
      ? {
          background: "transparent",
          color: theme.text,
          boxShadow: `inset 0 0 0 1.5px ${theme.primary}`,
        }
      : theme.buttonStyle === "soft"
        ? {
            background: `${theme.primary}18`,
            color: theme.primary,
          }
        : {
            background: theme.primary,
            color: theme.primaryText,
          };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 px-5 text-[15px] font-medium transition-all duration-200 ease-[var(--atelier-ease)] hover:opacity-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      style={{ ...style, borderRadius: theme.radius }}
    >
      {children}
    </button>
  );
}

function RatingStars({
  question,
  theme,
  value,
  onChange,
  compact,
}: {
  question: Extract<DemoQuestion, { type: "rating" }>;
  theme: FormTheme;
  value?: number;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const max = question.max ?? 5;
  const selected = value ?? 0;
  const [hovered, setHovered] = useState(0);

  return (
    <div
      className="flex gap-1.5"
      role="group"
      aria-label={question.title}
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const lit = (hovered || selected) >= n;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} of ${max} stars`}
            aria-pressed={selected >= n}
            onMouseEnter={() => setHovered(n)}
            onFocus={() => setHovered(n)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(n)}
            className={cn(
              "flex items-center justify-center transition-transform duration-150 hover:scale-110 focus-visible:scale-110",
              compact ? "h-10 w-10 text-2xl" : "h-12 w-12 text-[1.75rem]",
            )}
            style={{
              color: lit ? theme.primary : theme.textMuted,
              opacity: lit ? 1 : 0.45,
            }}
          >
            {lit ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}

function QuestionBody({
  question,
  theme,
  value,
  onChange,
  compact,
}: {
  question: DemoQuestion;
  theme: FormTheme;
  value?: string | number;
  onChange: (v: string | number) => void;
  compact?: boolean;
}) {
  if (question.type === "rating") {
    return (
      <RatingStars
        question={question}
        theme={theme}
        value={typeof value === "number" ? value : undefined}
        onChange={onChange}
        compact={compact}
      />
    );
  }

  if (question.type === "choice") {
    return (
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="w-full px-4 py-3 text-left text-[15px] transition-all duration-200 hover:opacity-95"
              style={{
                borderRadius: theme.radius,
                background: active ? `${theme.primary}14` : theme.inputBg,
                color: theme.text,
                boxShadow: active
                  ? `inset 0 0 0 1.5px ${theme.primary}`
                  : `inset 0 0 0 1px ${theme.border}`,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "yesno") {
    return (
      <div className="flex gap-3">
        {(["Yes", "No"] as const).map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="min-w-[7rem] flex-1 px-4 py-3 text-[15px] font-medium transition-all duration-200"
              style={{
                borderRadius: theme.radius,
                background: active ? theme.primary : theme.inputBg,
                color: active ? theme.primaryText : theme.text,
                boxShadow: active ? "none" : `inset 0 0 0 1px ${theme.border}`,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  const multiline = question.type === "text" && question.multiline;
  const placeholder =
    question.type === "text" || question.type === "short"
      ? question.placeholder
      : undefined;

  const fieldStyle = {
    borderRadius: theme.radius,
    background: theme.inputBg,
    color: theme.text,
    boxShadow: `inset 0 0 0 1px ${theme.border}`,
    fontFamily: theme.fontBody,
  };

  if (multiline) {
    return (
      <textarea
        rows={compact ? 2 : 3}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none px-4 py-3 text-[15px] outline-none transition-shadow duration-200 placeholder:opacity-50 focus:shadow-[inset_0_0_0_1.5px_var(--form-primary)]"
        style={fieldStyle}
      />
    );
  }

  return (
    <input
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-[15px] outline-none transition-shadow duration-200 placeholder:opacity-50 focus:shadow-[inset_0_0_0_1.5px_var(--form-primary)]"
      style={fieldStyle}
    />
  );
}

export function FormPreviewShell({
  themeId,
  className,
  children,
  elevated = true,
  compact,
}: {
  themeId: ThemeId;
  className?: string;
  children: React.ReactNode;
  elevated?: boolean;
  compact?: boolean;
}) {
  const theme = themes[themeId];
  const vars = themeToCssVars(theme);
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden transition-[background,box-shadow,color] duration-500 ease-[var(--atelier-ease)]",
        densityPad(theme, compact),
        className,
      )}
      style={{
        ...vars,
        background: theme.background,
        color: theme.text,
        borderRadius: theme.radius === "2px" ? "4px" : "20px",
        boxShadow: elevated
          ? theme.shadow !== "none"
            ? theme.shadow
            : "0 24px 64px rgba(20,20,20,0.08)"
          : "none",
        fontFamily: theme.fontBody,
      }}
    >
      {children}
    </div>
  );
}

function isChoiceLike(q: DemoQuestion) {
  return q.type === "rating" || q.type === "choice" || q.type === "yesno";
}

function isAnswered(q: DemoQuestion, value: string | number | undefined) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function answeredInBatch(
  batch: DemoQuestion[],
  answers: Record<string, string | number>,
) {
  if (batch.length === 0) return 0;
  return batch.filter((q) => isAnswered(q, answers[q.id])).length / batch.length;
}

export function InteractiveFormDemo({
  form,
  themeId,
  mode = "conversational",
  className,
  compact = false,
}: {
  form: DemoForm;
  themeId?: ThemeId;
  mode?: PresentationMode;
  className?: string;
  compact?: boolean;
}) {
  const tid = themeId ?? form.themeId;
  const theme = themes[tid];
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const batchSize = mode === "card" ? 2 : 1;
  const resetKey = `${form.id}:${mode}`;

  useEffect(() => {
    setStep(0);
    setDone(false);
    setAnswers({});
  }, [resetKey]);

  const questions = form.questions;
  const batch = questions.slice(step, step + batchSize);

  const answeredCount = questions.filter((q) =>
    isAnswered(q, answers[q.id]),
  ).length;

  const progress = done
    ? 100
    : mode === "classic"
      ? (answeredCount / Math.max(questions.length, 1)) * 100
      : ((step + answeredInBatch(batch, answers) * 0.5) /
          Math.max(questions.length, 1)) *
        100;

  function reset() {
    setStep(0);
    setDone(false);
    setAnswers({});
  }

  function setAnswer(qid: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function goNext() {
    if (mode === "classic") {
      setDone(true);
      return;
    }
    if (step + batchSize >= questions.length) {
      setDone(true);
      return;
    }
    setStep((s) => s + batchSize);
  }

  function onChoiceAnswer(q: DemoQuestion, value: string | number) {
    setAnswer(q.id, value);
    if (mode !== "conversational" || !isChoiceLike(q)) return;
    window.setTimeout(() => {
      setStep((current) => {
        if (current >= questions.length - 1) {
          setDone(true);
          return current;
        }
        return current + 1;
      });
    }, reduceMotion ? 0 : 260);
  }

  const titleClass = compact
    ? "text-xl tracking-tight sm:text-2xl"
    : "text-2xl tracking-tight sm:text-3xl";
  const questionClass = compact
    ? "text-base font-medium tracking-tight sm:text-lg"
    : "text-xl font-medium tracking-tight sm:text-2xl";

  return (
    <FormPreviewShell
      themeId={tid}
      compact={compact}
      className={cn(
        compact ? "h-[22.5rem]" : "min-h-[380px]",
        className,
      )}
    >
      <div
        className={cn(
          "mb-5 flex shrink-0 items-start justify-between gap-4",
          !compact && "mb-8",
        )}
      >
        <div className="min-w-0">
          <p
            className="text-xs tracking-[0.14em] uppercase"
            style={{ color: theme.textMuted }}
          >
            {form.category}
          </p>
          <h3
            className={cn("mt-1", titleClass)}
            style={{ fontFamily: theme.fontDisplay }}
          >
            {form.title}
          </h3>
          {form.subtitle && !compact && (
            <p className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              {form.subtitle}
            </p>
          )}
        </div>
        {mode !== "classic" && (
          <div
            className="mt-2 h-1 w-16 shrink-0 overflow-hidden rounded-full sm:w-20"
            style={{ background: theme.border }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form progress"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: theme.primary }}
              initial={false}
              animate={{ width: `${Math.min(100, Math.max(progress, progress > 0 ? 4 : 0))}%` }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
              }
            />
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-[11rem] flex-col items-start justify-center"
            >
              <div
                className="flex h-11 w-11 items-center justify-center text-lg"
                style={{
                  borderRadius: theme.radius,
                  background: `${theme.primary}18`,
                  color: theme.primary,
                }}
                aria-hidden
              >
                ✓
              </div>
              <h4
                className={cn("mt-4", titleClass)}
                style={{ fontFamily: theme.fontDisplay }}
              >
                {form.successTitle ?? "Thanks for sharing."}
              </h4>
              <p className="mt-2 text-[15px]" style={{ color: theme.textMuted }}>
                {form.successBody ?? "That took less than a minute."}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 text-sm underline-offset-4 hover:underline"
                style={{ color: theme.textMuted }}
              >
                Try again
              </button>
            </motion.div>
          ) : mode === "classic" ? (
            <motion.div
              key="classic"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex h-full flex-col overflow-y-auto atelier-scroll",
                densityGap(theme),
              )}
            >
              {questions.map((question) => (
                <div key={question.id}>
                  <p
                    className={cn("mb-3", questionClass)}
                    style={{ fontFamily: theme.fontDisplay }}
                  >
                    {question.title}
                  </p>
                  <QuestionBody
                    question={question}
                    theme={theme}
                    value={answers[question.id]}
                    onChange={(v) => setAnswer(question.id, v)}
                    compact={compact}
                  />
                </div>
              ))}
              <PrimaryButton
                theme={theme}
                className="mt-2 self-start"
                disabled={!questions.every((q) => isAnswered(q, answers[q.id]))}
                onClick={goNext}
              >
                Submit
              </PrimaryButton>
            </motion.div>
          ) : (
            <motion.div
              key={`${mode}-${step}`}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex h-full flex-col overflow-y-auto atelier-scroll",
                densityGap(theme),
              )}
            >
              {batch.map((question) => (
                <div key={question.id}>
                  <p
                    className={cn("mb-3", questionClass)}
                    style={{ fontFamily: theme.fontDisplay }}
                  >
                    {question.title}
                  </p>
                  <QuestionBody
                    question={question}
                    theme={theme}
                    value={answers[question.id]}
                    onChange={(v) => {
                      if (mode === "conversational" && isChoiceLike(question)) {
                        onChoiceAnswer(question, v);
                      } else {
                        setAnswer(question.id, v);
                      }
                    }}
                    compact={compact}
                  />
                </div>
              ))}

              {(mode === "card" ||
                batch.some((q) => q.type === "text" || q.type === "short")) && (
                <PrimaryButton
                  theme={theme}
                  className="mt-1 self-start"
                  disabled={!batch.every((q) => isAnswered(q, answers[q.id]))}
                  onClick={goNext}
                >
                  {step + batchSize >= questions.length ? "Finish →" : "Continue →"}
                </PrimaryButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FormPreviewShell>
  );
}

/** @deprecated Prefer InteractiveFormDemo — kept for rare static snapshots */
export function StaticFormPreview({
  form,
  themeId,
  mode = "conversational",
  className,
  compact,
}: {
  form: DemoForm;
  themeId?: ThemeId;
  mode?: PresentationMode;
  questionIndex?: number;
  className?: string;
  showChrome?: boolean;
  compact?: boolean;
}) {
  return (
    <InteractiveFormDemo
      form={form}
      themeId={themeId}
      mode={mode}
      className={className}
      compact={compact}
    />
  );
}
