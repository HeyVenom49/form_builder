"use client";

import { personalities, themes, type ThemeId } from "../../lib/design-tokens";
import type { AtelierFormView } from "../../lib/form-mapper";
import type { AtelierMeta } from "../../lib/atelier-meta";
import { ThemeMiniature } from "./theme-miniature";
import { cn } from "../../lib/utils";

export function ThemeStudio({
  form,
  onTheme,
}: {
  form: AtelierFormView;
  onTheme: (id: ThemeId) => void;
}) {
  return (
    <div className="atelier-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10">
      <h2 className="font-display text-2xl tracking-tight">Theme Studio</h2>
      <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
        Applies a real theme record and assigns it to this form.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(themes) as ThemeId[]).map((id) => (
          <ThemeMiniature
            key={id}
            themeId={id}
            selected={form.meta.atelierThemeKey === id}
            onSelect={() => onTheme(id)}
            formTitle={form.title}
          />
        ))}
      </div>
    </div>
  );
}

export function PersonalityMode({
  form,
  onPersonality,
}: {
  form: AtelierFormView;
  onPersonality: (id: AtelierMeta["personalityId"]) => void;
}) {
  return (
    <div className="atelier-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10">
      <h2 className="font-display text-2xl tracking-tight">
        What feeling should your form create?
      </h2>
      <ul className="mt-6 space-y-2">
        {personalities.map((p) => {
          const active = form.meta.personalityId === p.id;
          const theme = themes[p.themeId];
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onPersonality(p.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left",
                  active ? "bg-white shadow-[var(--atelier-shadow)]" : "hover:bg-white/70",
                )}
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-lg"
                  style={{
                    background: `linear-gradient(145deg, ${theme.background}, ${theme.primary}55)`,
                  }}
                />
                <span className="min-w-0">
                  <span className="block font-medium">{p.label}</span>
                  <span className="block text-sm text-[var(--atelier-ink-muted)]">
                    {p.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
