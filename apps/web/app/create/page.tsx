"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

import { AppChrome } from "../../components/layout/app-chrome";
import { IntentIllustration } from "../../components/illustrations/intent";
import { createIntents } from "../../lib/design-tokens";
import { packResponseMessage } from "../../lib/atelier-meta";
import { intentToFormSeed, themeCreatePayload, themeKeyFromDescription } from "../../lib/form-mapper";
import { themes, type ThemeId } from "../../lib/design-tokens";
import {
  useCreateForm,
  useCreateQuestion,
  useUpdateFormSettings,
  useUpdateSection,
} from "../../hook/api/form";
import {
  useAssignThemeToForm,
  useCreateTheme,
  useMyThemes,
} from "../../hook/api/theme";
import { usePublicTemplates, useUseTemplate } from "../../hook/api/template";
import { trpc } from "../../trpc/client";
import { Button } from "../../components/ui/button";

export default function CreatePage() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { createFormAsync } = useCreateForm();
  const { updateSectionAsync } = useUpdateSection();
  const { updateFormSettingsAsync } = useUpdateFormSettings();
  const { createQuestionAsync } = useCreateQuestion();
  const { createThemeAsync } = useCreateTheme();
  const { assignThemeToFormAsync } = useAssignThemeToForm();
  const { themes: myThemes } = useMyThemes();
  const { templates } = usePublicTemplates(undefined);
  const { useTemplateAsync: createFromTemplateAsync } = useUseTemplate();
  const utils = trpc.useUtils();

  async function ensureThemes(): Promise<Map<ThemeId, string>> {
    const list = myThemes ?? (await utils.theme.listMyThemes.fetch());
    const byKey = new Map<ThemeId, string>();
    for (const t of list) {
      const key = themeKeyFromDescription(t.description);
      if (key) byKey.set(key, t.id);
    }
    const missing = (Object.keys(themes) as ThemeId[]).filter(
      (key) => !byKey.has(key),
    );
    if (missing.length) {
      const created = await Promise.all(
        missing.map((key) => createThemeAsync(themeCreatePayload(key))),
      );
      created.forEach((t, i) => {
        const key = missing[i]!;
        byKey.set(key, t.id);
      });
    }
    return byKey;
  }

  async function choose(intentId: string) {
    setBusy(intentId);
    setError(null);
    try {
      const seed = intentToFormSeed(intentId);
      const form = await createFormAsync({
        title: seed.title,
        description: seed.description || null,
      });
      const sectionId = form.sections[0]?.id;
      if (!sectionId) throw new Error("Missing section");

      const [, , themeMap] = await Promise.all([
        updateSectionAsync({ id: sectionId, title: "Questions" }),
        updateFormSettingsAsync({
          formId: form.id,
          responseMessage: packResponseMessage(
            seed.meta,
            "Your response means a lot.",
          ),
          showProgressBar: true,
          acceptResponses: true,
        }),
        ensureThemes(),
      ]);

      const themeId = themeMap.get(seed.meta.atelierThemeKey);
      await Promise.all([
        themeId
          ? assignThemeToFormAsync({ formId: form.id, themeId })
          : Promise.resolve(),
        ...seed.questions.map((q, i) =>
          createQuestionAsync({
            sectionId,
            title: q.title,
            type: q.type as never,
            required: q.required ?? false,
            placeholder: q.placeholder ?? null,
            displayOrder: i,
            options: q.options?.map((label, displayOrder) => ({
              label,
              value: label,
              displayOrder,
            })),
          }),
        ),
      ]);

      router.push(`/forms/${form.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create experience");
    } finally {
      setBusy(null);
    }
  }

  async function applyLibraryTemplate(templateId: string) {
    setBusy(templateId);
    setError(null);
    try {
      const form = await createFromTemplateAsync({ templateId });
      router.push(`/forms/${form.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not use template");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppChrome>
      <div className="mx-auto max-w-5xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm tracking-[0.14em] text-[var(--atelier-accent)] uppercase">
            Create
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl md:text-6xl">
            What would you like to create today?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--atelier-ink-soft)]">
            Choose an intention. We craft the first draft on the server — you
            shape the feeling.
          </p>
        </motion.div>

        {error && (
          <p className="mt-6 text-center text-sm text-[var(--atelier-danger)]">
            {error}
          </p>
        )}

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {createIntents.map((intent, i) => (
            <motion.li
              key={intent.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
            >
              <button
                type="button"
                disabled={!!busy}
                onClick={() => choose(intent.id)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[inset_0_0_0_1px_var(--atelier-line)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-60"
              >
                <div className="aspect-[5/3.2] overflow-hidden">
                  <IntentIllustration variant={intent.id} />
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {intent.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
                    {intent.description}
                  </p>
                  <span
                    className="mt-4 inline-flex text-sm font-medium"
                    style={{ color: intent.accent }}
                  >
                    {busy === intent.id ? "Creating…" : "Begin →"}
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>

        {templates && templates.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl tracking-tight">
              From the library
            </h2>
            <p className="mt-1 text-[var(--atelier-ink-muted)]">
              Public templates from your team and community.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-white px-5 py-4 shadow-[inset_0_0_0_1px_var(--atelier-line)]"
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-[var(--atelier-ink-muted)]">
                      {t.category}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!!busy}
                    onClick={() => applyLibraryTemplate(t.id)}
                  >
                    {busy === t.id ? "…" : "Use"}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppChrome>
  );
}
