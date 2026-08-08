"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  LayoutTemplate,
  Link2,
  Palette,
  Settings2,
  Sparkles,
} from "lucide-react";

import { BuilderCanvas } from "../../../../components/builder/canvas";
import { LivePreview } from "../../../../components/builder/live-preview";
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
import { FormShell } from "../../../../components/layout/form-shell";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { cn } from "../../../../lib/utils";
import { useAtelierForm } from "../../../../hook/use-atelier-form";
import { useBuilderUi } from "../../../../stores/builder-ui";

type Panel =
  | "theme"
  | "personality"
  | "present"
  | "publish"
  | "connect"
  | null;

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

  const form = useMemo(() => {
    if (!ctrl.view) return null;
    return {
      ...ctrl.view,
      title: titleDraft ?? ctrl.view.title,
      description: descDraft ?? ctrl.view.description,
    };
  }, [ctrl.view, titleDraft, descDraft]);

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

  function togglePanel(next: Panel) {
    setPanel((p) => (p === next ? null : next));
  }

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
        <div className="flex items-center gap-1">
          {(
            [
              { id: "theme" as const, icon: Palette },
              { id: "personality" as const, icon: Sparkles },
              { id: "present" as const, icon: LayoutTemplate },
              { id: "connect" as const, icon: Link2 },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => togglePanel(item.id)}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                  panel === item.id
                    ? "bg-white shadow-[inset_0_0_0_1px_var(--atelier-line)]"
                    : "text-[var(--atelier-ink-muted)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="hidden h-9 w-9 items-center justify-center rounded-lg md:inline-flex"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <Button size="sm" onClick={() => togglePanel("publish")}>
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="atelier-scroll min-w-0 flex-1 overflow-auto">
          <BuilderCanvas
            form={form}
            selectedQuestionId={selectedQuestionId}
            onSelect={selectQuestion}
            onUpdateQuestion={(qid, patch) => ctrl.updateQuestion(qid, patch)}
            onUpdateForm={(patch) => {
              if (patch.title !== undefined) setTitleDraft(patch.title);
              if (patch.description !== undefined) setDescDraft(patch.description);
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
            onAdd={(type) => ctrl.addQuestion(type)}
            onRemove={(qid) => ctrl.removeQuestion(qid)}
            onReorder={(ids) => ctrl.reorder(ids)}
            onUpdateOption={(oid, label) => ctrl.updateOptionLabel(oid, label)}
            onAddOption={(qid, label) => ctrl.addOption(qid, label)}
            onRemoveOption={(oid) => ctrl.removeOption(oid)}
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
                <LivePreview form={form} focusQuestionId={selectedQuestionId} />
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
              className="absolute inset-x-0 bottom-0 top-0 z-30 border-l border-[var(--atelier-line)] bg-[var(--atelier-bg)] md:static md:w-[360px] md:shrink-0"
            >
              {panel === "theme" && (
                <ThemeStudio form={form} onTheme={(t) => ctrl.setThemeKey(t)} />
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
    </FormShell>
  );
}
