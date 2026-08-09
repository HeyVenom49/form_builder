import type { ThemeId } from "../../lib/design-tokens";

export type DemoQuestion =
  | {
      id: string;
      type: "rating";
      title: string;
      max?: number;
    }
  | {
      id: string;
      type: "text";
      title: string;
      placeholder?: string;
      multiline?: boolean;
    }
  | {
      id: string;
      type: "choice";
      title: string;
      options: string[];
    }
  | {
      id: string;
      type: "yesno";
      title: string;
    }
  | {
      id: string;
      type: "short";
      title: string;
      placeholder?: string;
    };

export type DemoForm = {
  id: string;
  title: string;
  subtitle?: string;
  themeId: ThemeId;
  category: string;
  questions: DemoQuestion[];
  successTitle?: string;
  successBody?: string;
};

export const HERO_FORM: DemoForm = {
  id: "hero-feedback",
  title: "Customer Feedback",
  subtitle: "We read every response.",
  themeId: "warm",
  category: "Feedback",
  questions: [
    {
      id: "rating",
      type: "rating",
      title: "How was your experience?",
      max: 5,
    },
    {
      id: "improve",
      type: "text",
      title: "What could we improve?",
      placeholder: "Write your answer…",
      multiline: true,
    },
    {
      id: "again",
      type: "yesno",
      title: "Would you recommend us?",
    },
  ],
  successTitle: "Thanks for sharing.",
  successBody: "That took less than a minute.",
};

export const SHOWCASE_FORM: DemoForm = {
  id: "showcase",
  title: "Tell us about your visit",
  subtitle: "A few thoughtful questions.",
  themeId: "minimal",
  category: "Feedback",
  questions: [
    {
      id: "q1",
      type: "rating",
      title: "How would you rate your visit?",
      max: 5,
    },
    {
      id: "q2",
      type: "choice",
      title: "What brought you in today?",
      options: ["First time", "Returning", "Event", "Other"],
    },
    {
      id: "q3",
      type: "text",
      title: "Anything else on your mind?",
      placeholder: "Optional thoughts…",
      multiline: true,
    },
  ],
  successTitle: "You're all set.",
  successBody: "We appreciate your time.",
};

export const THEME_SHOWCASE_IDS: ThemeId[] = [
  "minimal",
  "midnight",
  "editorial",
  "luxury",
  "playful",
  "corporate",
  "warm",
  "elegant",
];

export const TEMPLATES: DemoForm[] = [
  {
    id: "tpl-feedback",
    title: "Customer Feedback",
    subtitle: "Listen without friction.",
    themeId: "warm",
    category: "Feedback",
    questions: [
      { id: "1", type: "rating", title: "Overall experience", max: 5 },
      {
        id: "2",
        type: "text",
        title: "What stood out?",
        placeholder: "Share a detail…",
        multiline: true,
      },
    ],
  },
  {
    id: "tpl-event",
    title: "Event Registration",
    subtitle: "Gather guests with grace.",
    themeId: "elegant",
    category: "Events",
    questions: [
      { id: "1", type: "short", title: "Full name", placeholder: "Alex Rivera" },
      {
        id: "2",
        type: "choice",
        title: "Which session?",
        options: ["Morning", "Afternoon", "Evening"],
      },
    ],
  },
  {
    id: "tpl-job",
    title: "Job Application",
    subtitle: "Meet people, not résumés.",
    themeId: "corporate",
    category: "Hiring",
    questions: [
      { id: "1", type: "short", title: "Role of interest", placeholder: "Designer" },
      {
        id: "2",
        type: "text",
        title: "Why this team?",
        placeholder: "A short note…",
        multiline: true,
      },
    ],
  },
  {
    id: "tpl-leads",
    title: "Lead Generation",
    subtitle: "Invite interest, not spam.",
    themeId: "startup",
    category: "Growth",
    questions: [
      { id: "1", type: "short", title: "Work email", placeholder: "you@company.com" },
      {
        id: "2",
        type: "choice",
        title: "Team size",
        options: ["1–10", "11–50", "51–200", "200+"],
      },
    ],
  },
  {
    id: "tpl-research",
    title: "Product Research",
    subtitle: "Discover what matters.",
    themeId: "forest",
    category: "Research",
    questions: [
      {
        id: "1",
        type: "choice",
        title: "How often do you use this?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"],
      },
      {
        id: "2",
        type: "text",
        title: "What's missing?",
        placeholder: "Be honest…",
        multiline: true,
      },
    ],
  },
  {
    id: "tpl-intake",
    title: "Client Intake",
    subtitle: "Start the relationship well.",
    themeId: "luxury",
    category: "Services",
    questions: [
      { id: "1", type: "short", title: "Company", placeholder: "Studio name" },
      {
        id: "2",
        type: "text",
        title: "Project goals",
        placeholder: "What does success look like?",
        multiline: true,
      },
    ],
  },
  {
    id: "tpl-rsvp",
    title: "RSVP",
    subtitle: "A warm yes or no.",
    themeId: "pastel",
    category: "Events",
    questions: [
      { id: "1", type: "yesno", title: "Will you join us?" },
      {
        id: "2",
        type: "choice",
        title: "Meal preference",
        options: ["Vegetarian", "Fish", "Meat", "Other"],
      },
    ],
  },
  {
    id: "tpl-survey",
    title: "Survey",
    subtitle: "Ask with intention.",
    themeId: "editorial",
    category: "Research",
    questions: [
      {
        id: "1",
        type: "rating",
        title: "How clear was our communication?",
        max: 5,
      },
      {
        id: "2",
        type: "choice",
        title: "Preferred contact",
        options: ["Email", "Phone", "Chat"],
      },
    ],
  },
  {
    id: "tpl-quiz",
    title: "Quiz",
    subtitle: "Make learning feel light.",
    themeId: "playful",
    category: "Quiz",
    questions: [
      {
        id: "1",
        type: "choice",
        title: "Which describes your style?",
        options: ["Minimal", "Bold", "Warm", "Classic"],
      },
      { id: "2", type: "yesno", title: "Ready for the next step?" },
    ],
  },
];

