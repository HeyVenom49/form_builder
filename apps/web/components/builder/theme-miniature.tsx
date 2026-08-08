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
        "group w-full overflow-hidden rounded-xl text-left transition-all duration-300",
        selected
          ? "ring-2 ring-[var(--atelier-accent)] ring-offset-2 ring-offset-[var(--atelier-bg)]"
          : "hover:-translate-y-0.5",
      )}
    >
      <MiniatureSurface theme={theme} title={formTitle} />
      <div className="bg-white px-3 py-2.5">
        <p className="text-sm font-medium tracking-tight">{theme.name}</p>
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
  const pad =
    theme.density === "airy"
      ? "p-4"
      : theme.density === "compact"
        ? "p-2.5"
        : "p-3";

  return (
    <div
      className={cn("aspect-[4/3] w-full", pad)}
      style={{ background: theme.background }}
    >
      <div
        className="flex h-full flex-col rounded-[inherit] px-3 py-3"
        style={{
          background: theme.surface,
          color: theme.text,
          borderRadius: theme.radius,
          boxShadow: theme.shadow === "none" ? undefined : theme.shadow,
        }}
      >
        <p
          className="truncate text-[11px] leading-tight"
          style={{ fontFamily: theme.fontDisplay }}
        >
          {title}
        </p>
        <p className="mt-0.5 truncate text-[8px]" style={{ color: theme.textMuted }}>
          A short description
        </p>
        <div
          className="mt-2.5 h-5 rounded"
          style={{
            background: theme.inputBg,
            boxShadow: `inset 0 0 0 1px ${theme.border}`,
            borderRadius: `calc(${theme.radius} * 0.6)`,
          }}
        />
        <div
          className="mt-1.5 h-5 rounded"
          style={{
            background: theme.inputBg,
            boxShadow: `inset 0 0 0 1px ${theme.border}`,
            borderRadius: `calc(${theme.radius} * 0.6)`,
          }}
        />
        <div
          className="mt-auto h-5 w-14"
          style={{
            background:
              theme.buttonStyle === "outline" ? "transparent" : theme.primary,
            color: theme.primaryText,
            borderRadius: theme.radius,
            boxShadow:
              theme.buttonStyle === "outline"
                ? `inset 0 0 0 1.5px ${theme.primary}`
                : theme.buttonStyle === "soft"
                  ? undefined
                  : undefined,
            opacity: theme.buttonStyle === "soft" ? 0.85 : 1,
          }}
        />
      </div>
    </div>
  );
}
