import { themes, type ThemeId } from "./design-tokens";
import {
  defaultAtelierMeta,
  unpackResponseMessage,
  type AtelierMeta,
} from "./atelier-meta";

export type ApiQuestion = {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  type: string;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  displayOrder: number;
  settings?: Record<string, unknown> | null;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    displayOrder: number;
  }>;
};

export type ApiFormDetail = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "CLOSED";
  themeId: string | null;
  updatedAt: string | Date;
  publishedAt?: string | Date | null;
  settings: {
    formId: string;
    expiresAt: string | Date | null;
    maxResponses: number | null;
    requireLogin: boolean;
    allowMultipleResponses: boolean;
    collectEmail: boolean;
    showProgressBar: boolean;
    showQuestionNumbers: boolean;
    acceptResponses: boolean;
    allowEditAfterSubmit: boolean;
    shuffleQuestions: boolean;
    responseMessage: string | null;
    redirectUrl: string | null;
  } | null;
  sections: Array<{
    id: string;
    title: string;
    description: string | null;
    displayOrder: number;
    questions?: ApiQuestion[];
  }>;
  logicRules: Array<{
    id: string;
    sourceQuestionId: string;
    targetType: string;
    targetQuestionId: string | null;
    targetSectionId: string | null;
    operator: string;
    value: unknown;
    action: string;
    priority: number;
  }>;
};

export type AtelierQuestion = {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  type: string;
  required: boolean;
  placeholder?: string;
  settings?: Record<string, unknown> | null;
  options?: Array<{ id: string; label: string; value: string }>;
  optionLabels?: string[];
};

export type AtelierFormView = {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: ApiFormDetail["status"];
  themeId: string | null;
  sectionId: string | null;
  questions: AtelierQuestion[];
  logicRules: ApiFormDetail["logicRules"];
  settings: ApiFormDetail["settings"];
  meta: AtelierMeta;
  thankYouBody: string;
  updatedAt: string;
};

import { ALL_QUESTION_TYPE_IDS } from "./question-types";

const SUPPORTED = ALL_QUESTION_TYPE_IDS;

