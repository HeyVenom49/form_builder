"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { IntentIllustration } from "../../../components/illustrations/intent";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { themeToCssVars, themes } from "../../../lib/design-tokens";
import { flattenForm, type AtelierQuestion } from "../../../lib/form-mapper";
import {
  inputTypeForQuestion,
  needsGridSettings,
} from "../../../lib/question-types";
import { cn } from "../../../lib/utils";
import { useUser } from "../../../hook/api/auth";
import { useResolveShareLink } from "../../../hook/api/share-link";
import {
  useAbandonResponse,
  useSaveAnswers,
  useStartResponse,
  useSubmitResponse,
} from "../../../hook/api/response";
import { useTrackEvent } from "../../../hook/api/analytics";
import { useRegisterFile } from "../../../hook/api/file";

type Phase = "loading" | "password" | "welcome" | "form" | "done" | "error";

const CARD_BATCH_SIZE = 3;

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

function isAnswered(
  value: string | string[] | Record<string, string | string[]> | undefined,
): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Object.keys(value).length > 0;
}

function validateRequired(
  questions: AtelierQuestion[],
  answers: Record<string, string | string[] | Record<string, string | string[]>>,
): string | null {
  for (const q of questions) {
    if (q.required && !isAnswered(answers[q.id])) {
      return `Please answer “${q.title}” before continuing.`;
    }
  }
  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>();
  const { resolveBySlugAsync, data, error, isPending } = useResolveShareLink();
  const { user } = useUser();
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("loading");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | Record<string, string | string[]>>
  >({});
  const [startedAt] = useState(() => Date.now());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [collectorEmail, setCollectorEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const responseIdRef = useRef<string | null>(null);
  const startingRef = useRef<Promise<string> | null>(null);
  const submittedRef = useRef(false);
  const submittingRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const indexRef = useRef(index);
  indexRef.current = index;
  const collectorEmailRef = useRef(collectorEmail);
  collectorEmailRef.current = collectorEmail;

  const { startResponseAsync } = useStartResponse();
  const { saveAnswersAsync } = useSaveAnswers();
  const { submitResponseAsync } = useSubmitResponse();
  const { abandonResponseAsync } = useAbandonResponse();
  const { trackEvent } = useTrackEvent();
  const { registerFileAsync } = useRegisterFile();

  const view = useMemo(
    () => (data?.form ? flattenForm(data.form as never) : null),
    [data],
  );
  const viewRef = useRef(view);
  viewRef.current = view;

  const [sessionQuestions, setSessionQuestions] = useState<AtelierQuestion[]>(
    [],
  );
  const sessionQuestionsRef = useRef(sessionQuestions);
  sessionQuestionsRef.current = sessionQuestions;

  async function load(pwd?: string) {
    setPhase("loading");
    setLoadError(null);
    try {
      const result = await resolveBySlugAsync({
        slug: params.slug,
        password: pwd,
      });
      trackEvent({ formId: result.form.id, eventType: "FORM_VIEW" });
      setPhase("welcome");
    } catch (e) {
      const message = errorMessage(e, "Unable to open form");
      if (message.toLowerCase().includes("password")) {
        setPhase("password");
        setLoadError(message);
      } else {
        setPhase("error");
        setLoadError(message);
      }
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  // Abandon only on real page leave — not React Strict Mode remounts
  useEffect(() => {
    const onPageHide = () => {
      const rid = responseIdRef.current;
      const form = viewRef.current;
      if (!rid || submittedRef.current || !form) return;
      void abandonResponseAsync({ responseId: rid });
      trackEvent({
        formId: form.id,
        eventType: "FORM_ABANDON",
        responseId: rid,
      });
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [abandonResponseAsync, trackEvent]);

  async function ensureResponse() {
    if (submittedRef.current) {
      throw new Error("Response already submitted");
    }
    if (responseIdRef.current) return responseIdRef.current;
    if (startingRef.current) return startingRef.current;
    const form = viewRef.current;
    if (!form) throw new Error("Form missing");

    const email = collectorEmailRef.current.trim() || undefined;

    startingRef.current = (async () => {
      const started = await startResponseAsync({
        formId: form.id,
        email,
      });
      responseIdRef.current = started.id;
      return started.id;
    })();

    try {
      return await startingRef.current;
    } finally {
      startingRef.current = null;
    }
  }

  async function persistAnswers(rid: string) {
    if (submittedRef.current || submittingRef.current) return;
    const payload = Object.entries(answersRef.current).map(
      ([questionId, value]) => ({ questionId, value }),
    );
    if (!payload.length) return;
    await saveAnswersAsync({ responseId: rid, answers: payload });
  }

  async function finish() {
    const form = viewRef.current;
    const questions = sessionQuestionsRef.current;
    if (!form || submittedRef.current || submittingRef.current) return;

    const requiredError = validateRequired(questions, answersRef.current);
    if (requiredError) {
      setFormError(requiredError);
      return;
    }

    submittingRef.current = true;
    setBusy(true);
    setFormError(null);
    try {
      const rid = await ensureResponse();
      const payload = Object.entries(answersRef.current).map(
        ([questionId, value]) => ({ questionId, value }),
      );
      await submitResponseAsync({
        responseId: rid,
        answers: payload.length ? payload : undefined,
        email: collectorEmailRef.current.trim() || undefined,
      });
      submittedRef.current = true;
      trackEvent({
        formId: form.id,
        eventType: "FORM_SUBMIT",
        responseId: rid,
        metadata: {
          durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        },
      });
      if (form.settings?.redirectUrl) {
        window.location.assign(form.settings.redirectUrl);
        return;
      }
      setPhase("done");
    } catch (e) {
      submittingRef.current = false;
      setFormError(errorMessage(e, "Unable to submit form"));
    } finally {
      setBusy(false);
    }
  }

  async function goNext() {
    const form = viewRef.current;
    const questions = sessionQuestionsRef.current;
    if (!form || submittedRef.current || submittingRef.current || busy) return;

    const batchSize =
      form.meta.presentationMode === "card" ? CARD_BATCH_SIZE : 1;
    const currentIndex = indexRef.current;
    const batch = questions.slice(currentIndex, currentIndex + batchSize);

    const requiredError = validateRequired(batch, answersRef.current);
    if (requiredError) {
      setFormError(requiredError);
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const rid = await ensureResponse();
      for (const question of batch) {
        trackEvent({
          formId: form.id,
          eventType: "QUESTION_ANSWER",
          responseId: rid,
          questionId: question.id,
        });
      }
      if (batch.length) {
        await persistAnswers(rid);
      }
      if (currentIndex + batchSize >= questions.length) {
        setBusy(false);
        await finish();
        return;
      }
      setIndex((i) => i + batchSize);
    } catch (e) {
      setFormError(errorMessage(e, "Unable to continue"));
    } finally {
      if (!submittingRef.current) setBusy(false);
    }
  }

  function beginSession() {
    const form = viewRef.current;
    if (!form) return [] as AtelierQuestion[];
    const next = [...form.questions];
    if (form.settings?.shuffleQuestions) {
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i]!;
        next[i] = next[j]!;
        next[j] = tmp;
      }
    }
    setSessionQuestions(next);
    sessionQuestionsRef.current = next;
    setIndex(0);
    return next;
  }

  useEffect(() => {
    if (phase !== "form" || !view || view.meta.presentationMode === "classic") {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter" || e.shiftKey) return;
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      e.preventDefault();
      void goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function setAnswer(
    qid: string,
    value: string | string[] | Record<string, string | string[]>,
  ) {
    if (submittedRef.current || submittingRef.current) return;
    setFormError(null);
    setAnswers((a) => {
      const next = { ...a, [qid]: value };
      answersRef.current = next;
      return next;
    });
  }

  function onChoice(qid: string, value: string) {
    setAnswer(qid, value);
    const q = sessionQuestionsRef.current.find(
      (question) => question.id === qid,
    );
    const canAuto =
      view?.meta.presentationMode === "conversational" &&
      view.meta.autoAdvance &&
      q &&
      (q.type === "RADIO" ||
        q.type === "YES_NO" ||
        q.type === "RATING" ||
        q.type === "LINEAR_SCALE" ||
        q.type === "DROPDOWN");
    if (canAuto) {
      window.setTimeout(() => void goNext(), 280);
    }
  }

  function onToggleCheckbox(qid: string, value: string) {
    if (submittedRef.current || submittingRef.current) return;
    setFormError(null);
    setAnswers((a) => {
      const current = Array.isArray(a[qid]) ? [...(a[qid] as string[])] : [];
      const idx = current.indexOf(value);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(value);
      const next = { ...a, [qid]: current };
      answersRef.current = next;
      return next;
    });
  }

  function onGridAnswer(
    qid: string,
    row: string,
    column: string,
    multi: boolean,
  ) {
    if (submittedRef.current || submittingRef.current) return;
    setFormError(null);
    setAnswers((a) => {
      const current =
        a[qid] && typeof a[qid] === "object" && !Array.isArray(a[qid])
          ? { ...(a[qid] as Record<string, string | string[]>) }
          : {};
      if (multi) {
        const list = Array.isArray(current[row])
          ? [...(current[row] as string[])]
          : [];
        const idx = list.indexOf(column);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(column);
        current[row] = list;
      } else {
        current[row] = column;
      }
      const next = { ...a, [qid]: current };
      answersRef.current = next;
      return next;
    });
  }

  async function uploadFile(qid: string, file: File) {
    if (!view || submittedRef.current) return;
    setBusy(true);
    setFormError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const objectUrl = URL.createObjectURL(file);
      const rid = await ensureResponse();
      await registerFileAsync({
        provider: "LOCAL",
        objectKey: `${view.id}/${Date.now()}-${file.name}`,
        url: objectUrl,
        originalFileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        formId: view.id,
        responseId: rid,
      });
      setAnswer(
        qid,
        JSON.stringify({
          fileName: file.name,
          url: dataUrl,
        }),
      );
    } catch (e) {
      setFormError(errorMessage(e, "Unable to upload file"));
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    const form = viewRef.current;
    if (!form || busy) return;

    if (form.settings?.requireLogin && !user) {
      setFormError("Sign in required to start this form.");
      return;
    }

    if (form.settings?.collectEmail) {
      const email = collectorEmailRef.current.trim();
      if (!email) {
        setFormError("Please enter your email to start.");
        return;
      }
    }

    setBusy(true);
    setFormError(null);
    try {
      await ensureResponse();
      beginSession();
      setPhase("form");
    } catch (e) {
      setFormError(errorMessage(e, "Unable to start form"));
    } finally {
      setBusy(false);
    }
  }

  if (phase === "loading" || isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6">
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-black/5">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--atelier-accent)]" />
        </div>
        <p className="text-sm text-[var(--atelier-ink-muted)]">Opening form…</p>
      </div>
    );
  }

  if (phase === "password") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-display text-4xl">This form is protected</h1>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => void load(password)}>Continue</Button>
        {loadError && (
          <p className="text-sm text-[var(--atelier-danger)]">{loadError}</p>
        )}
      </div>
    );
  }

  if (phase === "error" || !view) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="font-display text-3xl">This form isn&apos;t available.</p>
        <p className="text-sm text-[var(--atelier-ink-muted)]">
          {loadError || error?.message || "Publish a share link first."}
        </p>
        <Link href="/">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
    );
  }

  const theme = themes[view.meta.atelierThemeKey] ?? themes.minimal;
  const vars = themeToCssVars(theme);
  const questions =
    sessionQuestions.length > 0 ? sessionQuestions : view.questions;
  const presentationMode = view.meta.presentationMode;
  const isCard = presentationMode === "card";
  const isConversational = presentationMode === "conversational";
  const batchSize = isCard ? CARD_BATCH_SIZE : 1;
  const question = questions[index];
  const cardQuestions = isCard
    ? questions.slice(index, index + CARD_BATCH_SIZE)
    : [];
  const isLastBatch = index + batchSize >= questions.length;
  const isCentered =
    phase === "welcome" ||
    phase === "done" ||
    (phase === "form" && presentationMode !== "classic");
  const showProgress =
    phase === "form" &&
    presentationMode !== "classic" &&
    (view.settings?.showProgressBar ?? true);
  const progress =
    questions.length === 0
      ? 0
      : phase === "done"
        ? 100
        : phase === "welcome"
          ? 0
          : (Math.min(index + batchSize, questions.length) / questions.length) *
            100;
  const needsLogin = Boolean(view.settings?.requireLogin && !user);
  const signInHref = `/auth/signin?next=${encodeURIComponent(`/f/${params.slug}`)}`;

  return (
    <div
      className="relative min-h-screen"
      style={{
        ...vars,
        background: "var(--form-bg)",
        color: "var(--form-text)",
      }}
    >
      {showProgress && (
        <div className="fixed top-0 right-0 left-0 z-20 h-1 bg-black/5">
          <motion.div
            className="h-full"
            style={{ background: "var(--form-primary)" }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div
        className={cn(
          "mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16",
          isCentered
            ? "items-center justify-center text-center"
            : "justify-start pt-20 sm:pt-24",
        )}
      >
        <AnimatePresence mode="wait">
          {phase === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-xl flex-col items-center"
            >
              <div className="mb-10 h-36 w-48">
                <IntentIllustration variant="event" />
              </div>
              <h1
                className="text-5xl tracking-tight sm:text-6xl"
                style={{ fontFamily: "var(--form-font-display)" }}
              >
                {view.meta.welcomeTitle || view.title}
              </h1>
              <p className="mt-5 text-lg" style={{ color: "var(--form-muted)" }}>
                {view.meta.welcomeDescription || view.description}
              </p>

              {needsLogin ? (
                <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-3">
                  <p className="text-sm" style={{ color: "var(--form-muted)" }}>
                    Sign in to continue with this form.
                  </p>
                  <Link
                    href={signInHref}
                    className="inline-flex h-14 items-center justify-center rounded-[var(--form-radius)] px-10 font-medium"
                    style={{
                      background: "var(--form-primary)",
                      color: "var(--form-primary-text)",
                    }}
                  >
                    Sign in
                  </Link>
                </div>
              ) : (
                <>
                  {view.settings?.collectEmail && (
                    <Input
                      type="email"
                      value={collectorEmail}
                      onChange={(e) => {
                        setCollectorEmail(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="you@example.com"
                      className="mt-8 w-full max-w-sm text-left"
                      autoComplete="email"
                    />
                  )}
                  <button
                    type="button"
                    className="mt-10 h-14 rounded-[var(--form-radius)] px-10 font-medium"
                    style={{
                      background: "var(--form-primary)",
                      color: "var(--form-primary-text)",
                    }}
                    onClick={() => void handleStart()}
                    disabled={busy}
                  >
                    Start
                  </button>
                </>
              )}
              {formError && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: "var(--atelier-danger, #b42318)" }}
                >
                  {formError}
                </p>
              )}
            </motion.div>
          )}

          {phase === "form" && presentationMode === "classic" && (
            <motion.div
              key="classic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <h1 className="font-display text-4xl">{view.title}</h1>
              <div className="mt-12 space-y-12">
                {questions.map((q, i) => (
                  <PublicField
                    key={q.id}
                    question={q}
                    index={i}
                    value={answers[q.id]}
                    onChange={(v) => setAnswer(q.id, v)}
                    onChoice={(v) => setAnswer(q.id, v)}
                    onToggleCheckbox={(v) => onToggleCheckbox(q.id, v)}
                    onGridAnswer={(row, col, multi) =>
                      onGridAnswer(q.id, row, col, multi)
                    }
                    onFile={(file) => void uploadFile(q.id, file)}
                    showNumber={view.settings?.showQuestionNumbers ?? true}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => void finish()}
                disabled={busy}
                className="mt-12 h-14 rounded-[var(--form-radius)] px-10 font-medium"
                style={{
                  background: "var(--form-primary)",
                  color: "var(--form-primary-text)",
                }}
              >
                Submit
              </button>
              {formError && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: "var(--atelier-danger, #b42318)" }}
                >
                  {formError}
                </p>
              )}
            </motion.div>
          )}

          {phase === "form" && isCard && cardQuestions.length > 0 && (
            <motion.div
              key={`card-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full max-w-xl flex-col items-center"
            >
              <div className="flex w-full flex-col gap-12">
                {cardQuestions.map((q, i) => (
                  <PublicField
                    key={q.id}
                    question={q}
                    index={index + i}
                    large
                    centered
                    value={answers[q.id]}
                    onChange={(v) => setAnswer(q.id, v)}
                    onChoice={(v) => onChoice(q.id, v)}
                    onToggleCheckbox={(v) => onToggleCheckbox(q.id, v)}
                    onGridAnswer={(row, col, multi) =>
                      onGridAnswer(q.id, row, col, multi)
                    }
                    onFile={(file) => void uploadFile(q.id, file)}
                    showNumber={view.settings?.showQuestionNumbers ?? true}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => void goNext()}
                disabled={busy}
                className="mt-10 h-14 rounded-[var(--form-radius)] px-10 font-medium"
                style={{
                  background: "var(--form-primary)",
                  color: "var(--form-primary-text)",
                }}
              >
                {isLastBatch ? "Submit" : "Next"}
              </button>
              {formError && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: "var(--atelier-danger, #b42318)" }}
                >
                  {formError}
                </p>
              )}
            </motion.div>
          )}

          {phase === "form" && isConversational && question && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full max-w-xl flex-col items-center"
            >
              <PublicField
                question={question}
                index={index}
                large
                centered
                value={answers[question.id]}
                onChange={(v) => setAnswer(question.id, v)}
                onChoice={(v) => onChoice(question.id, v)}
                onToggleCheckbox={(v) => onToggleCheckbox(question.id, v)}
                onGridAnswer={(row, col, multi) =>
                  onGridAnswer(question.id, row, col, multi)
                }
                onFile={(file) => void uploadFile(question.id, file)}
                showNumber={view.settings?.showQuestionNumbers ?? true}
              />
              {!(
                view.meta.autoAdvance &&
                [
                  "RADIO",
                  "YES_NO",
                  "RATING",
                  "LINEAR_SCALE",
                  "DROPDOWN",
                ].includes(question.type)
              ) && (
                <button
                  type="button"
                  onClick={() => void goNext()}
                  disabled={busy}
                  className="mt-10 h-14 rounded-[var(--form-radius)] px-10 font-medium"
                  style={{
                    background: "var(--form-primary)",
                    color: "var(--form-primary-text)",
                  }}
                >
                  {index >= questions.length - 1 ? "Submit" : "OK"}
                </button>
              )}
              {formError && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: "var(--atelier-danger, #b42318)" }}
                >
                  {formError}
                </p>
              )}
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex w-full max-w-xl flex-col items-center text-center"
            >
              <div className="mx-auto h-40 w-56">
                <IntentIllustration variant="success" />
              </div>
              <h1
                className="mt-8 text-5xl"
                style={{ fontFamily: "var(--form-font-display)" }}
              >
                {view.meta.thankYouTitle}
              </h1>
              <p className="mt-4 text-lg" style={{ color: "var(--form-muted)" }}>
                {view.thankYouBody}
              </p>
              <Link
                href="/"
                className="mt-10 inline-flex h-12 items-center rounded-[var(--form-radius)] px-6 text-sm font-medium"
                style={{
                  background: "var(--form-primary)",
                  color: "var(--form-primary-text)",
                }}
              >
                Continue browsing
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PublicField({
  question,
  index,
  value,
  onChange,
  onChoice,
  onToggleCheckbox,
  onGridAnswer,
  onFile,
  large,
  centered,
  showNumber = true,
}: {
  question: AtelierQuestion;
  index: number;
  value: string | string[] | Record<string, string | string[]> | undefined;
  onChange: (v: string) => void;
  onChoice: (v: string) => void;
  onToggleCheckbox?: (v: string) => void;
  onGridAnswer?: (row: string, column: string, multi: boolean) => void;
  onFile?: (file: File) => void;
  large?: boolean;
  centered?: boolean;
  showNumber?: boolean;
}) {
  const inputStyle = {
    background: "var(--form-input-bg)",
    color: "var(--form-text)",
    boxShadow: "inset 0 0 0 1px var(--form-border)",
  };
  const settings = (question.settings ?? {}) as Record<string, unknown>;
  const scaleMin = Number(settings.min ?? 1);
  const scaleMax = Number(settings.max ?? 10);
  const scaleValues = Array.from(
    { length: Math.max(2, Math.min(12, scaleMax - scaleMin + 1)) },
    (_, i) => scaleMin + i,
  );
  const rows = (settings.rows as string[]) ?? ["Row 1", "Row 2"];
  const columns = (settings.columns as string[]) ?? ["Col 1", "Col 2"];
  const gridValue =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, string | string[]>)
      : {};

  return (
    <div className={cn("w-full", centered && "text-center")}>
      {showNumber && (
        <p className="text-sm" style={{ color: "var(--form-muted)" }}>
          {index + 1}
          {question.required ? " *" : ""}
        </p>
      )}
      {!showNumber && question.required && (
        <p className="text-sm" style={{ color: "var(--form-muted)" }}>
          *
        </p>
      )}
      <h2
        className={cn(
          "mt-2 font-medium",
          large ? "text-3xl sm:text-4xl" : "text-2xl",
        )}
      >
        {question.title}
      </h2>
      {question.description && (
        <p className="mt-2" style={{ color: "var(--form-muted)" }}>
          {question.description}
        </p>
      )}
      <div
        className={cn(
          "mt-6",
          centered && "mx-auto flex w-full max-w-lg flex-col items-center",
        )}
      >
        {question.type === "FILE_UPLOAD" ? (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile?.(file);
            }}
          />
        ) : question.type === "SIGNATURE" ? (
          <SignaturePad
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
          />
        ) : question.type === "LONG_TEXT" || question.type === "ADDRESS" ? (
          <textarea
            rows={question.type === "ADDRESS" ? 3 : 4}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              question.type === "ADDRESS"
                ? "Street, city, postal code…"
                : (question.placeholder ?? undefined)
            }
            className="min-h-32 w-full rounded-[var(--form-radius)] px-4 py-3"
            style={inputStyle}
          />
        ) : question.type === "RATING" || question.type === "LINEAR_SCALE" ? (
          <div
            className={cn(
              "flex flex-wrap gap-3",
              centered && "justify-center",
            )}
          >
            {(question.type === "RATING" ? [1, 2, 3, 4, 5] : scaleValues).map(
              (n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChoice(String(n))}
                  className="flex h-14 min-w-14 items-center justify-center rounded-full px-2"
                  style={{
                    background:
                      String(value) === String(n)
                        ? "var(--form-primary)"
                        : "transparent",
                    color:
                      String(value) === String(n)
                        ? "var(--form-primary-text)"
                        : undefined,
                    boxShadow:
                      String(value) === String(n)
                        ? undefined
                        : "inset 0 0 0 1px var(--form-border)",
                  }}
                >
                  {n}
                </button>
              ),
            )}
          </div>
        ) : question.type === "YES_NO" ? (
          <div className={cn("flex gap-3", centered && "justify-center")}>
            {["Yes", "No"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onChoice(label)}
                className="min-h-14 min-w-[7rem] rounded-[var(--form-radius)] px-6"
                style={{
                  background:
                    value === label ? "var(--form-primary)" : "transparent",
                  color:
                    value === label ? "var(--form-primary-text)" : undefined,
                  boxShadow:
                    value === label
                      ? undefined
                      : "inset 0 0 0 1px var(--form-border)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : question.type === "CHECKBOX" ? (
          <div className="space-y-3">
            {(question.options || []).map((opt) => {
              const selected =
                Array.isArray(value) && value.includes(opt.value);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggleCheckbox?.(opt.value)}
                  className="flex min-h-14 w-full items-center rounded-[var(--form-radius)] px-4 text-left"
                  style={{
                    boxShadow: selected
                      ? "inset 0 0 0 1.5px var(--form-primary)"
                      : "inset 0 0 0 1px var(--form-border)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : question.type === "RADIO" || question.type === "DROPDOWN" ? (
          <div className="space-y-3">
            {(question.options || []).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChoice(opt.value)}
                className="flex min-h-14 w-full items-center rounded-[var(--form-radius)] px-4 text-left"
                style={{
                  boxShadow:
                    value === opt.value
                      ? "inset 0 0 0 1.5px var(--form-primary)"
                      : "inset 0 0 0 1px var(--form-border)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : needsGridSettings(question.type) ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left" />
                  {columns.map((col) => (
                    <th key={col} className="p-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    <td className="p-2 font-medium">{row}</td>
                    {columns.map((col) => {
                      const cell = gridValue[row];
                      const multi = question.type === "CHECKBOX_GRID";
                      const checked = multi
                        ? Array.isArray(cell) && cell.includes(col)
                        : cell === col;
                      return (
                        <td key={col} className="p-2 text-center">
                          <button
                            type="button"
                            aria-label={`${row} ${col}`}
                            onClick={() => onGridAnswer?.(row, col, multi)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                            style={{
                              background: checked
                                ? "var(--form-primary)"
                                : "transparent",
                              boxShadow: checked
                                ? undefined
                                : "inset 0 0 0 1px var(--form-border)",
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <input
            type={inputTypeForQuestion(question.type)}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder ?? undefined}
            className="h-14 w-full rounded-[var(--form-radius)] px-4"
            style={inputStyle}
          />
        )}
      </div>
    </div>
  );
}

function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = value;
  }, [value]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={640}
        height={200}
        className="h-40 w-full touch-none rounded-[var(--form-radius)]"
        style={{
          background: "var(--form-input-bg)",
          boxShadow: "inset 0 0 0 1px var(--form-border)",
        }}
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          ctx.strokeStyle = "#141414";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          const p = pos(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          const canvas = canvasRef.current;
          if (canvas) onChange(canvas.toDataURL("image/png"));
        }}
      />
      <button
        type="button"
        className="mt-2 text-sm"
        style={{ color: "var(--form-muted)" }}
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            onChange("");
          }
        }}
      >
        Clear signature
      </button>
    </div>
  );
}
