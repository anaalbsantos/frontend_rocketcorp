// stores/useEvaluationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TopicData {
  filled: boolean[];
  scores: (number | null)[];
  justifications: string[];
}

interface AutoevaluationStore {
  responses: Record<string, TopicData>;
  setResponse: (topic: string, data: TopicData) => void;
  updateScore: (topic: string, index: number, score: number | null) => void;
  updateJustification: (
    topic: string,
    index: number,
    justification: string
  ) => void;
  updateFilled: (topic: string, index: number, filled: boolean) => void;
  clearResponses: () => void;
}

export const useAutoevaluationStore = create<AutoevaluationStore>()(
  persist(
    (set) => ({
      responses: {},
      setResponse: (topic, data) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [topic]: {
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
          },
        })),
      updateScore: (topic, index, score) =>
        set((state) => {
          const current = state.responses[topic] ?? {
            filled: [],
            scores: [],
            justifications: [],
          };
          const scores = [...current.scores];
          scores[index] = score;
          return {
            responses: {
              ...state.responses,
              [topic]: { ...current, scores },
            },
          };
        }),
      updateJustification: (topic, index, justification) =>
        set((state) => {
          const current = state.responses[topic] ?? {
            filled: [],
            scores: [],
            justifications: [],
          };
          const justifications = [...current.justifications];
          justifications[index] = justification;
          return {
            responses: {
              ...state.responses,
              [topic]: { ...current, justifications },
            },
          };
        }),
      updateFilled: (topic, index, filled) =>
        set((state) => {
          const current = state.responses[topic] ?? {
            filled: [],
            scores: [],
            justifications: [],
          };
          const filledArr = [...current.filled];
          filledArr[index] = filled;
          return {
            responses: {
              ...state.responses,
              [topic]: { ...current, filled: filledArr },
            },
          };
        }),
      clearResponses: () => set({ responses: {} }),
    }),
    {
      name: "autoevaluation-responses",
    }
  )
);
