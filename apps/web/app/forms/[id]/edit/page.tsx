"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { BuilderCanvas } from "../../../../components/builder/canvas";
import {
  BuilderToolbar,
  type BuilderPanel,
} from "../../../../components/builder/builder-toolbar";
import {
  indexFromGapDragId,
  isGapDragId,
  isPaletteDragId,
  resolveDropIndex,
  typeFromPaletteDragId,
  type PaletteDragData,
} from "../../../../components/builder/dnd-ids";
import { LivePreview } from "../../../../components/builder/live-preview";
import {
  MobileTypesSheet,
  PaletteDragGhost,
  QuestionPalette,
} from "../../../../components/builder/question-palette";
import {
  PersonalityMode,
  ThemeStudio,
} from "../../../../components/builder/theme-studio";
import {
  PresentationSettings,
  QualityPanel,
  computeQuality,
} from "../../../../components/builder/quality-panel";
import { ConnectPanel } from "../../../../components/builder/connect-panel";
import { FormSettingsPanel } from "../../../../components/builder/form-settings-panel";
import { FormShell } from "../../../../components/layout/form-shell";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { QUESTION_TYPES } from "../../../../lib/question-types";
import { useAtelierForm } from "../../../../hook/use-atelier-form";
import { useBuilderUi } from "../../../../stores/builder-ui";

type Panel = BuilderPanel;

