"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import type { AtelierFormView, AtelierQuestion } from "../../lib/form-mapper";
import {
  QUESTION_TYPES,
  needsGridSettings,
  needsOptions,
} from "../../lib/question-types";
import { cn } from "../../lib/utils";

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
}: {
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
  onAdd: (type?: string) => void;
  onRemove: (questionId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onAddOption: (questionId: string, label: string) => void;
  onRemoveOption: (optionId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groups = useMemo(() => {
    const map = new Map<string, (typeof QUESTION_TYPES)[number][]>();
    for (const t of QUESTION_TYPES) {
      const list = map.get(t.group) ?? [];
      list.push(t);
      map.set(t.group, list);
    }
    return [...map.entries()];
  }, []);

  const questionIds = useMemo(
    () => form.questions.map((q) => q.id),
    [form.questions],
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questionIds.indexOf(String(active.id));
    const newIndex = questionIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...questionIds];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved!);
    onReorder(next);
  }

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={questionIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {form.questions.map((q, index) => (
              <SortableQuestion
                key={q.id}
                question={q}
                index={index}
                selected={selectedQuestionId === q.id}
                onSelect={() => onSelect(q.id)}
                onUpdate={(patch) => onUpdateQuestion(q.id, patch)}
                onRemove={() => onRemove(q.id)}
                onUpdateOption={onUpdateOption}
                onAddOption={onAddOption}
                onRemoveOption={onRemoveOption}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="relative mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--atelier-line)]"
          >
            <Plus className="h-4 w-4" />
            Add question
          </button>
          {QUESTION_TYPES.slice(0, 6).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => onAdd(t.type)}
                title={t.label}
                className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--atelier-ink-muted)] hover:bg-white"
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute z-20 mt-3 max-h-80 w-full overflow-auto rounded-2xl bg-white p-4 shadow-[var(--atelier-shadow)] sm:max-w-lg"
            >
              {groups.map(([group, items]) => (
                <div key={group} className="mb-4 last:mb-0">
                  <p className="mb-2 text-xs tracking-[0.12em] text-[var(--atelier-ink-muted)] uppercase">
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
                            setPickerOpen(false);
                          }}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[var(--atelier-bg)]"
                        >
                          <Icon className="h-4 w-4 text-[var(--atelier-ink-muted)]" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SortableQuestion({
  question,
  index,
  selected,
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
        {(question.optionLabels || ["Option A", "Option B"]).slice(0, 3).map((o) => (
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
