export type PresentationMode = "classic" | "conversational" | "card";

export type PersonalityId =
  | "professional"
  | "friendly"
  | "luxury"
  | "playful"
  | "minimal"
  | "elegant"
  | "bold"
  | "editorial"
  | "startup"
  | "agency";

export type ThemeId =
  | "minimal"
  | "midnight"
  | "luxury"
  | "editorial"
  | "corporate"
  | "startup"
  | "ocean"
  | "forest"
  | "pastel"
  | "playful"
  | "elegant"
  | "warm";

export type FormTheme = {
  id: ThemeId;
  name: string;
  personality: PersonalityId;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  border: string;
  inputBg: string;
  radius: string;
  fontDisplay: string;
  fontBody: string;
  density: "airy" | "comfortable" | "compact";
  buttonStyle: "solid" | "soft" | "outline";
  shadow: string;
};

export const themes: Record<ThemeId, FormTheme> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    personality: "minimal",
    background: "#FAFAF9",
    surface: "#FFFFFF",
    text: "#141414",
    textMuted: "#737373",
    primary: "#1B6B5A",
    primaryText: "#FFFFFF",
    border: "rgba(20,20,20,0.08)",
    inputBg: "#FFFFFF",
    radius: "10px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "airy",
    buttonStyle: "solid",
    shadow: "none",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    personality: "bold",
    background: "#0C0F14",
    surface: "#161B22",
    text: "#F3F4F6",
    textMuted: "#9CA3AF",
    primary: "#5EEAD4",
    primaryText: "#0C0F14",
    border: "rgba(255,255,255,0.08)",
    inputBg: "#1C2330",
    radius: "12px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "comfortable",
    buttonStyle: "solid",
    shadow: "0 24px 48px rgba(0,0,0,0.35)",
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    personality: "luxury",
    background: "#0F0E0C",
    surface: "#1A1814",
    text: "#F5F0E8",
    textMuted: "#A89F91",
    primary: "#C4A574",
    primaryText: "#0F0E0C",
    border: "rgba(196,165,116,0.2)",
    inputBg: "#221F1A",
    radius: "4px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "airy",
    buttonStyle: "outline",
    shadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    personality: "editorial",
    background: "#F4F1EA",
    surface: "#FFFEFB",
    text: "#1A1714",
    textMuted: "#6B645C",
    primary: "#1A1714",
    primaryText: "#FFFEFB",
    border: "rgba(26,23,20,0.12)",
    inputBg: "#FFFEFB",
    radius: "2px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "airy",
    buttonStyle: "solid",
    shadow: "none",
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    personality: "professional",
    background: "#F5F7FA",
    surface: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#64748B",
    primary: "#1E3A5F",
    primaryText: "#FFFFFF",
    border: "rgba(15,23,42,0.1)",
    inputBg: "#FFFFFF",
    radius: "8px",
    fontDisplay: "var(--font-sans)",
    fontBody: "var(--font-sans)",
    density: "comfortable",
    buttonStyle: "solid",
    shadow: "0 1px 2px rgba(15,23,42,0.06)",
  },
  startup: {
    id: "startup",
    name: "Startup",
    personality: "startup",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#64748B",
    primary: "#0F766E",
    primaryText: "#FFFFFF",
    border: "rgba(15,23,42,0.08)",
    inputBg: "#F8FAFC",
    radius: "14px",
    fontDisplay: "var(--font-sans)",
    fontBody: "var(--font-sans)",
    density: "comfortable",
    buttonStyle: "soft",
    shadow: "0 8px 24px rgba(15,118,110,0.12)",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    personality: "friendly",
    background: "#E8F4F8",
    surface: "#FFFFFF",
    text: "#0C4A6E",
    textMuted: "#5B8A9E",
    primary: "#0284C7",
    primaryText: "#FFFFFF",
    border: "rgba(2,132,199,0.15)",
    inputBg: "#FFFFFF",
    radius: "16px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "comfortable",
    buttonStyle: "solid",
    shadow: "0 12px 32px rgba(2,132,199,0.1)",
  },
  forest: {
    id: "forest",
    name: "Forest",
    personality: "elegant",
    background: "#EEF2EE",
    surface: "#FAFBF9",
    text: "#1A2E1C",
    textMuted: "#5C735F",
    primary: "#2F5D3A",
    primaryText: "#FAFBF9",
    border: "rgba(47,93,58,0.14)",
    inputBg: "#FFFFFF",
    radius: "12px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "airy",
    buttonStyle: "solid",
    shadow: "0 10px 28px rgba(26,46,28,0.08)",
  },
  pastel: {
    id: "pastel",
    name: "Pastel",
    personality: "friendly",
    background: "#FBF7F9",
    surface: "#FFFFFF",
    text: "#3D2C3A",
    textMuted: "#8B7384",
    primary: "#C97B9A",
    primaryText: "#FFFFFF",
    border: "rgba(201,123,154,0.18)",
    inputBg: "#FFF9FB",
    radius: "18px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "airy",
    buttonStyle: "soft",
    shadow: "0 8px 24px rgba(201,123,154,0.12)",
  },
  playful: {
    id: "playful",
    name: "Playful",
    personality: "playful",
    background: "#FFF8EB",
    surface: "#FFFFFF",
    text: "#1C1917",
    textMuted: "#78716C",
    primary: "#EA580C",
    primaryText: "#FFFFFF",
    border: "rgba(234,88,12,0.16)",
    inputBg: "#FFFBF5",
    radius: "20px",
    fontDisplay: "var(--font-sans)",
    fontBody: "var(--font-sans)",
    density: "comfortable",
    buttonStyle: "solid",
    shadow: "0 10px 0 rgba(234,88,12,0.15)",
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    personality: "elegant",
    background: "#F7F5F2",
    surface: "#FFFFFF",
    text: "#1C1917",
    textMuted: "#78716C",
    primary: "#44403C",
    primaryText: "#FAFAF9",
    border: "rgba(28,25,23,0.1)",
    inputBg: "#FFFFFF",
    radius: "6px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "airy",
    buttonStyle: "outline",
    shadow: "none",
  },
  warm: {
    id: "warm",
    name: "Warm",
    personality: "friendly",
    background: "#FBF6F0",
    surface: "#FFFDF9",
    text: "#292524",
    textMuted: "#78716C",
    primary: "#B45309",
    primaryText: "#FFFDF9",
    border: "rgba(180,83,9,0.14)",
    inputBg: "#FFFFFF",
    radius: "12px",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-sans)",
    density: "comfortable",
    buttonStyle: "solid",
    shadow: "0 12px 28px rgba(180,83,9,0.08)",
  },
};

