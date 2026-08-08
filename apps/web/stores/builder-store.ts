import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  personalities,
  type PersonalityId,
  type PresentationMode,
  type ThemeId,
} from "../lib/design-tokens";

export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "EMAIL"
  | "RADIO"
  | "CHECKBOX"
  | "RATING"
  | "YES_NO"
  | "DROPDOWN";

export type BuilderQuestion = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type BuilderForm = {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  themeId: ThemeId;
  personalityId: PersonalityId;
  presentationMode: PresentationMode;
  /** When true, choice questions auto-advance in conversational mode */
  autoAdvance: boolean;
  welcomeTitle: string;
  welcomeDescription: string;
  estimatedMinutes: number;
  thankYouTitle: string;
  thankYouDescription: string;
  questions: BuilderQuestion[];
  updatedAt: string;
};

export type FormResponse = {
  id: string;
  formId: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
  durationSeconds: number;
};

type BuilderState = {
  forms: BuilderForm[];
  responses: FormResponse[];
  activeFormId: string | null;
  selectedQuestionId: string | null;
  saveState: "idle" | "saving" | "saved";
  ensureDemoForms: () => void;
  createFromIntent: (intentId: string) => string;
  getForm: (id: string) => BuilderForm | undefined;
  getFormBySlug: (slug: string) => BuilderForm | undefined;
  getResponses: (formId: string) => FormResponse[];
  updateForm: (id: string, patch: Partial<BuilderForm>) => void;
  deleteForm: (id: string) => void;
  duplicateForm: (id: string) => string | null;
  setTheme: (id: string, themeId: ThemeId) => void;
  setPersonality: (id: string, personalityId: PersonalityId) => void;
  selectQuestion: (questionId: string | null) => void;
  updateQuestion: (
    formId: string,
    questionId: string,
    patch: Partial<BuilderQuestion>,
  ) => void;
  addQuestion: (formId: string, type?: QuestionType) => void;
  removeQuestion: (formId: string, questionId: string) => void;
  reorderQuestions: (formId: string, orderedIds: string[]) => void;
  submitResponse: (
    formId: string,
    answers: Record<string, string | string[]>,
    durationSeconds?: number,
  ) => string;
  markSaving: () => void;
  markSaved: () => void;
};

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function intentSeed(intentId: string): Omit<BuilderForm, "id" | "updatedAt"> {
  const base = {
    status: "DRAFT" as const,
    themeId: "minimal" as ThemeId,
    personalityId: "minimal" as PersonalityId,
    presentationMode: "conversational" as PresentationMode,
    autoAdvance: true,
    estimatedMinutes: 3,
    thankYouTitle: "Thank you",
    thankYouDescription: "Your response means a lot.",
    slug: `${intentId}-${Date.now().toString(36)}`,
  };

  switch (intentId) {
    case "event":
      return {
        ...base,
        title: "Summer Gathering",
        description: "Reserve your place for an evening outdoors.",
        welcomeTitle: "You're invited",
        welcomeDescription:
          "A calm evening under the trees. Tell us you're coming.",
        themeId: "forest",
        personalityId: "elegant",
        estimatedMinutes: 2,
        questions: [
          {
            id: uid(),
            title: "What's your full name?",
            type: "SHORT_TEXT",
            required: true,
            placeholder: "Jordan Lee",
          },
          {
            id: uid(),
            title: "Where should we send the details?",
            type: "EMAIL",
            required: true,
            placeholder: "you@studio.com",
          },
          {
            id: uid(),
            title: "How many guests will join you?",
            type: "RADIO",
            required: true,
            options: ["Just me", "Me + 1", "Me + 2", "A small group"],
          },
          {
            id: uid(),
            title: "Any dietary notes?",
            type: "LONG_TEXT",
            required: false,
            placeholder: "Allergies, preferences…",
          },
        ],
      };
    case "feedback":
      return {
        ...base,
        title: "How was your visit?",
        description: "A short note helps us improve.",
        welcomeTitle: "We'd love your thoughts",
        welcomeDescription: "Two minutes. Honest answers welcome.",
        themeId: "warm",
        personalityId: "friendly",
        questions: [
          {
            id: uid(),
            title: "How would you rate the experience?",
            type: "RATING",
            required: true,
          },
          {
            id: uid(),
            title: "What stood out most?",
            type: "LONG_TEXT",
            required: false,
          },
          {
            id: uid(),
            title: "Would you recommend us?",
            type: "YES_NO",
            required: true,
          },
        ],
      };
    case "survey":
      return {
        ...base,
        title: "Quarterly pulse",
        description: "Understand how the team is feeling.",
        welcomeTitle: "A quick pulse check",
        welcomeDescription: "Anonymous. About four thoughtful minutes.",
        themeId: "corporate",
        personalityId: "professional",
        estimatedMinutes: 4,
        presentationMode: "classic",
        questions: [
          {
            id: uid(),
            title: "Which best describes your week?",
            type: "RADIO",
            required: true,
            options: ["Energized", "Steady", "Stretched", "Drained"],
          },
          {
            id: uid(),
            title: "What should we protect next quarter?",
            type: "LONG_TEXT",
            required: false,
          },
        ],
      };
    case "hiring":
      return {
        ...base,
        title: "Product Designer application",
        description: "Tell us about your craft.",
        welcomeTitle: "Let's meet your work",
        welcomeDescription: "Share the story behind what you make.",
        themeId: "editorial",
        personalityId: "editorial",
        estimatedMinutes: 8,
        autoAdvance: false,
        questions: [
          {
            id: uid(),
            title: "Your name",
            type: "SHORT_TEXT",
            required: true,
          },
          {
            id: uid(),
            title: "Portfolio or site",
            type: "SHORT_TEXT",
            required: true,
            placeholder: "https://",
          },
          {
            id: uid(),
            title: "A project you're proud of",
            type: "LONG_TEXT",
            required: true,
          },
        ],
      };
    case "leads":
      return {
        ...base,
        title: "Request a walkthrough",
        description: "We'll follow up within one business day.",
        welcomeTitle: "See Atelier in action",
        welcomeDescription: "Tell us a little about your team.",
        themeId: "startup",
        personalityId: "startup",
        questions: [
          {
            id: uid(),
            title: "Work email",
            type: "EMAIL",
            required: true,
          },
          {
            id: uid(),
            title: "Company size",
            type: "DROPDOWN",
            required: true,
            options: ["1–10", "11–50", "51–200", "200+"],
          },
          {
            id: uid(),
            title: "What are you hoping to solve?",
            type: "LONG_TEXT",
            required: false,
          },
        ],
      };
    case "research":
      return {
        ...base,
        title: "Customer interview signup",
        description: "Help shape what we build next.",
        welcomeTitle: "Share thirty minutes with us",
        welcomeDescription: "We'll send a calendar link after you submit.",
        themeId: "ocean",
        personalityId: "agency",
        questions: [
          {
            id: uid(),
            title: "Your role",
            type: "SHORT_TEXT",
            required: true,
          },
          {
            id: uid(),
            title: "Preferred interview format",
            type: "RADIO",
            required: true,
            options: ["Video call", "Phone", "In person"],
          },
        ],
      };
    default:
      return {
        ...base,
        title: "Untitled experience",
        description: "",
        welcomeTitle: "Welcome",
        welcomeDescription: "This will only take a moment.",
        questions: [
          {
            id: uid(),
            title: "Your first question",
            type: "SHORT_TEXT",
            required: false,
            placeholder: "Type a placeholder…",
          },
        ],
      };
  }
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      forms: [],
      responses: [],
      activeFormId: null,
      selectedQuestionId: null,
      saveState: "idle",

      ensureDemoForms: () => {
        const state = get();
        if (!state.responses) {
          set({ responses: [] });
        }
        if (get().forms.length > 0) return;
        const seeds = ["event", "feedback", "blank"].map((intent) => {
          const seed = intentSeed(intent);
          return {
            ...seed,
            id: uid(),
            updatedAt: new Date().toISOString(),
            status:
              intent === "feedback" ? ("PUBLISHED" as const) : seed.status,
          };
        });
        const feedback = seeds.find((f) => f.title.includes("visit"));
        const demoResponses: FormResponse[] = feedback
          ? [
              {
                id: uid(),
                formId: feedback.id,
                answers: {
                  [feedback.questions[0]?.id ?? ""]: "5",
                  [feedback.questions[1]?.id ?? ""]:
                    "The space felt calm and considered.",
                  [feedback.questions[2]?.id ?? ""]: "Yes",
                },
                submittedAt: new Date(
                  Date.now() - 1000 * 60 * 60 * 26,
                ).toISOString(),
                durationSeconds: 94,
              },
              {
                id: uid(),
                formId: feedback.id,
                answers: {
                  [feedback.questions[0]?.id ?? ""]: "4",
                  [feedback.questions[1]?.id ?? ""]: "Loved the lighting.",
                  [feedback.questions[2]?.id ?? ""]: "Yes",
                },
                submittedAt: new Date(
                  Date.now() - 1000 * 60 * 60 * 8,
                ).toISOString(),
                durationSeconds: 71,
              },
              {
                id: uid(),
                formId: feedback.id,
                answers: {
                  [feedback.questions[0]?.id ?? ""]: "3",
                  [feedback.questions[1]?.id ?? ""]: "A bit hard to find.",
                  [feedback.questions[2]?.id ?? ""]: "No",
                },
                submittedAt: new Date(
                  Date.now() - 1000 * 60 * 40,
                ).toISOString(),
                durationSeconds: 112,
              },
            ]
          : [];
        set({ forms: seeds, responses: demoResponses });
      },

      createFromIntent: (intentId) => {
        const seed = intentSeed(intentId);
        const id = uid();
        const form: BuilderForm = {
          ...seed,
          id,
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          forms: [form, ...s.forms],
          activeFormId: id,
          selectedQuestionId: form.questions[0]?.id ?? null,
        }));
        return id;
      },

      getForm: (id) => get().forms.find((f) => f.id === id),
      getFormBySlug: (slug) => get().forms.find((f) => f.slug === slug),
      getResponses: (formId) =>
        get().responses.filter((r) => r.formId === formId),

      updateForm: (id, patch) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id
              ? { ...f, ...patch, updatedAt: new Date().toISOString() }
              : f,
          ),
          saveState: "saving",
        }));
        window.setTimeout(() => get().markSaved(), 600);
      },

      deleteForm: (id) => {
        set((s) => ({
          forms: s.forms.filter((f) => f.id !== id),
          responses: s.responses.filter((r) => r.formId !== id),
          activeFormId: s.activeFormId === id ? null : s.activeFormId,
        }));
      },

      duplicateForm: (id) => {
        const source = get().getForm(id);
        if (!source) return null;
        const newId = uid();
        const copy: BuilderForm = {
          ...source,
          id: newId,
          title: `${source.title} (copy)`,
          slug: `${source.slug}-copy-${Date.now().toString(36)}`,
          status: "DRAFT",
          questions: source.questions.map((q) => ({ ...q, id: uid() })),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ forms: [copy, ...s.forms] }));
        return newId;
      },

      setTheme: (id, themeId) => {
        get().updateForm(id, { themeId });
      },

      setPersonality: (id, personalityId) => {
        const match = personalities.find((p) => p.id === personalityId);
        get().updateForm(id, {
          personalityId,
          ...(match ? { themeId: match.themeId } : {}),
        });
      },

      selectQuestion: (questionId) => set({ selectedQuestionId: questionId }),

      updateQuestion: (formId, questionId, patch) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id !== formId
              ? f
              : {
                  ...f,
                  updatedAt: new Date().toISOString(),
                  questions: f.questions.map((q) =>
                    q.id === questionId ? { ...q, ...patch } : q,
                  ),
                },
          ),
          saveState: "saving",
        }));
        window.setTimeout(() => get().markSaved(), 600);
      },

      addQuestion: (formId, type = "SHORT_TEXT") => {
        const q: BuilderQuestion = {
          id: uid(),
          title: "New question",
          type,
          required: false,
          options:
            type === "RADIO" || type === "CHECKBOX" || type === "DROPDOWN"
              ? ["Option A", "Option B", "Option C"]
              : undefined,
        };
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id !== formId
              ? f
              : {
                  ...f,
                  questions: [...f.questions, q],
                  updatedAt: new Date().toISOString(),
                },
          ),
          selectedQuestionId: q.id,
          saveState: "saving",
        }));
        window.setTimeout(() => get().markSaved(), 600);
      },

      removeQuestion: (formId, questionId) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id !== formId
              ? f
              : {
                  ...f,
                  questions: f.questions.filter((q) => q.id !== questionId),
                  updatedAt: new Date().toISOString(),
                },
          ),
          selectedQuestionId:
            s.selectedQuestionId === questionId ? null : s.selectedQuestionId,
          saveState: "saving",
        }));
        window.setTimeout(() => get().markSaved(), 600);
      },

      reorderQuestions: (formId, orderedIds) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            const map = new Map(f.questions.map((q) => [q.id, q]));
            return {
              ...f,
              questions: orderedIds
                .map((id) => map.get(id))
                .filter(Boolean) as BuilderQuestion[],
              updatedAt: new Date().toISOString(),
            };
          }),
          saveState: "saving",
        }));
        window.setTimeout(() => get().markSaved(), 600);
      },

      submitResponse: (formId, answers, durationSeconds = 60) => {
        const id = uid();
        set((s) => ({
          responses: [
            {
              id,
              formId,
              answers,
              submittedAt: new Date().toISOString(),
              durationSeconds,
            },
            ...s.responses,
          ],
        }));
        return id;
      },

      markSaving: () => set({ saveState: "saving" }),
      markSaved: () => set({ saveState: "saved" }),
    }),
    {
      name: "atelier-builder",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as {
          forms?: unknown;
          responses?: unknown;
        };
        return {
          forms: Array.isArray(state?.forms) ? state.forms : [],
          responses: Array.isArray(state?.responses) ? state.responses : [],
        };
      },
    },
  ),
);
