// stores/useEvaluationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AutoevaluationCriterionData {
  filled: boolean;
  score: number | null;
  justification: string;
}

interface AutoevaluationStore {
  responses: Record<string, AutoevaluationCriterionData>;
  setResponse: (criterionId: string, data: AutoevaluationCriterionData) => void;
  updateScore: (criterionId: string, score: number | null) => void;
  updateJustification: (criterionId: string, justification: string) => void;
  updateFilled: (criterionId: string, filled: boolean) => void;
  clearResponses: () => void;
  getAllFilled: (requiredCount: number) => boolean;
}

export const useAutoevaluationStore = create<AutoevaluationStore>()(
  persist(
    (set, get) => ({
      responses: {},
      setResponse: (criterionId, data) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [criterionId]: data,
          },
        })),
      updateScore: (criterionId, score) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [criterionId]: {
              ...state.responses[criterionId],
              score: score,
            },
          },
        })),
      updateJustification: (criterionId, justification) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [criterionId]: {
              ...state.responses[criterionId],
              justification: justification,
            },
          },
        })),
      updateFilled: (criterionId, filled) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [criterionId]: {
              ...state.responses[criterionId],
              filled: filled,
            },
          },
        })),
      clearResponses: () =>
        set({
          responses: {},
        }),
      getAllFilled: (requiredCount: number) => {
        const state = get();
        const filled = Object.values(state.responses).map(
          (response) => response.filled
        );
        console.log("Filled responses:", filled);
        return filled.every(Boolean) && filled.length >= requiredCount;
      },
    }),
    {
      name: "autoevaluation-responses",
    }
  )
);
