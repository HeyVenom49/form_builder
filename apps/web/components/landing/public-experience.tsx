"use client";

import { InteractiveFormDemo } from "./form-preview";
import { HERO_FORM } from "./demo-data";
import { LandingHeader, LandingSection } from "./section";

export function PublicExperience() {
  return (
    <LandingSection id="examples" tone="default">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <LandingHeader
            title="The form is the experience."
            description="Beautiful type. Focused questions. Clear progress. A completion that feels finished — not abandoned."
          />
          <ul className="mt-10 space-y-5">
            {[
              {
                title: "Focused",
                body: "One thoughtful question at a time keeps people present.",
              },
              {
                title: "Responsive",
                body: "The same polish on a phone as on a wide display.",
              },
              {
                title: "Complete",
                body: "A quiet thank-you that respects their time.",
              },
            ].map((item) => (
              <li key={item.title}>
                <p className="font-medium text-[var(--atelier-ink)]">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--atelier-ink-soft)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <InteractiveFormDemo
          form={{
            ...HERO_FORM,
            themeId: "forest",
            title: "Visit follow-up",
            subtitle: "One calm conversation.",
          }}
          className="w-full min-h-[420px]"
        />
      </div>
    </LandingSection>
  );
}