export const INSPIRATION: DemoForm[] = [
  {
    id: "insp-1",
    title: "Studio Inquiry",
    category: "Minimal",
    themeId: "minimal",
    questions: [
      {
        id: "1",
        type: "text",
        title: "What are you hoping to create?",
        placeholder: "A short brief is perfect.",
        multiline: true,
      },
      { id: "2", type: "yesno", title: "Have you worked with a studio before?" },
    ],
  },
  {
    id: "insp-2",
    title: "Waitlist",
    category: "Startup",
    themeId: "startup",
    questions: [
      {
        id: "1",
        type: "short",
        title: "Where should we send early access?",
        placeholder: "you@company.com",
      },
      {
        id: "2",
        type: "choice",
        title: "What are you building?",
        options: ["SaaS", "Marketplace", "Agency", "Other"],
      },
    ],
  },
  {
    id: "insp-3",
    title: "Reader Survey",
    category: "Editorial",
    themeId: "editorial",
    questions: [
      {
        id: "1",
        type: "text",
        title: "Which piece stayed with you?",
        placeholder: "Title or theme…",
        multiline: true,
      },
      { id: "2", type: "rating", title: "How often do you read us?", max: 5 },
    ],
  },
  {
    id: "insp-4",
    title: "Private Consultation",
    category: "Luxury",
    themeId: "luxury",
    questions: [
      {
        id: "1",
        type: "short",
        title: "When would you like to meet?",
        placeholder: "Preferred week…",
      },
      { id: "2", type: "yesno", title: "Is this your first consultation?" },
    ],
  },
  {
    id: "insp-5",
    title: "Team Retro",
    category: "Playful",
    themeId: "playful",
    questions: [
      {
        id: "1",
        type: "text",
        title: "What made you smile this sprint?",
        placeholder: "A win, a joke, a moment…",
        multiline: true,
      },
      { id: "2", type: "rating", title: "Team energy this week", max: 5 },
    ],
  },
  {
    id: "insp-6",
    title: "Vendor Onboarding",
    category: "Corporate",
    themeId: "corporate",
    questions: [
      {
        id: "1",
        type: "short",
        title: "Company legal name",
        placeholder: "Acme Inc.",
      },
      {
        id: "2",
        type: "choice",
        title: "Primary contact region",
        options: ["Americas", "EMEA", "APAC"],
      },
    ],
  },
  {
    id: "insp-7",
    title: "Creative Brief",
    category: "Creative",
    themeId: "ocean",
    questions: [
      {
        id: "1",
        type: "text",
        title: "Describe the feeling you want.",
        placeholder: "Tone, color, motion…",
        multiline: true,
      },
      { id: "2", type: "rating", title: "How bold should it feel?", max: 5 },
    ],
  },
  {
    id: "insp-8",
    title: "Dinner Reservation",
    category: "Warm",
    themeId: "warm",
    questions: [
      {
        id: "1",
        type: "text",
        title: "Any dietary notes for the table?",
        placeholder: "Allergies or preferences…",
        multiline: true,
      },
      { id: "2", type: "yesno", title: "Celebrating something special?" },
    ],
  },
];

export const BRAND_EXAMPLES: DemoForm[] = [
  {
    id: "brand-1",
    title: "Northline",
    subtitle: "Architecture · Project inquiry",
    category: "Architecture",
    themeId: "minimal",
    questions: [
      {
        id: "1",
        type: "text",
        title: "Tell us about the space.",
        placeholder: "Site, scale, intent…",
        multiline: true,
      },
      {
        id: "2",
        type: "choice",
        title: "Project type",
        options: ["Residence", "Workplace", "Cultural", "Other"],
      },
    ],
  },
  {
    id: "brand-2",
    title: "Lumen Health",
    subtitle: "Wellness · New patient",
    category: "Wellness",
    themeId: "forest",
    questions: [
      {
        id: "1",
        type: "text",
        title: "What brings you in today?",
        placeholder: "A few words are enough…",
        multiline: true,
      },
      { id: "2", type: "rating", title: "How urgent does this feel?", max: 5 },
    ],
  },
  {
    id: "brand-3",
    title: "Copper & Co.",
    subtitle: "Hospitality · Stay feedback",
    category: "Hospitality",
    themeId: "warm",
    questions: [
      { id: "1", type: "rating", title: "How was your evening with us?", max: 5 },
      {
        id: "2",
        type: "text",
        title: "Anything we should know?",
        placeholder: "Optional thoughts…",
        multiline: true,
      },
    ],
  },
  {
    id: "brand-4",
    title: "Atlas Capital",
    subtitle: "Finance · Consultation",
    category: "Finance",
    themeId: "corporate",
    questions: [
      {
        id: "1",
        type: "text",
        title: "What are you planning for?",
        placeholder: "Goals in a sentence…",
        multiline: true,
      },
      {
        id: "2",
        type: "choice",
        title: "Timeline",
        options: ["This quarter", "This year", "Exploring"],
      },
    ],
  },
];

export const PLAIN_FIELDS = [
  { label: "Name", placeholder: "Your name" },
  { label: "Email", placeholder: "you@email.com" },
  { label: "Message", placeholder: "Write a message…", multiline: true },
] as const;
