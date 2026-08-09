"use client";

import { useMemo, useState } from "react";

import { cn } from "../../lib/utils";
import { INSPIRATION } from "./demo-data";
import { InteractiveFormDemo } from "./form-preview";
import { LandingHeader, LandingSection } from "./section";

const CATEGORIES = [
  "All",
  "Minimal",
  "Startup",
  "Editorial",
  "Luxury",
  "Playful",
  "Corporate",
  "Creative",
  "Warm",
] as const;

export function InspirationGallery() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const items = useMemo(
    () =>
      category === "All"
        ? INSPIRATION
        : INSPIRATION.filter((i) => i.category === category),
    [category],
  );

  return (
    <LandingSection tone="ink">
      <LandingHeader
        title="See what's possible."
        description="Browse and try each form — every field is live."
        className="[&_p]:text-white/65"
      />

      <div className="mt-10 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors duration-200",
                active
                  ? "bg-white text-[var(--atelier-ink)]"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <InteractiveFormDemo
            key={item.id}
            form={item}
            compact
            className="w-full !rounded-2xl"
          />
        ))}
      </div>
    </LandingSection>
  );
}
