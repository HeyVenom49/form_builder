"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AtelierFormView } from "../../lib/form-mapper";
import type { AtelierMeta } from "../../lib/atelier-meta";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function computeQuality(form: AtelierFormView) {
  const suggestions: { id: string; text: string; tone: "good" | "tip" }[] = [];
  let score = 100;
  const requiredCount = form.questions.filter((q) => q.required).length;
  if (requiredCount > Math.ceil(form.questions.length * 0.6) && requiredCount > 3) {
    score -= 12;
    suggestions.push({
      id: "required",
      text: "Quite a few questions are required — consider making some optional.",
      tone: "tip",
    });
  } else {
    suggestions.push({
      id: "required-ok",
      text: "Required fields feel balanced.",
      tone: "good",
    });
  }
  const est = Math.max(1, Math.round(form.questions.length * 0.5));
  suggestions.push({
    id: "time",
    text: `Completion estimated at about ${est} minutes.`,
    tone: est >= 7 ? "tip" : "good",
  });
  if (est >= 7) score -= 10;
  suggestions.push({
    id: "mobile",
    text: "Looks great on mobile with your current spacing.",
    tone: "good",
  });
  suggestions.push({
    id: "a11y",
    text: "Theme has excellent accessibility contrast.",
    tone: "good",
  });
  return { score: Math.max(40, Math.min(100, score)), suggestions, estimatedMinutes: est };
}

export function QualityPanel({
  form,
  onPublish,
  onCopyLink,
  linkCopied,
}: {
  form: AtelierFormView;
  onPublish: () => void;
  onCopyLink: () => void;
  linkCopied: boolean;
}) {
  const { score, suggestions } = computeQuality(form);
  return (
    <div className="atelier-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10">
      <h2 className="font-display text-2xl tracking-tight">Ready to share?</h2>
      <div className="mt-8 flex items-end gap-3">
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-6xl text-[var(--atelier-accent)]"
        >
          {score}
        </motion.span>
        <span className="mb-2 text-lg text-[var(--atelier-ink-muted)]">/ 100</span>
      </div>
      <ul className="mt-8 space-y-3">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              s.tone === "good"
                ? "bg-[var(--atelier-accent-soft)]"
                : "bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]",
            )}
          >
            {s.text}
          </li>
        ))}
      </ul>
      <div className="mt-8 space-y-3">
        <Button className="w-full" size="lg" onClick={onPublish}>
          {form.status === "PUBLISHED" ? "Update published" : "Publish"}
        </Button>
        <Button className="w-full" variant="secondary" size="lg" onClick={onCopyLink}>
          {linkCopied ? "Link copied" : "Copy share link"}
        </Button>
      </div>
    </div>
  );
}

