"use client";

import { create } from "zustand";

type UiState = {
  selectedQuestionId: string | null;
  saveHint: "idle" | "saving" | "saved";
  selectQuestion: (id: string | null) => void;
  setSaveHint: (hint: UiState["saveHint"]) => void;
  pulseSaved: () => void;
};

export const useBuilderUi = create<UiState>((set) => ({
  selectedQuestionId: null,
  saveHint: "idle",
  selectQuestion: (id) => set({ selectedQuestionId: id }),
  setSaveHint: (saveHint) => set({ saveHint }),
  pulseSaved: () => {
    set({ saveHint: "saving" });
    window.setTimeout(() => set({ saveHint: "saved" }), 500);
  },
}));
