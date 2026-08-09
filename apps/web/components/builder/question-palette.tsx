"use client";

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Layers, X } from "lucide-react";

import {
  QUESTION_TYPES,
  type QuestionTypeId,
} from "../../lib/question-types";
import { cn } from "../../lib/utils";
import { paletteDragId, type PaletteDragData } from "./dnd-ids";

export function QuestionPalette({
  onAdd,
  className,
}: {
  onAdd: (type: string, index?: number) => void;
  className?: string;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, (typeof QUESTION_TYPES)[number][]>();
    for (const t of QUESTION_TYPES) {
      const list = map.get(t.group) ?? [];
      list.push(t);
      map.set(t.group, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <aside
      className={cn(
        "atelier-scroll flex h-full w-[240px] shrink-0 flex-col border-r border-[var(--atelier-line)] bg-[var(--atelier-bg)]",
        className,
      )}
    >
      <div className="sticky top-0 z-10 border-b border-[var(--atelier-line)] bg-[var(--atelier-bg)] px-4 py-4">
        <p className="text-xs tracking-[0.14em] text-[var(--atelier-accent)] uppercase">
          Blocks
        </p>
        <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
          Drag onto the canvas
        </p>
      </div>
      <div className="flex-1 space-y-5 overflow-auto px-3 py-4">
        {groups.map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 px-1 text-[11px] tracking-[0.12em] text-[var(--atelier-ink-muted)] uppercase">
              {group}
            </p>
            <ul className="space-y-0.5">
              {items.map((t) => (
                <PaletteItem
                  key={t.type}
                  type={t.type}
                  label={t.label}
                  icon={t.icon}
                  onAdd={() => onAdd(t.type)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PaletteItem({
  type,
  label,
  icon: Icon,
  onAdd,
}: {
  type: QuestionTypeId | string;
  label: string;
  icon: (typeof QUESTION_TYPES)[number]["icon"];
  onAdd: () => void;
}) {
  const data: PaletteDragData = { source: "palette", type, label };
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: paletteDragId(type),
      data,
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <li>
      <button
        ref={setNodeRef}
        type="button"
        style={style}
        {...listeners}
        {...attributes}
        onClick={onAdd}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
          "text-[var(--atelier-ink)] hover:bg-white",
          isDragging && "opacity-40",
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]">
          <Icon className="h-3.5 w-3.5 text-[var(--atelier-ink-muted)]" />
        </span>
        <span className="truncate font-medium">{label}</span>
      </button>
    </li>
  );
}

export function PaletteDragGhost({
  label,
  icon: Icon,
}: {
  label: string;
  icon?: (typeof QUESTION_TYPES)[number]["icon"];
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm shadow-[var(--atelier-shadow)] ring-1 ring-[var(--atelier-accent)]/30">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--atelier-accent-soft)]">
        {Icon ? (
          <Icon className="h-3.5 w-3.5 text-[var(--atelier-accent)]" />
        ) : (
          <Layers className="h-3.5 w-3.5 text-[var(--atelier-accent)]" />
        )}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function MobileTypesSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
}) {
  if (!open) return null;
  const groups = (() => {
    const map = new Map<string, (typeof QUESTION_TYPES)[number][]>();
    for (const t of QUESTION_TYPES) {
      const list = map.get(t.group) ?? [];
      list.push(t);
      map.set(t.group, list);
    }
    return [...map.entries()];
  })();

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-auto rounded-t-2xl bg-[var(--atelier-bg)] p-4 shadow-[var(--atelier-shadow)]">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium">Add a block</p>
          <button type="button" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        {groups.map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="mb-2 text-[11px] tracking-[0.12em] text-[var(--atelier-ink-muted)] uppercase">
              {group}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {items.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => {
                      onAdd(t.type);
                      onClose();
                    }}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-sm"
                  >
                    <Icon className="h-4 w-4 text-[var(--atelier-ink-muted)]" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function usePaletteOpenState() {
  return useState(false);
}
