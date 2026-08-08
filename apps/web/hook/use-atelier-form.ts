"use client";

import { useMemo } from "react";
import { packResponseMessage, type AtelierMeta } from "../lib/atelier-meta";
import {
  flattenForm,
  themeCreatePayload,
  themeKeyFromDescription,
  type AtelierFormView,
} from "../lib/form-mapper";
import { themes, type ThemeId, personalities } from "../lib/design-tokens";
import {
  useCreateQuestion,
  useCreateQuestionOption,
  useDeleteQuestion,
  useDeleteQuestionOption,
  useForm,
  useReorderQuestions,
  useSetFormStatus,
  useUpdateForm,
  useUpdateFormSettings,
  useUpdateQuestion,
  useUpdateQuestionOption,
} from "./api/form";
import {
  useAssignThemeToForm,
  useCreateTheme,
} from "./api/theme";
import { useCreateShareLink } from "./api/share-link";
import {
  defaultSettingsForType,
  needsOptions,
} from "../lib/question-types";
import { useBuilderUi } from "../stores/builder-ui";
import { trpc } from "../trpc/client";

export function useAtelierForm(formId: string) {
  const { form, isLoading, error, isFetched } = useForm({ id: formId });
  const view = useMemo(
    () => (form ? flattenForm(form as never) : null),
    [form],
  );

  const { updateFormAsync } = useUpdateForm();
  const { updateFormSettingsAsync } = useUpdateFormSettings();
  const { setFormStatusAsync } = useSetFormStatus();
  const { createQuestionAsync } = useCreateQuestion();
  const { updateQuestionAsync } = useUpdateQuestion();
  const { deleteQuestionAsync } = useDeleteQuestion();
  const { reorderQuestionsAsync } = useReorderQuestions();
  const { createQuestionOptionAsync } = useCreateQuestionOption();
  const { updateQuestionOptionAsync } = useUpdateQuestionOption();
  const { deleteQuestionOptionAsync } = useDeleteQuestionOption();
  const { createThemeAsync } = useCreateTheme();
  const { assignThemeToFormAsync } = useAssignThemeToForm();
  const { createShareLinkAsync } = useCreateShareLink();
  const utils = trpc.useUtils();
  const pulseSaved = useBuilderUi((s) => s.pulseSaved);

  async function patchMeta(patch: Partial<AtelierMeta>) {
    if (!view) return;
    const meta = { ...view.meta, ...patch };
    await updateFormSettingsAsync({
      formId,
      responseMessage: packResponseMessage(meta, view.thankYouBody),
    });
    pulseSaved();
  }

  async function ensureThemes() {
    const list = await utils.theme.listMyThemes.fetch();
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
      created.forEach((t, i) => byKey.set(missing[i]!, t.id));
    }
    return byKey;
  }

  return {
    raw: form,
    view,
    isLoading,
    error,
    isFetched,
    links: [] as Awaited<
      ReturnType<typeof utils.shareLink.listShareLinks.fetch>
    >,
    pulseSaved,

    updateTitleDescription: async (title: string, description: string) => {
      const safeTitle = title.trim() || "Untitled experience";
      await updateFormAsync({
        id: formId,
        title: safeTitle,
        description,
      });
      pulseSaved();
    },

    updateMeta: patchMeta,

    setThemeKey: async (themeKey: ThemeId) => {
      const map = await ensureThemes();
      const themeId = map.get(themeKey) ?? null;
      if (themeId) {
        await assignThemeToFormAsync({ formId, themeId });
      }
      await patchMeta({ atelierThemeKey: themeKey });
    },

    setPersonality: async (personalityId: AtelierMeta["personalityId"]) => {
      const match = personalities.find((p) => p.id === personalityId);
      if (match) {
        await (async () => {
          const map = await ensureThemes();
          const themeId = map.get(match.themeId);
          if (themeId) {
            await assignThemeToFormAsync({ formId, themeId });
          }
          await patchMeta({
            personalityId,
            atelierThemeKey: match.themeId,
          });
        })();
      }
    },

    publish: async () => {
      await setFormStatusAsync({ id: formId, status: "PUBLISHED" });
      const links = await utils.shareLink.listShareLinks.fetch({ formId });
      const active = links.find((l) => l.isActive);
      if (!active) {
        await createShareLinkAsync({ formId });
      }
      pulseSaved();
    },

    copyPublicLink: async () => {
      const links = await utils.shareLink.listShareLinks.fetch({ formId });
      let slug = links.find((l) => l.isActive)?.slug;
      if (!slug) {
        const created = await createShareLinkAsync({ formId });
        slug = created.slug;
      }
      const url = `${window.location.origin}/f/${slug}`;
      await navigator.clipboard.writeText(url);
      return url;
    },

    addQuestion: async (type = "SHORT_TEXT") => {
      if (!view?.sectionId) return;
      const optionsNeeded = needsOptions(type);
      const settings = defaultSettingsForType(type);
      await createQuestionAsync({
        sectionId: view.sectionId,
        title: "New question",
        type: type as never,
        required: false,
        displayOrder: view.questions.length,
        settings: settings ?? undefined,
        options: optionsNeeded
          ? ["Option A", "Option B", "Option C"].map((label, displayOrder) => ({
              label,
              value: label,
              displayOrder,
            }))
          : undefined,
      });
      pulseSaved();
    },

    updateQuestion: async (
      questionId: string,
      patch: {
        title?: string;
        description?: string | null;
        type?: string;
        required?: boolean;
        placeholder?: string | null;
        settings?: Record<string, unknown> | null;
      },
    ) => {
      const nextSettings =
        patch.settings !== undefined
          ? patch.settings
          : patch.type
            ? defaultSettingsForType(patch.type)
            : undefined;
      await updateQuestionAsync({
        id: questionId,
        title:
          patch.title !== undefined
            ? patch.title.trim() || "Untitled question"
            : undefined,
        description: patch.description,
        type: patch.type as never,
        required: patch.required,
        placeholder: patch.placeholder,
        ...(nextSettings !== undefined ? { settings: nextSettings } : {}),
      });
      if (patch.type && needsOptions(patch.type)) {
        const current = view?.questions.find((q) => q.id === questionId);
        if (!current?.options?.length) {
          for (const [displayOrder, label] of [
            "Option A",
            "Option B",
            "Option C",
          ].entries()) {
            await createQuestionOptionAsync({
              questionId,
              label,
              value: label,
              displayOrder,
            });
          }
        }
      }
      pulseSaved();
    },

    removeQuestion: async (questionId: string) => {
      await deleteQuestionAsync({ id: questionId });
      if (useBuilderUi.getState().selectedQuestionId === questionId) {
        useBuilderUi.getState().selectQuestion(null);
      }
      pulseSaved();
    },

    reorder: async (orderedIds: string[]) => {
      if (!view?.sectionId) return;
      await reorderQuestionsAsync({
        sectionId: view.sectionId,
        orderedIds,
      });
      pulseSaved();
    },

    updateOptionLabel: async (optionId: string, label: string) => {
      await updateQuestionOptionAsync({
        optionId,
        label,
        value: label,
      });
      pulseSaved();
    },

    addOption: async (questionId: string, label: string) => {
      await createQuestionOptionAsync({
        questionId,
        label,
        value: label,
      });
      pulseSaved();
    },

    removeOption: async (optionId: string) => {
      await deleteQuestionOptionAsync({ optionId });
      pulseSaved();
    },

    updateSettings: async (
      patch: Record<string, unknown>,
    ) => {
      await updateFormSettingsAsync({ formId, ...patch } as never);
      pulseSaved();
    },
  };
}

export type AtelierFormController = ReturnType<typeof useAtelierForm>;
export type { AtelierFormView };