export function flattenForm(detail: ApiFormDetail): AtelierFormView {
  const sections = [...(detail.sections || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const primary = sections[0] ?? null;
  const questions = sections
    .flatMap((s) =>
      (s.questions || []).map((q) => ({
        ...q,
        sectionId: q.sectionId || s.id,
      })),
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((q) => {
      const opts = [...(q.options || [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      return {
        id: q.id,
        sectionId: q.sectionId,
        title: q.title,
        description: q.description || q.helpText || undefined,
        type: SUPPORTED.has(q.type as never) ? q.type : "SHORT_TEXT",
        required: q.required,
        placeholder: q.placeholder || undefined,
        settings:
          q.settings && typeof q.settings === "object"
            ? (q.settings as Record<string, unknown>)
            : null,
        options: opts.map((o) => ({
          id: o.id,
          label: o.label,
          value: o.value,
        })),
        optionLabels: opts.map((o) => o.label),
      };
    });

  const { meta, thankYouBody } = unpackResponseMessage(
    detail.settings?.responseMessage,
  );

  return {
    id: detail.id,
    title: detail.title,
    description: detail.description || "",
    slug: detail.slug,
    status: detail.status,
    themeId: detail.themeId,
    sectionId: primary?.id ?? null,
    questions,
    logicRules: detail.logicRules || [],
    settings: detail.settings,
    meta,
    thankYouBody,
    updatedAt:
      typeof detail.updatedAt === "string"
        ? detail.updatedAt
        : detail.updatedAt.toISOString(),
  };
}

export function themeCreatePayload(themeKey: ThemeId) {
  const t = themes[themeKey];
  const radius = Number.parseInt(t.radius, 10);
  return {
    name: `Atelier · ${t.name}`,
    description: `atelier-key:${themeKey}`,
    primaryColor: t.primary,
    secondaryColor: t.surface,
    backgroundColor: t.background,
    textColor: t.text,
    fontFamily: "Plus Jakarta Sans",
    borderRadius: Number.isFinite(radius) ? radius : 12,
    isPublic: false,
    isDefault: false,
  };
}

export function themeKeyFromDescription(
  description: string | null | undefined,
): ThemeId | null {
  if (!description?.startsWith("atelier-key:")) return null;
  const key = description.slice("atelier-key:".length) as ThemeId;
  return key in themes ? key : null;
}

export function intentToFormSeed(intentId: string): {
  title: string;
  description: string;
  meta: AtelierMeta;
  questions: Array<{
    title: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
  }>;
} {
  switch (intentId) {
    case "event":
      return {
        title: "Summer Gathering",
        description: "Reserve your place for an evening outdoors.",
        meta: defaultAtelierMeta({
          welcomeTitle: "You're invited",
          welcomeDescription:
            "A calm evening under the trees. Tell us you're coming.",
          atelierThemeKey: "forest",
          personalityId: "elegant",
        }),
        questions: [
          {
            title: "What's your full name?",
            type: "SHORT_TEXT",
            required: true,
            placeholder: "Jordan Lee",
          },
          {
            title: "Where should we send the details?",
            type: "EMAIL",
            required: true,
            placeholder: "you@studio.com",
          },
          {
            title: "How many guests will join you?",
            type: "RADIO",
            required: true,
            options: ["Just me", "Me + 1", "Me + 2", "A small group"],
          },
          {
            title: "Any dietary notes?",
            type: "LONG_TEXT",
            placeholder: "Allergies, preferences…",
          },
        ],
      };
    case "feedback":
      return {
        title: "How was your visit?",
        description: "A short note helps us improve.",
        meta: defaultAtelierMeta({
          welcomeTitle: "We'd love your thoughts",
          welcomeDescription: "Two minutes. Honest answers welcome.",
          atelierThemeKey: "warm",
          personalityId: "friendly",
        }),
        questions: [
          {
            title: "How would you rate the experience?",
            type: "RATING",
            required: true,
          },
          { title: "What stood out most?", type: "LONG_TEXT" },
          {
            title: "Would you recommend us?",
            type: "YES_NO",
            required: true,
          },
        ],
      };
    case "survey":
      return {
        title: "Quarterly pulse",
        description: "Understand how the team is feeling.",
        meta: defaultAtelierMeta({
          welcomeTitle: "A quick pulse check",
          welcomeDescription: "Anonymous. About four thoughtful minutes.",
          atelierThemeKey: "corporate",
          personalityId: "professional",
          presentationMode: "classic",
        }),
        questions: [
          {
            title: "Which best describes your week?",
            type: "RADIO",
            required: true,
            options: ["Energized", "Steady", "Stretched", "Drained"],
          },
          {
            title: "What should we protect next quarter?",
            type: "LONG_TEXT",
          },
        ],
      };
    case "hiring":
      return {
        title: "Product Designer application",
        description: "Tell us about your craft.",
        meta: defaultAtelierMeta({
          welcomeTitle: "Let's meet your work",
          welcomeDescription: "Share the story behind what you make.",
          atelierThemeKey: "editorial",
          personalityId: "editorial",
          autoAdvance: false,
        }),
        questions: [
          { title: "Your name", type: "SHORT_TEXT", required: true },
          {
            title: "Portfolio or site",
            type: "SHORT_TEXT",
            required: true,
            placeholder: "https://",
          },
          {
            title: "A project you're proud of",
            type: "LONG_TEXT",
            required: true,
          },
        ],
      };
    case "leads":
      return {
        title: "Request a walkthrough",
        description: "We'll follow up within one business day.",
        meta: defaultAtelierMeta({
          welcomeTitle: "See Atelier in action",
          welcomeDescription: "Tell us a little about your team.",
          atelierThemeKey: "startup",
          personalityId: "startup",
        }),
        questions: [
          { title: "Work email", type: "EMAIL", required: true },
          {
            title: "Company size",
            type: "DROPDOWN",
            required: true,
            options: ["1–10", "11–50", "51–200", "200+"],
          },
          {
            title: "What are you hoping to solve?",
            type: "LONG_TEXT",
          },
        ],
      };
    case "research":
      return {
        title: "Customer interview signup",
        description: "Help shape what we build next.",
        meta: defaultAtelierMeta({
          welcomeTitle: "Share thirty minutes with us",
          welcomeDescription: "We'll send a calendar link after you submit.",
          atelierThemeKey: "ocean",
          personalityId: "agency",
        }),
        questions: [
          { title: "Your role", type: "SHORT_TEXT", required: true },
          {
            title: "Preferred interview format",
            type: "RADIO",
            required: true,
            options: ["Video call", "Phone", "In person"],
          },
        ],
      };
    default:
      return {
        title: "Untitled experience",
        description: "",
        meta: defaultAtelierMeta(),
        questions: [
          {
            title: "Your first question",
            type: "SHORT_TEXT",
            placeholder: "Type a placeholder…",
          },
        ],
      };
  }
}
