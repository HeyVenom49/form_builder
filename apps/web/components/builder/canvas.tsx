"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import type { AtelierFormView, AtelierQuestion } from "../../lib/form-mapper";
import {
  QUESTION_TYPES,
  needsGridSettings,
  needsOptions,
} from "../../lib/question-types";
import { cn } from "../../lib/utils";
import {
  gapDragId,
  indexFromGapDragId,
  isGapDragId,
  isPaletteDragId,
  resolveDropIndex,
  typeFromPaletteDragId,
} from "./dnd-ids";

export type BuilderCanvasProps = {
  form: AtelierFormView;
  selectedQuestionId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateQuestion: (
    questionId: string,
    patch: {
      title?: string;
      description?: string | null;
      type?: string;
      required?: boolean;
      placeholder?: string | null;
      settings?: Record<string, unknown> | null;
    },
  ) => void;
  onUpdateForm: (patch: { title?: string; description?: string }) => void;
  onPersistForm?: (patch: { title?: string; description?: string }) => void;
  onAdd: (type?: string, index?: number) => void;
  onRemove: (questionId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onAddOption: (questionId: string, label: string) => void;
  onRemoveOption: (optionId: string) => void;
  /** When true, parent owns DndContext (palette + canvas). */
  embedded?: boolean;
  activeGapIndex?: number | null;
  pulseThreadIndex?: number | null;
};

export function BuilderCanvas({
  form,
  selectedQuestionId,
  onSelect,
  onUpdateQuestion,
  onUpdateForm,
  onPersistForm,
  onAdd,
  onRemove,
  onReorder,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  embedded = false,
  activeGapIndex = null,
  pulseThreadIndex = null,
}: BuilderCanvasProps) {
  const [localGap, setLocalGap] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const questionIds = useMemo(
    () => form.questions.map((q) => q.id),
    [form.questions],
  );

  const gapHighlight = embedded ? activeGapIndex : localGap;
  const seenIdsRef = useRef<Set<string>>(new Set(questionIds));

  function handleDragOver(event: DragOverEvent) {
    if (embedded) return;
    const { active, over } = event;
    if (!over) {
      setLocalGap(null);
      return;
    }
    if (isPaletteDragId(active.id) || isGapDragId(over.id)) {
      const idx = resolveDropIndex(
        String(over.id),
        String(active.id),
        questionIds,
      );
      setLocalGap(idx);
    } else {
      setLocalGap(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!embedded) setLocalGap(null);
    if (!over) return;

    if (isPaletteDragId(active.id)) {
      const type = typeFromPaletteDragId(active.id);
      const index =
        resolveDropIndex(String(over.id), String(active.id), questionIds) ??
        questionIds.length;
      onAdd(type, index);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = questionIds.indexOf(activeId);
    if (oldIndex < 0) return;

    let newIndex: number;
    if (isGapDragId(overId)) {
      newIndex = indexFromGapDragId(overId);
      if (oldIndex < newIndex) newIndex -= 1;
    } else {
      newIndex = questionIds.indexOf(overId);
    }
    if (newIndex < 0 || newIndex === oldIndex) return;
    const next = [...questionIds];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved!);
    onReorder(next);
  }

  const list = (
    <SortableContext
      items={questionIds}
      strategy={verticalListSortingStrategy}
    >
      <div className="relative pl-6 sm:pl-8">
        <div
          className="pointer-events-none absolute top-6 bottom-6 left-[11px] w-px bg-[var(--atelier-line)] sm:left-[15px]"
          aria-hidden
        />
        <DropGap index={0} active={gapHighlight === 0} />
        {form.questions.map((q, index) => {
          const isNew = !seenIdsRef.current.has(q.id);
          if (isNew) seenIdsRef.current.add(q.id);
          return (
            <div key={q.id}>
              <motion.div
                initial={isNew ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <SortableQuestion
                  question={q}
                  index={index}
                  selected={selectedQuestionId === q.id}
                  pulseThread={pulseThreadIndex === index}
                  onSelect={() => onSelect(q.id)}
                  onUpdate={(patch) => onUpdateQuestion(q.id, patch)}
                  onRemove={() => onRemove(q.id)}
                  onUpdateOption={onUpdateOption}
                  onAddOption={onAddOption}
                  onRemoveOption={onRemoveOption}
                />
              </motion.div>
              <DropGap
                index={index + 1}
                active={gapHighlight === index + 1}
              />
            </div>
          );
        })}
      </div>
    </SortableContext>
  );

  return (
    <div className="atelier-scroll mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <div className="mb-12">
        <input
          value={form.title}
          onChange={(e) => onUpdateForm({ title: e.target.value })}
          onBlur={(e) => {
            const title = e.target.value.trim() || "Untitled experience";
            if (title !== e.target.value) onUpdateForm({ title });
            (onPersistForm ?? onUpdateForm)({ title });
          }}
          className="w-full border-0 bg-transparent font-display text-4xl tracking-tight outline-none sm:text-5xl"
          placeholder="Untitled experience"
        />
        <textarea
          value={form.description}
          onChange={(e) => onUpdateForm({ description: e.target.value })}
          onBlur={(e) =>
            (onPersistForm ?? onUpdateForm)({ description: e.target.value })
          }
          rows={2}
          className="mt-3 w-full resize-none border-0 bg-transparent text-lg text-[var(--atelier-ink-soft)] outline-none"
          placeholder="Add a short description…"
        />
      </div>

      {embedded ? (
        list
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setLocalGap(null)}
        >
          {list}
        </DndContext>
      )}
    </div>
  );
}

function DropGap({ index, active }: { index: number; active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: gapDragId(index) });
  const lit = active || isOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex items-center justify-center transition-all duration-150",
        lit ? "h-8 py-1" : "h-2",
      )}
    >
      <motion.div
        initial={false}
        animate={{
          scaleX: lit ? 1 : 0.4,
          opacity: lit ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className="h-0.5 w-full origin-center rounded-full bg-[var(--atelier-accent)]"
      />
      {lit && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-0 h-2.5 w-2.5 -translate-x-1 rounded-full bg-[var(--atelier-accent)]"
        />
      )}
    </div>
  );
}

