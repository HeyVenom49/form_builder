import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  FileUp,
  Globe,
  Grid3X3,
  Hash,
  Link2,
  Mail,
  MapPin,
  PenLine,
  Phone,
  SlidersHorizontal,
  Star,
  Table,
  ToggleLeft,
  Type,
} from "lucide-react";

export const QUESTION_TYPES = [
  { type: "SHORT_TEXT", label: "Short text", group: "Text", icon: Type },
  { type: "LONG_TEXT", label: "Long text", group: "Text", icon: AlignLeft },
  { type: "EMAIL", label: "Email", group: "Text", icon: Mail },
  { type: "PHONE", label: "Phone", group: "Text", icon: Phone },
  { type: "NUMBER", label: "Number", group: "Text", icon: Hash },
  { type: "URL", label: "URL", group: "Text", icon: Globe },
  { type: "DATE", label: "Date", group: "Date & time", icon: Calendar },
  { type: "TIME", label: "Time", group: "Date & time", icon: Clock },
  {
    type: "DATETIME",
    label: "Date & time",
    group: "Date & time",
    icon: CalendarClock,
  },
  { type: "RADIO", label: "Multiple choice", group: "Choice", icon: CircleDot },
  {
    type: "CHECKBOX",
    label: "Checkboxes",
    group: "Choice",
    icon: CheckSquare,
  },
  { type: "DROPDOWN", label: "Dropdown", group: "Choice", icon: ChevronDown },
  { type: "YES_NO", label: "Yes / No", group: "Choice", icon: ToggleLeft },
  { type: "RATING", label: "Rating", group: "Scale", icon: Star },
  {
    type: "LINEAR_SCALE",
    label: "Linear scale",
    group: "Scale",
    icon: SlidersHorizontal,
  },
  { type: "FILE_UPLOAD", label: "File upload", group: "Media", icon: FileUp },
  { type: "SIGNATURE", label: "Signature", group: "Media", icon: PenLine },
  { type: "ADDRESS", label: "Address", group: "Media", icon: MapPin },
  {
    type: "MULTIPLE_CHOICE_GRID",
    label: "Multiple choice grid",
    group: "Grid",
    icon: Grid3X3,
  },
  {
    type: "CHECKBOX_GRID",
    label: "Checkbox grid",
    group: "Grid",
    icon: Table,
  },
] as const satisfies ReadonlyArray<{
  type: string;
  label: string;
  group: string;
  icon: LucideIcon;
}>;

export type QuestionTypeId = (typeof QUESTION_TYPES)[number]["type"];

export const ALL_QUESTION_TYPE_IDS = new Set(
  QUESTION_TYPES.map((t) => t.type),
);

export function needsOptions(type: string) {
  return type === "RADIO" || type === "CHECKBOX" || type === "DROPDOWN";
}

export function needsGridSettings(type: string) {
  return type === "MULTIPLE_CHOICE_GRID" || type === "CHECKBOX_GRID";
}

export function defaultSettingsForType(
  type: string,
): Record<string, unknown> | null {
  if (type === "LINEAR_SCALE") {
    return { min: 1, max: 10, minLabel: "Low", maxLabel: "High" };
  }
  if (needsGridSettings(type)) {
    return {
      rows: ["Row 1", "Row 2", "Row 3"],
      columns: ["Column 1", "Column 2", "Column 3"],
    };
  }
  return null;
}

export function inputTypeForQuestion(type: string): string {
  switch (type) {
    case "EMAIL":
      return "email";
    case "PHONE":
      return "tel";
    case "NUMBER":
      return "number";
    case "URL":
      return "url";
    case "DATE":
      return "date";
    case "TIME":
      return "time";
    case "DATETIME":
      return "datetime-local";
    default:
      return "text";
  }
}
