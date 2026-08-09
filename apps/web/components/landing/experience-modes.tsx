"use client";

import { useState } from "react";

import type { PresentationMode } from "../../lib/design-tokens";
import { cn } from "../../lib/utils";
import { SHOWCASE_FORM } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";
import { LandingHeader, LandingSection } from "./section";

const MODES: {
  id: PresentationMode;
  label: string;
  hint: string;
}[] = [
  {
    id: "classic",
    label: "Classic",
    hint: "Everything on one calm scroll.",
  },
  {
    id: "conversational",
    label: "Conversational",
    hint: "One question at a time.",
  },
  {
    id: "card",
    label: "Card",
    hint: "Small groups, steady pace.",
  },
];

function ModeGlyph({ mode, active }: { mode: PresentationMode; active: boolean }) {
  const fill = active ? "bg-white/90" : "bg-[var(--atelier-ink)]/15";
  const line = active ? "bg-white/50" : "bg-[var(--atelier-ink)]/20";

  if (mode === "classic") {
    return (
      <span className="flex h-10 w-10 flex-col justify-center gap-1 rounded-lg p-2" aria-hidden>
        <span className={cn("h-1 w-full rounded-full", line)} />
        <span className={cn("h-1.5 w-full rounded-sm", fill)} />
        <span className={cn("h-1.5 w-4/5 rounded-sm", fill)} />
        <span className={cn("h-1.5 w-full rounded-sm", fill)} />
      </span>
    );
  }

  if (mode === "card") {
    return (
      <span className="flex h-10 w-10 flex-col justify-center gap-1 rounded-lg p-2" aria-hidden>
        <span className={cn("h-2 w-full rounded-sm", fill)} />
        <span className={cn("h-2 w-full rounded-sm", fill)} />
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 flex-col items-start justify-center gap-1 rounded-lg p-2" aria-hidden>
      <span className={cn("h-1 w-3/4 rounded-full", line)} />
      <span className={cn("h-3 w-full rounded-sm", fill)} />
    </span>
  );
}

export function ExperienceModes() {
  const [mode, setMode] = useState<PresentationMode>("conversational");

  return (
    <LandingSection tone="soft">
      <LandingHeader
        title="Choose how the experience unfolds."
        description="Same questions. Three rhythms. Switch modes and try the form."
      />

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div
          className="flex flex-col gap-2"
          role="tablist"
          aria-label="Experience modes"
        >
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-200",
                  active
                    ? "bg-[var(--atelier-accent)] text-white shadow-[var(--atelier-shadow)]"
                    : "bg-[var(--atelier-bg)] text-[var(--atelier-ink)] hover:bg-[#ebeae5]",
                )}
              >
                <ModeGlyph mode={m.id} active={active} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium">{m.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-sm",
                      active ? "text-white/75" : "text-[var(--atelier-ink-muted)]",
                    )}
                  >
                    {m.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <InteractiveFormDemo
          key={mode}
          form={{ ...SHOWCASE_FORM, id: `mode-${mode}` }}
          themeId="minimal"
          mode={mode}
          className="w-full"
        />
      </div>
    </LandingSection>
  );
}
