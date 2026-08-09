"use client";

import { themes, type FormTheme, type ThemeId } from "../../lib/design-tokens";
import { cn } from "../../lib/utils";

export function ThemeMiniature({
  themeId,
  selected,
  onSelect,
  formTitle = "Your form",
}: {
  themeId: ThemeId;
  selected?: boolean;
  onSelect?: () => void;
  formTitle?: string;
}) {
  const theme = themes[themeId];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full overflow-visible rounded-xl text-left transition-all duration-300",
        selected
          ? "ring-2 ring-[var(--atelier-accent)] ring-offset-2 ring-offset-[var(--atelier-bg)]"
          : "hover:-translate-y-0.5",
      )}
    >
      <div className="overflow-hidden rounded-xl bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]">
        <MiniatureSurface theme={theme} title={formTitle} />
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium tracking-tight text-[var(--atelier-ink)]">
            {theme.name}
          </p>
        </div>
      </div>
    </button>
  );
}

export function MiniatureSurface({
  theme,
  title,
}: {
  theme: FormTheme;
  title: string;
}) {
  // Paint at ~2× size, then scale down so serif display glyphs aren't clipped.
  const scale = 0.5;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden"
      style={{ background: theme.background }}
    >
      <div
        className="origin-top-left"
        style={{
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transform: `scale(${scale})`,
          padding: 14,
        }}
      >
        <div
          className="flex h-full min-h-0 flex-col px-4 py-4"
          style={{
            background: theme.surface,
            color: theme.text,
            borderRadius: theme.radius,
            boxShadow: theme.shadow === "none" ? undefined : theme.shadow,
          }}
        >
          <p
            className="shrink-0 truncate text-[20px] leading-snug"
            style={{
              fontFamily: theme.fontDisplay,
              color: theme.text,
            }}
          >
            {title}
          </p>
          <p
            className="mt-1 shrink-0 truncate text-[13px] leading-normal"
            style={{
              fontFamily: theme.fontBody,
              color: theme.textMuted,
            }}
          >
            A short description
          </p>
          <div
            className="mt-4 h-8 min-h-0 flex-1 rounded"
            style={{
              background: theme.inputBg,
              boxShadow: `inset 0 0 0 1px ${theme.border}`,
              borderRadius: `calc(${theme.radius} * 0.6)`,
              maxHeight: 36,
            }}
          />
          <div
            className="mt-2 h-8 min-h-0 flex-1 rounded"
            style={{
              background: theme.inputBg,
              boxShadow: `inset 0 0 0 1px ${theme.border}`,
              borderRadius: `calc(${theme.radius} * 0.6)`,
              maxHeight: 36,
            }}
          />
          <div
            className="mt-3 flex h-9 w-28 shrink-0 items-center justify-center text-[13px] font-medium"
            style={{
              background:
                theme.buttonStyle === "outline" ? "transparent" : theme.primary,
              color:
                theme.buttonStyle === "outline"
                  ? theme.primary
                  : theme.primaryText,
              borderRadius: theme.radius,
              boxShadow:
                theme.buttonStyle === "outline"
                  ? `inset 0 0 0 1.5px ${theme.primary}`
                  : undefined,
              opacity: theme.buttonStyle === "soft" ? 0.85 : 1,
            }}
          >
            Continue
          </div>
        </div>
      </div>
    </div>
  );
}

