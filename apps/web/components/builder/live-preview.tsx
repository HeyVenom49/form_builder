"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

import {
  PublicField,
  type AnswerValue,
} from "../form/public-field";
import { themeToCssVars, themes } from "../../lib/design-tokens";
import type { AtelierFormView, AtelierQuestion } from "../../lib/form-mapper";
import { cn } from "../../lib/utils";

type Phase = "welcome" | "form" | "done";

const CARD_BATCH_SIZE = 3;

const AUTO_ADVANCE_TYPES = new Set([
  "RADIO",
  "YES_NO",
  "RATING",
  "LINEAR_SCALE",
  "DROPDOWN",
]);

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Object.keys(value).length > 0;
}

function validateRequired(
  questions: AtelierQuestion[],
  answers: Record<string, AnswerValue>,
): string | null {
  for (const q of questions) {
    if (q.required && !isAnswered(answers[q.id])) {
      return `Please answer “${q.title}” before continuing.`;
    }
  }
  return null;
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
  const questions = form.questions;
  const mode = form.meta.presentationMode;
  const isCard = mode === "card";
  const isConversational = mode === "conversational";
  const isClassic = mode === "classic";
  const batchSize = isCard ? CARD_BATCH_SIZE : 1;

  const [phase, setPhase] = useState<Phase>("welcome");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [error, setError] = useState<string | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const modeKey = `${mode}:${form.meta.autoAdvance}:${questions.map((q) => q.id).join(",")}`;

  useEffect(() => {
    setPhase("welcome");
    setIndex(0);
    setAnswers({});
    setError(null);
  }, [modeKey]);

  const lastFocusRef = useRef<string | null | undefined>(focusQuestionId);

  useEffect(() => {
    if (focusQuestionId === lastFocusRef.current) return;
    lastFocusRef.current = focusQuestionId;
    if (!focusQuestionId || isClassic) return;
    const i = questions.findIndex((q) => q.id === focusQuestionId);
    if (i < 0) return;
    const nextIndex = isCard
      ? Math.floor(i / CARD_BATCH_SIZE) * CARD_BATCH_SIZE
      : i;
    setPhase("form");
    setIndex(nextIndex);
    setError(null);
  }, [focusQuestionId, isClassic, isCard, questions]);

  const question = questions[index];
  const cardQuestions = useMemo(
    () => (isCard ? questions.slice(index, index + CARD_BATCH_SIZE) : []),
    [isCard, questions, index],
  );
  const isLastBatch = index + batchSize >= questions.length;

  const progress =
    questions.length === 0
      ? 0
      : phase === "done"
        ? 100
        : phase === "welcome"
          ? 0
          : isClassic
            ? 40
            : (Math.min(index + batchSize, questions.length) /
                questions.length) *
              100;

  const showProgress =
    phase === "form" && !isClassic && (form.settings?.showProgressBar ?? true);
  const isCentered =
    phase === "welcome" || phase === "done" || (phase === "form" && !isClassic);

  function restart() {
    setPhase("welcome");
    setIndex(0);
    setAnswers({});
    setError(null);
  }

  function setAnswer(qid: string, value: AnswerValue) {
    setError(null);
    setAnswers((prev) => {
      const next = { ...prev, [qid]: value };
      answersRef.current = next;
      return next;
    });
  }

  function goNext() {
    const batch = isCard
      ? questions.slice(index, index + CARD_BATCH_SIZE)
      : question
        ? [question]
        : [];
    const requiredError = validateRequired(batch, answersRef.current);
    if (requiredError) {
      setError(requiredError);
      return;
    }
    setError(null);
    if (index + batchSize >= questions.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + batchSize);
  }

  function onChoice(qid: string, value: string) {
    setAnswer(qid, value);
    const q = questions.find((item) => item.id === qid);
    if (
      isConversational &&
      form.meta.autoAdvance &&
      q &&
      AUTO_ADVANCE_TYPES.has(q.type)
    ) {
      window.setTimeout(() => {
        if (index + 1 >= questions.length) setPhase("done");
        else setIndex((i) => i + 1);
      }, 220);
    }
  }

  function onToggleCheckbox(qid: string, value: string) {
    const current = answersRef.current[qid];
    const list = Array.isArray(current) ? [...current] : [];
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    setAnswer(qid, next);
  }

  function onGridAnswer(
    qid: string,
    row: string,
    column: string,
    multi: boolean,
  ) {
    const current = answersRef.current[qid];
    const grid =
      current && typeof current === "object" && !Array.isArray(current)
        ? { ...(current as Record<string, string | string[]>) }
        : {};
    if (multi) {
      const rowVal = Array.isArray(grid[row]) ? [...(grid[row] as string[])] : [];
      grid[row] = rowVal.includes(column)
        ? rowVal.filter((c) => c !== column)
        : [...rowVal, column];
    } else {
      grid[row] = column;
    }
    setAnswer(qid, grid);
  }

  function onFile(qid: string, file: File) {
    setAnswer(qid, file.name);
  }

  const modeLabel =
    mode === "classic"
      ? "Classic"
      : mode === "card"
        ? "Cards"
        : "Conversational";

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl"
      style={{
        ...vars,
        background: "var(--form-bg)",
        color: "var(--form-text)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-4 py-3 text-xs tracking-wide uppercase"
        style={{
          color: "var(--form-muted)",
          borderBottom: "1px solid var(--form-border)",
        }}
      >
        <span>Live preview</span>
        <div className="flex items-center gap-2 normal-case tracking-normal">
          <span className="uppercase tracking-wide">{modeLabel}</span>
          <button
            type="button"
            onClick={restart}
            title="Restart preview"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showProgress && (
        <div className="h-1 w-full bg-black/5">
          <motion.div
            className="h-full"
            style={{ background: "var(--form-primary)" }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div
        className={cn(
          "atelier-scroll flex flex-1 overflow-auto p-5",
          isCentered ? "items-center justify-center" : "items-start",
        )}
      >
        <div
          className={cn(
            "w-full",
            isCentered ? "max-w-sm text-center" : "max-w-md",
          )}
        >
          <AnimatePresence mode="wait">
            {phase === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h3
                  className="text-3xl leading-tight tracking-tight"
                  style={{ fontFamily: "var(--form-font-display)" }}
                >
                  {form.meta.welcomeTitle || form.title}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--form-muted)" }}>
                  {form.meta.welcomeDescription ||
                    form.description ||
                    (questions.length === 0
                      ? "Add a block from the palette to try the published flow."
                      : "Click Start to walk through this experience.")}
                </p>
                {questions.length > 0 && (
                  <button
                    type="button"
                    className="mt-8 h-11 rounded-[var(--form-radius)] px-6 text-sm font-medium"
                    style={{
                      background: "var(--form-primary)",
                      color: "var(--form-primary-text)",
                    }}
                    onClick={() => {
                      setPhase("form");
                      setIndex(0);
                      setError(null);
                    }}
                  >
                    Start
                  </button>
                )}
              </motion.div>
            )}

            {phase === "form" && isClassic && (
              <motion.div
                key="classic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-left"
              >
                <h3
                  className="text-2xl tracking-tight"
                  style={{ fontFamily: "var(--form-font-display)" }}
                >
                  {form.title}
                </h3>
                <div className="mt-8 space-y-10">
                  {questions.map((q, i) => (
                    <PublicField
                      key={q.id}
                      question={q}
                      index={i}
                      compact
                      value={answers[q.id]}
                      onChange={(v) => setAnswer(q.id, v)}
                      onChoice={(v) => setAnswer(q.id, v)}
                      onToggleCheckbox={(v) => onToggleCheckbox(q.id, v)}
                      onGridAnswer={(row, col, multi) =>
                        onGridAnswer(q.id, row, col, multi)
                      }
                      onFile={(file) => onFile(q.id, file)}
                      showNumber={form.settings?.showQuestionNumbers ?? true}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const requiredError = validateRequired(
                      questions,
                      answersRef.current,
                    );
                    if (requiredError) {
                      setError(requiredError);
                      return;
                    }
                    setPhase("done");
                  }}
                  className="mt-10 h-11 rounded-[var(--form-radius)] px-6 text-sm font-medium"
                  style={{
                    background: "var(--form-primary)",
                    color: "var(--form-primary-text)",
                  }}
                >
                  Submit
                </button>
                {error && (
                  <p
                    className="mt-3 text-sm"
                    style={{ color: "var(--atelier-danger, #b42318)" }}
                  >
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {phase === "form" && isCard && cardQuestions.length > 0 && (
              <motion.div
                key={`card-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex w-full flex-col items-center"
              >
                <div className="flex w-full flex-col gap-10">
                  {cardQuestions.map((q, i) => (
                    <PublicField
                      key={q.id}
                      question={q}
                      index={index + i}
                      compact
                      large
                      centered
                      value={answers[q.id]}
                      onChange={(v) => setAnswer(q.id, v)}
                      onChoice={(v) => setAnswer(q.id, v)}
                      onToggleCheckbox={(v) => onToggleCheckbox(q.id, v)}
                      onGridAnswer={(row, col, multi) =>
                        onGridAnswer(q.id, row, col, multi)
                      }
                      onFile={(file) => onFile(q.id, file)}
                      showNumber={form.settings?.showQuestionNumbers ?? true}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-8 h-11 rounded-[var(--form-radius)] px-6 text-sm font-medium"
                  style={{
                    background: "var(--form-primary)",
                    color: "var(--form-primary-text)",
                  }}
                >
                  {isLastBatch ? "Submit" : "Next"}
                </button>
                {error && (
                  <p
                    className="mt-3 text-sm"
                    style={{ color: "var(--atelier-danger, #b42318)" }}
                  >
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {phase === "form" && isConversational && question && (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex w-full flex-col items-center"
              >
                <PublicField
                  question={question}
                  index={index}
                  compact
                  large
                  centered
                  value={answers[question.id]}
                  onChange={(v) => setAnswer(question.id, v)}
                  onChoice={(v) => onChoice(question.id, v)}
                  onToggleCheckbox={(v) => onToggleCheckbox(question.id, v)}
                  onGridAnswer={(row, col, multi) =>
                    onGridAnswer(question.id, row, col, multi)
                  }
                  onFile={(file) => onFile(question.id, file)}
                  showNumber={form.settings?.showQuestionNumbers ?? true}
                />
                {!(
                  form.meta.autoAdvance && AUTO_ADVANCE_TYPES.has(question.type)
                ) && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="mt-8 h-11 rounded-[var(--form-radius)] px-6 text-sm font-medium"
                    style={{
                      background: "var(--form-primary)",
                      color: "var(--form-primary-text)",
                    }}
                  >
                    {isLastBatch ? "Submit" : "Continue"}
                  </button>
                )}
                {error && (
                  <p
                    className="mt-3 text-sm"
                    style={{ color: "var(--atelier-danger, #b42318)" }}
                  >
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h3
                  className="text-3xl leading-tight tracking-tight"
                  style={{ fontFamily: "var(--form-font-display)" }}
                >
                  {form.meta.thankYouTitle || "Thank you"}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--form-muted)" }}>
                  {form.thankYouBody || "Your response means a lot."}
                </p>
                <button
                  type="button"
                  onClick={restart}
                  className="mt-8 h-11 rounded-[var(--form-radius)] px-6 text-sm font-medium"
                  style={{
                    background: "var(--form-primary)",
                    color: "var(--form-primary-text)",
                  }}
                >
                  Restart preview
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
