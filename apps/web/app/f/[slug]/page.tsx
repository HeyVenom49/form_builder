"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { IntentIllustration } from "../../../components/illustrations/intent";
import { PublicField } from "../../../components/form/public-field";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { themeToCssVars, themes } from "../../../lib/design-tokens";
import { flattenForm, type AtelierQuestion } from "../../../lib/form-mapper";
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
