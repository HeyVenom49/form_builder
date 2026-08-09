"use client";

import {
  Eye,
  EyeOff,
  Layers,
  LayoutTemplate,
  Link2,
  Palette,
  Settings2,
  Sparkles,
} from "lucide-react";

import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export type BuilderPanel =
  | "theme"
  | "personality"
  | "present"
  | "settings"
  | "publish"
  | "connect"
  | null;

const TOOLS = [
  { id: "theme" as const, label: "Theme", icon: Palette },
  { id: "personality" as const, label: "Feeling", icon: Sparkles },
  { id: "present" as const, label: "Layout", icon: LayoutTemplate },
  { id: "settings" as const, label: "Settings", icon: Settings2 },
  { id: "connect" as const, label: "Connect", icon: Link2 },
];

export function BuilderToolbar({
  panel,
  showPreview,
  onTogglePanel,
  onTogglePreview,
  onOpenTypes,
}: {
  panel: BuilderPanel;
  showPreview: boolean;
  onTogglePanel: (next: BuilderPanel) => void;
  onTogglePreview: () => void;
  onOpenTypes: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenTypes}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[var(--atelier-ink-muted)] md:hidden"
      >
        <Layers className="h-3.5 w-3.5" />
        Blocks
      </button>

      <div className="hidden items-center gap-0.5 sm:flex">
        {TOOLS.map((item) => {
          const Icon = item.icon;
          const active = panel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTogglePanel(active ? null : item.id)}
              aria-pressed={active}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
                active
                  ? "bg-white text-[var(--atelier-ink)] shadow-[inset_0_0_0_1px_var(--atelier-line)]"
                  : "text-[var(--atelier-ink-muted)] hover:bg-white/70 hover:text-[var(--atelier-ink)]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Compact tools on very small screens */}
      <div className="flex items-center gap-0.5 sm:hidden">
        {TOOLS.map((item) => {
          const Icon = item.icon;
          const active = panel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTogglePanel(active ? null : item.id)}
              aria-label={item.label}
              aria-pressed={active}
              title={item.label}
              className={cn(
                "inline-flex h-9 flex-col items-center justify-center rounded-lg px-1.5",
                active
                  ? "bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]"
                  : "text-[var(--atelier-ink-muted)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="mt-0.5 text-[9px] leading-none font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onTogglePreview}
        aria-pressed={showPreview}
        className={cn(
          "hidden h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium xl:inline-flex",
          showPreview
            ? "bg-white text-[var(--atelier-ink)] shadow-[inset_0_0_0_1px_var(--atelier-line)]"
            : "text-[var(--atelier-ink-muted)] hover:bg-white/70",
        )}
      >
        {showPreview ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        Preview
      </button>

      <Button
        size="sm"
        onClick={() =>
          onTogglePanel(panel === "publish" ? null : "publish")
        }
        className="ml-0.5 shrink-0"
        aria-pressed={panel === "publish"}
      >
        Publish
      </Button>
    </div>
  );
}
