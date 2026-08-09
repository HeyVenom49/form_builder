"use client";

import { TEMPLATES } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";
import { LandingHeader, LandingSection } from "./section";

export function TemplatesGallery() {
  return (
    <LandingSection id="templates" tone="soft">
      <LandingHeader
        title="Start with an idea."
        description="Click into any template — rate, type, and complete it."
      />

      <div className="mt-12 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((tpl) => (
          <article key={tpl.id} className="flex h-full flex-col">
            <InteractiveFormDemo form={tpl} compact className="w-full shrink-0" />
            <p className="mt-3 min-h-[1.25rem] text-sm text-[var(--atelier-ink-muted)]">
              {tpl.subtitle ?? ""}
            </p>
          </article>
        ))}
      </div>
    </LandingSection>
  );
}
