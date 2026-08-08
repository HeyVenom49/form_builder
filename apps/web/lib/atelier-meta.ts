import type {
  PersonalityId,
  PresentationMode,
  ThemeId,
} from "./design-tokens";

export type AtelierMeta = {
  v: 1;
  presentationMode: PresentationMode;
  autoAdvance: boolean;
  welcomeTitle: string;
  welcomeDescription: string;
  thankYouTitle: string;
  atelierThemeKey: ThemeId;
  personalityId: PersonalityId;
};

const PREFIX = "@@ATELIER@@";
const SUFFIX = "@@";

export const defaultAtelierMeta = (
  partial?: Partial<AtelierMeta>,
): AtelierMeta => ({
  v: 1,
  presentationMode: "conversational",
  autoAdvance: true,
  welcomeTitle: "Welcome",
  welcomeDescription: "This will only take a moment.",
  thankYouTitle: "Thank you",
  atelierThemeKey: "minimal",
  personalityId: "minimal",
  ...partial,
});

export function packResponseMessage(
  meta: AtelierMeta,
  thankYouBody: string,
): string {
  return `${PREFIX}${JSON.stringify(meta)}${SUFFIX}\n${thankYouBody}`;
}

export function unpackResponseMessage(raw: string | null | undefined): {
  meta: AtelierMeta;
  thankYouBody: string;
} {
  if (!raw) {
    return { meta: defaultAtelierMeta(), thankYouBody: "Your response means a lot." };
  }
  if (!raw.startsWith(PREFIX)) {
    return {
      meta: defaultAtelierMeta(),
      thankYouBody: raw,
    };
  }
  const end = raw.indexOf(SUFFIX, PREFIX.length);
  if (end < 0) {
    return { meta: defaultAtelierMeta(), thankYouBody: raw };
  }
  try {
    const parsed = JSON.parse(raw.slice(PREFIX.length, end)) as AtelierMeta;
    const thankYouBody = raw.slice(end + SUFFIX.length).replace(/^\n/, "");
    return {
      meta: defaultAtelierMeta(parsed),
      thankYouBody: thankYouBody || "Your response means a lot.",
    };
  } catch {
    return { meta: defaultAtelierMeta(), thankYouBody: raw };
  }
}
