"use client";

import { useState } from "react";

import { themes, type ThemeId } from "../../lib/design-tokens";
import { cn } from "../../lib/utils";
import { SHOWCASE_FORM, THEME_SHOWCASE_IDS } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";
import { LandingHeader, LandingSection } from "./section";

export function ThemeShowcase() {
  const [themeId, setThemeId] = useState<ThemeId>("minimal");

  return (
    <LandingSection tone="soft">
      <LandingHeader
        title="One form. Infinite personalities."
        description="The same questions. Completely different presence. Try the form — answers carry across themes."
      />

      <div className="mt-10 flex flex-wrap gap-2">
        {THEME_SHOWCASE_IDS.map((id) => {
          const active = themeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setThemeId(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-all duration-200",
                active
                  ? "bg-[var(--atelier-ink)] text-white"
                  : "text-[var(--atelier-ink-soft)] hover:bg-black/[0.04] hover:text-[var(--atelier-ink)]",
              )}
            >
              {themes[id].name}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <ul className="space-y-4 text-[15px] text-[var(--atelier-ink-soft)]">
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--atelier-accent)]" />
            Typography shifts with the mood — serif for editorial, crisp sans for product.
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--atelier-accent)]" />
            Spacing, radius, and button treatment follow the personality — not just the background.
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--atelier-accent)]" />
            Rate, type, and finish — the interaction is the product.
          </li>
        </ul>

        <InteractiveFormDemo
          form={SHOWCASE_FORM}
          themeId={themeId}
          className="landing-theme-swap w-full"
        />
      </div>
    </LandingSection>
  );
}
