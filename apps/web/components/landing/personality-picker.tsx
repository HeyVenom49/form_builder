"use client";

import { useState } from "react";

import { personalities } from "../../lib/design-tokens";
import { cn } from "../../lib/utils";
import { SHOWCASE_FORM } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";
import { LandingHeader, LandingSection } from "./section";

export function PersonalityPicker() {
  const [activeId, setActiveId] = useState(personalities[0]!.id);
  const active = personalities.find((p) => p.id === activeId) ?? personalities[0]!;

  return (
    <LandingSection tone="warm">
      <LandingHeader
        title="What should your form feel like?"
        description="Choose a feeling. Fill out the live preview."
      />

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          className="flex flex-wrap content-start gap-2.5"
          role="listbox"
          aria-label="Form personality"
        >
          {personalities.map((p) => {
            const selected = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setActiveId(p.id)}
                className={cn(
                  "rounded-xl px-4 py-3 text-left transition-all duration-200",
                  selected
                    ? "bg-[var(--atelier-ink)] text-white shadow-[var(--atelier-shadow)]"
                    : "bg-white text-[var(--atelier-ink-soft)] shadow-[inset_0_0_0_1px_var(--atelier-line)] hover:text-[var(--atelier-ink)]",
                )}
              >
                <span className="block text-sm font-medium">{p.label}</span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    selected ? "text-white/70" : "text-[var(--atelier-ink-muted)]",
                  )}
                >
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>

        <InteractiveFormDemo
          form={{
            ...SHOWCASE_FORM,
            id: `personality-${active.id}`,
            title: active.label,
            subtitle: active.description,
          }}
          themeId={active.themeId}
          className="w-full"
        />
      </div>
    </LandingSection>
  );
}