function SortableQuestion({
  question,
  index,
  selected,
  pulseThread,
  onSelect,
  onUpdate,
  onRemove,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
}: {
  question: AtelierQuestion;
  index: number;
  selected: boolean;
  pulseThread?: boolean;
  onSelect: () => void;
  onUpdate: (patch: {
    title?: string;
    description?: string | null;
    type?: string;
    required?: boolean;
    placeholder?: string | null;
    settings?: Record<string, unknown> | null;
  }) => void;
  onRemove: () => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onAddOption: (questionId: string, label: string) => void;
  onRemoveOption: (optionId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });
  const [titleDraft, setTitleDraft] = useState(question.title);
  const [descDraft, setDescDraft] = useState(question.description || "");
  const [titleFocused, setTitleFocused] = useState(false);

  useEffect(() => {
    setTitleDraft(question.title);
  }, [question.title]);

  useEffect(() => {
    setDescDraft(question.description || "");
  }, [question.description]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const showOptions = selected && needsOptions(question.type);
  const showGrid = selected && needsGridSettings(question.type);
  const showScale = selected && question.type === "LINEAR_SCALE";
  const settings = (question.settings ?? {}) as Record<string, unknown>;
  const showDelete = !titleFocused;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group relative", isDragging && "z-20 opacity-90")}
    >
      <motion.span
        aria-hidden
        animate={{
          scale: pulseThread ? 1.4 : 1,
          backgroundColor: pulseThread
            ? "var(--atelier-accent)"
            : "var(--atelier-bg)",
          borderColor: pulseThread
            ? "var(--atelier-accent)"
            : "var(--atelier-line-strong)",
        }}
        transition={{ duration: 0.22 }}
        className="absolute top-7 -left-[19px] z-[1] h-2.5 w-2.5 rounded-full border sm:-left-[21px]"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect();
        }}
        className={cn(
          "w-full rounded-2xl px-4 py-5 text-left transition-colors duration-150 sm:px-6",
          selected
            ? "bg-white shadow-[var(--atelier-shadow)]"
            : "hover:bg-white/60",
        )}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-1.5 touch-none p-1 text-[var(--atelier-ink-muted)] opacity-0 transition-opacity group-hover:opacity-100"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="mt-1.5 w-6 text-sm text-[var(--atelier-ink-muted)]">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => {
                setTitleFocused(false);
                const next = titleDraft.trim() || "Untitled question";
                if (next !== titleDraft) setTitleDraft(next);
                if (next !== question.title) onUpdate({ title: next });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full border-0 bg-transparent text-xl font-medium outline-none"
            />
            {selected && (
              <input
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onBlur={() => {
                  const next = descDraft || null;
                  if ((question.description || null) !== next) {
                    onUpdate({ description: next });
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 w-full border-0 bg-transparent text-sm text-[var(--atelier-ink-muted)] outline-none"
                placeholder="Optional help text"
              />
            )}

            <div className="pointer-events-none mt-4 opacity-50">
              <GhostField question={question} />
            </div>

            {showOptions && (
              <div
                className="pointer-events-auto mt-4 space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs tracking-wide text-[var(--atelier-ink-muted)] uppercase">
                  Options
                </p>
                {(question.options || []).map((opt) => (
                  <div key={opt.id} className="flex gap-2">
                    <OptionLabelInput
                      optionId={opt.id}
                      label={opt.label}
                      onSave={onUpdateOption}
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveOption(opt.id)}
                      className="text-sm text-[var(--atelier-ink-muted)]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onAddOption(
                      question.id,
                      `Option ${(question.options?.length || 0) + 1}`,
                    )
                  }
                  className="text-sm font-medium text-[var(--atelier-accent)]"
                >
                  + Add option
                </button>
              </div>
            )}

            {showScale && (
              <div
                className="pointer-events-auto mt-4 grid grid-cols-2 gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="text-xs text-[var(--atelier-ink-muted)]">
                  Min
                  <input
                    type="number"
                    value={Number(settings.min ?? 1)}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...settings,
                          min: Number(e.target.value),
                        },
                      })
                    }
                    className="mt-1 h-10 w-full rounded-lg bg-[var(--atelier-bg)] px-3 text-sm outline-none"
                  />
                </label>
                <label className="text-xs text-[var(--atelier-ink-muted)]">
                  Max
                  <input
                    type="number"
                    value={Number(settings.max ?? 10)}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...settings,
                          max: Number(e.target.value),
                        },
                      })
                    }
                    className="mt-1 h-10 w-full rounded-lg bg-[var(--atelier-bg)] px-3 text-sm outline-none"
                  />
                </label>
              </div>
            )}

            {showGrid && (
              <div
                className="pointer-events-auto mt-4 space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="block text-xs text-[var(--atelier-ink-muted)]">
                  Rows (one per line)
                  <textarea
                    rows={3}
                    value={((settings.rows as string[]) ?? []).join("\n")}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...settings,
                          rows: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-[var(--atelier-bg)] px-3 py-2 text-sm outline-none"
                  />
                </label>
                <label className="block text-xs text-[var(--atelier-ink-muted)]">
                  Columns (one per line)
                  <textarea
                    rows={3}
                    value={((settings.columns as string[]) ?? []).join("\n")}
                    onChange={(e) =>
                      onUpdate({
                        settings: {
                          ...settings,
                          columns: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg bg-[var(--atelier-bg)] px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      {selected && (
        <div
          className="absolute -top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-[var(--atelier-ink)] px-1.5 py-1.5 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={question.type}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="h-8 max-w-[11rem] rounded-full border-0 bg-transparent px-2 text-xs text-white outline-none"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.type} value={t.type} className="text-black">
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onUpdate({ required: !question.required })}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs",
              question.required ? "bg-white/20" : "text-white/70",
            )}
          >
            Required
          </button>
          {showDelete && (
            <button
              type="button"
              title="Delete question"
              aria-label="Delete question"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-white/90 hover:bg-white/15"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
      {!selected && showDelete && (
        <button
          type="button"
          title="Delete question"
          aria-label="Delete question"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 z-10 rounded-lg p-2 text-[var(--atelier-ink-muted)] opacity-0 transition-opacity hover:bg-black/[0.04] hover:text-[var(--atelier-danger)] group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function OptionLabelInput({
  optionId,
  label,
  onSave,
}: {
  optionId: string;
  label: string;
  onSave: (optionId: string, label: string) => void;
}) {
  const [draft, setDraft] = useState(label);

  useEffect(() => {
    setDraft(label);
  }, [label]);

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const next = draft.trim() || label;
        if (next !== draft) setDraft(next);
        if (next !== label) onSave(optionId, next);
      }}
      className="h-10 flex-1 rounded-lg bg-[var(--atelier-bg)] px-3 text-sm outline-none"
    />
  );
}

function GhostField({ question }: { question: AtelierQuestion }) {
  if (question.type === "LONG_TEXT" || question.type === "ADDRESS") {
    return (
      <div className="h-20 rounded-xl bg-[var(--atelier-bg)] shadow-[inset_0_0_0_1px_var(--atelier-line)]" />
    );
  }
  if (question.type === "RATING") {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm text-[var(--atelier-ink-muted)] shadow-[inset_0_0_0_1px_var(--atelier-line)]"
          >
            {n}
          </span>
        ))}
      </div>
    );
  }
  if (question.type === "LINEAR_SCALE") {
    const min = Number(question.settings?.min ?? 1);
    const max = Number(question.settings?.max ?? 5);
    const values = Array.from(
      { length: Math.max(2, Math.min(11, max - min + 1)) },
      (_, i) => min + i,
    );
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((n) => (
          <span
            key={n}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs shadow-[inset_0_0_0_1px_var(--atelier-line)]"
          >
            {n}
          </span>
        ))}
      </div>
    );
  }
  if (question.type === "YES_NO") {
    return (
      <div className="flex gap-2">
        {["Yes", "No"].map((o) => (
          <div
            key={o}
            className="rounded-xl px-4 py-2 text-sm shadow-[inset_0_0_0_1px_var(--atelier-line)]"
          >
            {o}
          </div>
        ))}
      </div>
    );
  }
  if (needsOptions(question.type)) {
    return (
      <div className="space-y-2">
        {(question.optionLabels || ["Option A", "Option B"])
          .slice(0, 3)
          .map((o) => (
            <div
              key={o}
              className="rounded-xl px-3 py-2.5 text-sm shadow-[inset_0_0_0_1px_var(--atelier-line)]"
            >
              {o}
            </div>
          ))}
      </div>
    );
  }
  if (question.type === "FILE_UPLOAD" || question.type === "SIGNATURE") {
    return (
      <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-[var(--atelier-line-strong)] text-sm text-[var(--atelier-ink-muted)]">
        {question.type === "SIGNATURE" ? "Sign here" : "Upload a file"}
      </div>
    );
  }
  if (needsGridSettings(question.type)) {
    return (
      <div className="overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_var(--atelier-line)]">
        <div className="grid grid-cols-3 gap-px bg-[var(--atelier-line)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-[var(--atelier-bg)]" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="h-11 rounded-xl bg-[var(--atelier-bg)] shadow-[inset_0_0_0_1px_var(--atelier-line)]" />
  );
}
