import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Evaluation360TopicData {
  filled: boolean[];
  scores: (number | null)[];
  justifications: string[];
}

interface Evaluation360Store {
  responses: Record<string, Evaluation360TopicData>;
  setResponse: (colabId: string, data: Evaluation360TopicData) => void;
  updateScore: (colabId: string, index: number, score: number | null) => void;
  updateJustification: (
    colabId: string,
    index: number,
    justification: string
  ) => void;
  updateFilled: (colabId: string, index: number, filled: boolean) => void;
  clearResponses: () => void;
}

export const useEvaluation360Store = create<Evaluation360Store>()(
  persist(
    (set) => ({
      responses: {},
      setResponse: (colabId, data) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [colabId]: {
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
      updateScore: (colabId, index, score) =>
        set((state) => {
          const current = state.responses[colabId] ?? {
            filled: [],
            scores: [],
            justifications: [],
          };
          const scores = [...current.scores];
          scores[index] = score;
          return {
            responses: {
              ...state.responses,
              [colabId]: { ...current, scores },
            },
          };
        }),
      updateJustification: (colabId, index, justification) =>
        set((state) => {
          const current = state.responses[colabId] ?? {
            filled: [],
            scores: [],
            justifications: [],
          };
          const justifications = [...current.justifications];
          justifications[index] = justification;
          return {
            responses: {
              ...state.responses,
              [colabId]: { ...current, justifications },
            },
          };
        }),
      updateFilled: (colabId, index, filled) =>
        set((state) => {
          const current = state.responses[colabId] ?? {
            filled: [],
            scores: [],
            justifications: [],
          };
          const filledArr = [...current.filled];
          filledArr[index] = filled;
          return {
            responses: {
              ...state.responses,
              [colabId]: { ...current, filled: filledArr },
            },
          };
        }),
      clearResponses: () => set({ responses: {} }),
    }),
    {
      name: "360-evaluation-responses",
    }
  )
);
