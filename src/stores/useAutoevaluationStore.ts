// stores/useEvaluationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AutoevaluationData {
  filled: boolean[];
  scores: (number | null)[];
  justifications: string[];
}

interface AutoevaluationStore {
  responses: AutoevaluationData;
  setResponse: (data: AutoevaluationData) => void;
  updateScore: (index: number, score: number | null) => void;
  updateJustification: (index: number, justification: string) => void;
  updateFilled: (index: number, filled: boolean) => void;
  clearResponses: () => void;
}

export const useAutoevaluationStore = create<AutoevaluationStore>()(
  persist(
    (set) => ({
      responses: {
        filled: [],
        scores: [],
        justifications: [],
      },
      setResponse: (data) =>
        set({
          responses: {
            filled: Array.isArray(data.filled)
              ? data.filled.map((v) => v === true)
              : [],
            scores: Array.isArray(data.scores)
              ? data.scores.map((v) =>
                  typeof v === "number" && !isNaN(v) ? v : null
                )
              : [],
            justifications: Array.isArray(data.justifications)
              ? data.justifications.map((v) => v ?? "")
              : [],
          },
        }),
      updateScore: (index, score) =>
        set((state) => {
          const scores = [...state.responses.scores];
          scores[index] = score;
          return {
            responses: {
              ...state.responses,
              scores,
            },
          };
        }),
      updateJustification: (index, justification) =>
        set((state) => {
          const justifications = [...state.responses.justifications];
          justifications[index] = justification;
          return {
            responses: {
              ...state.responses,
              justifications,
            },
          };
        }),
      updateFilled: (index, filled) =>
        set((state) => {
          const filledArr = [...state.responses.filled];
          filledArr[index] = filled;
          return {
            responses: {
              ...state.responses,
              filled: filledArr,
            },
          };
        }),
      clearResponses: () =>
        set({
          responses: {
            filled: [],
            scores: [],
            justifications: [],
          },
        }),
    }),
    {
      name: "autoevaluation-responses",
    }
  )
);