export const personalities: {
  id: PersonalityId;
  label: string;
  description: string;
  themeId: ThemeId;
}[] = [
  {
    id: "professional",
    label: "Professional",
    description: "Clear, trusted, composed.",
    themeId: "corporate",
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm and approachable.",
    themeId: "warm",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Quiet opulence.",
    themeId: "luxury",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Light, bright energy.",
    themeId: "playful",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Nothing extra. Everything needed.",
    themeId: "minimal",
  },
  {
    id: "elegant",
    label: "Elegant",
    description: "Refined restraint.",
    themeId: "elegant",
  },
  {
    id: "bold",
    label: "Bold",
    description: "Confident contrast.",
    themeId: "midnight",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Story-led and literary.",
    themeId: "editorial",
  },
  {
    id: "startup",
    label: "Modern Startup",
    description: "Crisp product energy.",
    themeId: "startup",
  },
  {
    id: "agency",
    label: "Creative Agency",
    description: "Expressive and crafted.",
    themeId: "ocean",
  },
];

export const createIntents = [
  {
    id: "event",
    title: "Event Registration",
    description: "Gather guests with grace.",
    accent: "#1B6B5A",
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Listen without friction.",
    accent: "#0284C7",
  },
  {
    id: "survey",
    title: "Survey",
    description: "Ask with intention.",
    accent: "#1E3A5F",
  },
  {
    id: "hiring",
    title: "Hiring",
    description: "Meet people, not résumés.",
    accent: "#B45309",
  },
  {
    id: "leads",
    title: "Lead Generation",
    description: "Invite interest, not spam.",
    accent: "#0F766E",
  },
  {
    id: "research",
    title: "Customer Research",
    description: "Discover what matters.",
    accent: "#2F5D3A",
  },
  {
    id: "blank",
    title: "Blank Canvas",
    description: "Start from silence.",
    accent: "#44403C",
  },
] as const;

export function themeToCssVars(theme: FormTheme): Record<string, string> {
  return {
    "--form-bg": theme.background,
    "--form-surface": theme.surface,
    "--form-text": theme.text,
    "--form-muted": theme.textMuted,
    "--form-primary": theme.primary,
    "--form-primary-text": theme.primaryText,
    "--form-border": theme.border,
    "--form-input-bg": theme.inputBg,
    "--form-radius": theme.radius,
    "--form-shadow": theme.shadow,
    "--form-font-display": theme.fontDisplay,
    "--form-font-body": theme.fontBody,
  };
}
