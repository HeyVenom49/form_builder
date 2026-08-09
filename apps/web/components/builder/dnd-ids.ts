export const PALETTE_PREFIX = "palette:";
export const GAP_PREFIX = "gap:";

export function paletteDragId(type: string) {
  return `${PALETTE_PREFIX}${type}`;
}

export function isPaletteDragId(id: string | number) {
  return String(id).startsWith(PALETTE_PREFIX);
}

export function typeFromPaletteDragId(id: string | number) {
  return String(id).slice(PALETTE_PREFIX.length);
}

export function gapDragId(index: number) {
  return `${GAP_PREFIX}${index}`;
}

export function isGapDragId(id: string | number) {
  return String(id).startsWith(GAP_PREFIX);
}

export function indexFromGapDragId(id: string | number) {
  const n = Number(String(id).slice(GAP_PREFIX.length));
  return Number.isFinite(n) ? n : -1;
}

export type PaletteDragData = {
  source: "palette";
  type: string;
  label: string;
};

/** Resolve insert/reorder index from a drop target (gap or question id). */
export function resolveDropIndex(
  overId: string,
  activeId: string,
  questionIds: string[],
): number | null {
  if (isGapDragId(overId)) {
    return indexFromGapDragId(overId);
  }
  const overQuestionIndex = questionIds.indexOf(overId);
  if (overQuestionIndex >= 0) {
    const activeIndex = questionIds.indexOf(activeId);
    if (activeIndex >= 0 && activeIndex < overQuestionIndex) {
      return overQuestionIndex;
    }
    return overQuestionIndex;
  }
  return null;
}
