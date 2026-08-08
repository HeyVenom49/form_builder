"use client";

import { packResponseMessage } from "./atelier-meta";
import {
  intentToFormSeed,
  themeCreatePayload,
  themeKeyFromDescription,
  type ApiFormDetail,
} from "./form-mapper";
import type { ThemeId } from "./design-tokens";
import { themes } from "./design-tokens";

type TrpcLike = {
  form: {
    createForm: { mutateAsync: (input: { title: string; description?: string | null }) => Promise<ApiFormDetail> };
    updateFormSettings: {
      mutateAsync: (input: Record<string, unknown>) => Promise<unknown>;
    };
    updateSection: {
      mutateAsync: (input: { id: string; title?: string }) => Promise<unknown>;
    };
    createQuestion: {
      mutateAsync: (input: Record<string, unknown>) => Promise<{
        id: string;
        type: string;
      }>;
    };
    createQuestionOption: {
      mutateAsync: (input: {
        questionId: string;
        label: string;
        value: string;
        displayOrder?: number;
      }) => Promise<unknown>;
    };
    setFormStatus: {
      mutateAsync: (input: { id: string; status: "PUBLISHED" }) => Promise<unknown>;
    };
  };
  theme: {
    listMyThemes: {
      fetch: () => Promise<
        Array<{ id: string; description: string | null; name: string }>
      >;
    };
    createTheme: {
      mutateAsync: (
        input: ReturnType<typeof themeCreatePayload>,
      ) => Promise<{ id: string; description: string | null }>;
    };
    assignThemeToForm: {
      mutateAsync: (input: {
        formId: string;
        themeId: string | null;
      }) => Promise<unknown>;
    };
  };
  shareLink: {
    createShareLink: {
      mutateAsync: (input: {
        formId: string;
        slug?: string;
      }) => Promise<{ slug: string }>;
    };
    listShareLinks: {
      fetch: (input: { formId: string }) => Promise<Array<{ slug: string; isActive: boolean }>>;
    };
  };
};

export async function ensureAtelierThemes(client: TrpcLike) {
  const existing = await client.theme.listMyThemes.fetch();
  const byKey = new Map<string, string>();
  for (const t of existing) {
    const key = themeKeyFromDescription(t.description);
    if (key) byKey.set(key, t.id);
  }
  for (const key of Object.keys(themes) as ThemeId[]) {
    if (byKey.has(key)) continue;
    const created = await client.theme.createTheme.mutateAsync(
      themeCreatePayload(key),
    );
    byKey.set(key, created.id);
  }
  return byKey;
}

export async function createExperienceFromIntent(
  client: TrpcLike,
  intentId: string,
) {
  const seed = intentToFormSeed(intentId);
  const form = await client.form.createForm.mutateAsync({
    title: seed.title,
    description: seed.description || null,
  });

  const sectionId = form.sections[0]?.id;
  if (!sectionId) {
    throw new Error("Form was created without a section");
  }

  await client.form.updateSection.mutateAsync({
    id: sectionId,
    title: "Questions",
  });

  await client.form.updateFormSettings.mutateAsync({
    formId: form.id,
    responseMessage: packResponseMessage(
      seed.meta,
      "Your response means a lot.",
    ),
    showProgressBar: true,
    showQuestionNumbers: true,
    acceptResponses: true,
  });

  const themeMap = await ensureAtelierThemes(client);
  const themeId = themeMap.get(seed.meta.atelierThemeKey);
  if (themeId) {
    await client.theme.assignThemeToForm.mutateAsync({
      formId: form.id,
      themeId,
    });
  }

  for (let i = 0; i < seed.questions.length; i++) {
    const q = seed.questions[i]!;
    const created = await client.form.createQuestion.mutateAsync({
      sectionId,
      title: q.title,
      type: q.type,
      required: q.required ?? false,
      placeholder: q.placeholder ?? null,
      displayOrder: i,
      options: q.options?.map((label, displayOrder) => ({
        label,
        value: label,
        displayOrder,
      })),
    });

    // If API ignored inline options, create them
    if (q.options?.length && created.type) {
      // options may already exist from createQuestion
    }
  }

  return form.id;
}

export async function ensureShareLink(client: TrpcLike, formId: string) {
  const links = await client.shareLink.listShareLinks.fetch({ formId });
  const active = links.find((l) => l.isActive);
  if (active) return active.slug;
  const created = await client.shareLink.createShareLink.mutateAsync({
    formId,
  });
  return created.slug;
}