export default function EditFormPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const ctrl = useAtelierForm(id);
  const selectedQuestionId = useBuilderUi((s) => s.selectedQuestionId);
  const selectQuestion = useBuilderUi((s) => s.selectQuestion);
  const saveHint = useBuilderUi((s) => s.saveHint);

  const [panel, setPanel] = useState<Panel>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descDraft, setDescDraft] = useState<string | null>(null);
  const [typesOpen, setTypesOpen] = useState(false);
  const [activeGapIndex, setActiveGapIndex] = useState<number | null>(null);
  const [pulseThreadIndex, setPulseThreadIndex] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<{
    label: string;
    type?: string;
  } | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const form = useMemo(() => {
    if (!ctrl.view) return null;
    return {
      ...ctrl.view,
      title: titleDraft ?? ctrl.view.title,
      description: descDraft ?? ctrl.view.description,
    };
  }, [ctrl.view, titleDraft, descDraft]);

  const questionIds = useMemo(
    () => form?.questions.map((q) => q.id) ?? [],
    [form?.questions],
  );

  useEffect(() => {
    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, []);

  function pulseAt(index: number) {
    setPulseThreadIndex(index);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulseThreadIndex(null), 220);
  }

  function addQuestion(type?: string, index?: number) {
    const insertAt =
      index === undefined
        ? questionIds.length
        : Math.max(0, Math.min(index, questionIds.length));
    void ctrl.addQuestion(type, index).then(() => pulseAt(insertAt));
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (isPaletteDragId(active.id)) {
      const data = active.data.current as PaletteDragData | undefined;
      const type = data?.type ?? typeFromPaletteDragId(active.id);
      const meta = QUESTION_TYPES.find((t) => t.type === type);
      setOverlay({
        label: data?.label ?? meta?.label ?? type,
        type,
      });
      return;
    }
    const q = form?.questions.find((item) => item.id === String(active.id));
    if (q) {
      const meta = QUESTION_TYPES.find((t) => t.type === q.type);
      setOverlay({ label: q.title || meta?.label || "Question", type: q.type });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveGapIndex(null);
      return;
    }
    if (isPaletteDragId(active.id) || isGapDragId(over.id)) {
      setActiveGapIndex(
        resolveDropIndex(String(over.id), String(active.id), questionIds),
      );
    } else {
      setActiveGapIndex(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveGapIndex(null);
    setOverlay(null);
    if (!over) return;

    if (isPaletteDragId(active.id)) {
      const type = typeFromPaletteDragId(active.id);
      const index =
        resolveDropIndex(String(over.id), String(active.id), questionIds) ??
        questionIds.length;
      addQuestion(type, index);
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
    void ctrl.reorder(next).then(() => pulseAt(newIndex));
  }

  function handleDragCancel() {
    setActiveGapIndex(null);
    setOverlay(null);
  }

  if (ctrl.isLoading) {
    return (
      <FormShell
        form={{
          id,
          title: "Loading…",
          status: "DRAFT",
        }}
      >
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="mt-4 h-6 w-full max-w-md" />
          <div className="mt-12 space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </FormShell>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-display text-3xl">Experience not found</p>
        <p className="text-sm text-[var(--atelier-ink-muted)]">
          {ctrl.error?.message || "Sign in and check the API."}
        </p>
        <Link href="/workspace">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    );
  }

  const quality = computeQuality(form);
  const overlayMeta = overlay
    ? QUESTION_TYPES.find((t) => t.type === overlay.type)
    : undefined;

  return (
    <FormShell
      form={{
        id: form.id,
        title: form.title,
        status: form.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        themeId: form.meta.atelierThemeKey,
      }}
      subtitle={
        saveHint === "saving"
          ? `Saving… · Quality ${quality.score}`
          : `Synced · Quality ${quality.score}`
      }
      trailing={
        <BuilderToolbar
          panel={panel}
          showPreview={showPreview}
          onTogglePanel={setPanel}
          onTogglePreview={() => setShowPreview((v) => !v)}
          onOpenTypes={() => setTypesOpen(true)}
        />
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <QuestionPalette
            onAdd={(type) => addQuestion(type)}
            className="hidden md:flex"
          />

          <div className="atelier-scroll min-w-0 flex-1 overflow-auto">
            <BuilderCanvas
              form={form}
              selectedQuestionId={selectedQuestionId}
              onSelect={selectQuestion}
              onUpdateQuestion={(qid, patch) => ctrl.updateQuestion(qid, patch)}
              onUpdateForm={(patch) => {
                if (patch.title !== undefined) setTitleDraft(patch.title);
                if (patch.description !== undefined)
                  setDescDraft(patch.description);
              }}
              onPersistForm={(patch) => {
                const title =
                  (patch.title ?? titleDraft ?? ctrl.view!.title).trim() ||
                  "Untitled experience";
                const description =
                  patch.description ?? descDraft ?? ctrl.view!.description;
                setTitleDraft(title);
                setDescDraft(description);
                void ctrl.updateTitleDescription(title, description);
              }}
              onAdd={(type, index) => addQuestion(type, index)}
              onRemove={(qid) => ctrl.removeQuestion(qid)}
              onReorder={(ids) => {
                void ctrl.reorder(ids);
              }}
              onUpdateOption={(oid, label) => ctrl.updateOptionLabel(oid, label)}
              onAddOption={(qid, label) => ctrl.addOption(qid, label)}
              onRemoveOption={(oid) => ctrl.removeOption(oid)}
              embedded
              activeGapIndex={activeGapIndex}
              pulseThreadIndex={pulseThreadIndex}
            />
          </div>

          <AnimatePresence initial={false}>
            {showPreview && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden shrink-0 overflow-hidden border-l border-[var(--atelier-line)] xl:block"
              >
                <div className="h-full w-[380px] p-3">
                  <LivePreview
                    form={form}
                    focusQuestionId={selectedQuestionId}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {panel && (
              <motion.aside
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 24, opacity: 0 }}
                className="absolute inset-x-0 bottom-0 top-0 z-30 flex min-h-0 flex-col overflow-hidden border-l border-[var(--atelier-line)] bg-[var(--atelier-bg)] md:static md:h-full md:w-[380px] md:shrink-0"
              >
                {panel === "theme" && (
                  <ThemeStudio
                    form={form}
                    onTheme={(t) => ctrl.setThemeKey(t)}
                  />
                )}
                {panel === "personality" && (
                  <PersonalityMode
                    form={form}
                    onPersonality={(p) => ctrl.setPersonality(p)}
                  />
                )}
                {panel === "present" && (
                  <PresentationSettings
                    form={form}
                    onChange={(patch) => ctrl.updateMeta(patch)}
                  />
                )}
                {panel === "settings" && <FormSettingsPanel form={form} />}
                {panel === "connect" && <ConnectPanel form={form} />}
                {panel === "publish" && (
                  <QualityPanel
                    form={form}
                    linkCopied={linkCopied}
                    onPublish={() => ctrl.publish()}
                    onCopyLink={async () => {
                      await ctrl.copyPublicLink();
                      setLinkCopied(true);
                      window.setTimeout(() => setLinkCopied(false), 2000);
                    }}
                  />
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        <DragOverlay dropAnimation={null}>
          {overlay ? (
            <PaletteDragGhost label={overlay.label} icon={overlayMeta?.icon} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <MobileTypesSheet
        open={typesOpen}
        onClose={() => setTypesOpen(false)}
        onAdd={(type) => addQuestion(type)}
      />
    </FormShell>
  );
}