export function PresentationSettings({
  form,
  onChange,
}: {
  form: AtelierFormView;
  onChange: (patch: Partial<AtelierMeta>) => void;
}) {
  const [welcomeTitle, setWelcomeTitle] = useState(form.meta.welcomeTitle);
  const [welcomeDescription, setWelcomeDescription] = useState(
    form.meta.welcomeDescription,
  );
  const [thankYouTitle, setThankYouTitle] = useState(form.meta.thankYouTitle);
  const welcomeTitleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeDescriptionTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const thankYouTitleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setWelcomeTitle(form.meta.welcomeTitle);
  }, [form.meta.welcomeTitle]);

  useEffect(() => {
    setWelcomeDescription(form.meta.welcomeDescription);
  }, [form.meta.welcomeDescription]);

  useEffect(() => {
    setThankYouTitle(form.meta.thankYouTitle);
  }, [form.meta.thankYouTitle]);

  useEffect(() => {
    return () => {
      if (welcomeTitleTimer.current) clearTimeout(welcomeTitleTimer.current);
      if (welcomeDescriptionTimer.current)
        clearTimeout(welcomeDescriptionTimer.current);
      if (thankYouTitleTimer.current) clearTimeout(thankYouTitleTimer.current);
    };
  }, []);

  function debounceField(
    timer: { current: ReturnType<typeof setTimeout> | null },
    patch: Partial<AtelierMeta>,
  ) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onChange(patch);
      timer.current = null;
    }, 400);
  }

  function flushField(
    timer: { current: ReturnType<typeof setTimeout> | null },
    patch: Partial<AtelierMeta>,
    changed: boolean,
  ) {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (changed) onChange(patch);
  }

  return (
    <div className="atelier-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10">
      <h2 className="font-display text-2xl tracking-tight">Presentation</h2>
      <div className="mt-6 space-y-2">
        {(
          [
            ["conversational", "One question at a time"],
            ["classic", "Classic scroll"],
            ["card", "Card groups"],
          ] as const
        ).map(([id, title]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ presentationMode: id })}
            className={cn(
              "w-full rounded-xl px-4 py-3.5 text-left",
              form.meta.presentationMode === id
                ? "bg-white shadow-[var(--atelier-shadow)]"
                : "hover:bg-white/70",
            )}
          >
            {title}
          </button>
        ))}
      </div>
      {form.meta.presentationMode === "conversational" && (
        <div className="mt-8 rounded-xl bg-white p-4 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <p className="font-medium">Advance behavior</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ autoAdvance: true })}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium",
                form.meta.autoAdvance
                  ? "bg-[var(--atelier-accent)] text-white"
                  : "bg-[var(--atelier-bg)]",
              )}
            >
              Auto-advance
            </button>
            <button
              type="button"
              onClick={() => onChange({ autoAdvance: false })}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium",
                !form.meta.autoAdvance
                  ? "bg-[var(--atelier-accent)] text-white"
                  : "bg-[var(--atelier-bg)]",
              )}
            >
              Manual Next
            </button>
          </div>
        </div>
      )}
      <div className="mt-8 space-y-4">
        <label className="block text-sm">
          Welcome title
          <input
            value={welcomeTitle}
            onChange={(e) => {
              const value = e.target.value;
              setWelcomeTitle(value);
              debounceField(welcomeTitleTimer, { welcomeTitle: value });
            }}
            onBlur={() =>
              flushField(
                welcomeTitleTimer,
                { welcomeTitle },
                welcomeTitle !== form.meta.welcomeTitle,
              )
            }
            className="mt-1.5 h-11 w-full rounded-[10px] bg-white px-3 shadow-[inset_0_0_0_1px_var(--atelier-line)] outline-none"
          />
        </label>
        <label className="block text-sm">
          Welcome description
          <textarea
            value={welcomeDescription}
            onChange={(e) => {
              const value = e.target.value;
              setWelcomeDescription(value);
              debounceField(welcomeDescriptionTimer, {
                welcomeDescription: value,
              });
            }}
            onBlur={() =>
              flushField(
                welcomeDescriptionTimer,
                { welcomeDescription },
                welcomeDescription !== form.meta.welcomeDescription,
              )
            }
            rows={3}
            className="mt-1.5 w-full rounded-[10px] bg-white px-3 py-2 shadow-[inset_0_0_0_1px_var(--atelier-line)] outline-none"
          />
        </label>
        <label className="block text-sm">
          Thank-you title
          <input
            value={thankYouTitle}
            onChange={(e) => {
              const value = e.target.value;
              setThankYouTitle(value);
              debounceField(thankYouTitleTimer, { thankYouTitle: value });
            }}
            onBlur={() =>
              flushField(
                thankYouTitleTimer,
                { thankYouTitle },
                thankYouTitle !== form.meta.thankYouTitle,
              )
            }
            className="mt-1.5 h-11 w-full rounded-[10px] bg-white px-3 shadow-[inset_0_0_0_1px_var(--atelier-line)] outline-none"
          />
        </label>
      </div>
    </div>
  );
}
