import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Evaluation360Justifications {
  positive: string;
  negative: string;
}

interface Evaluation360TopicData {
  filled: boolean;
  score: number | null;
  justifications: Evaluation360Justifications;
}

interface Evaluation360Store {
  responses: Record<string, Evaluation360TopicData>;
  setResponse: (colabId: string, data: Evaluation360TopicData) => void;
  updateScore: (colabId: string, score: number | null) => void;
  updateJustification: (
    colabId: string,
    type: "positive" | "negative",
    justification: string
  ) => void;
  updateFilled: (colabId: string, filled: boolean) => void;
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
              filled: !!data.filled,
              score:
                typeof data.score === "number" && !isNaN(data.score)
                  ? data.score
                  : null,
              justifications: {
                positive: data.justifications?.positive ?? "",
                negative: data.justifications?.negative ?? "",
              },
            },
          },
        })),
      updateScore: (colabId, score) =>
        set((state) => {
          const current = state.responses[colabId] ?? {
            filled: false,
            score: null,
            justifications: { positive: "", negative: "" },
          };
          return {
            responses: {
              ...state.responses,
              [colabId]: { ...current, score },
            },
          };
        }),
      updateJustification: (colabId, type, justification) =>
        set((state) => {
          if (type !== "positive" && type !== "negative") return {};
          const current = state.responses[colabId] ?? {
            filled: false,
            score: null,
            justifications: { positive: "", negative: "" },
          };
          return {
            responses: {
              ...state.responses,
              [colabId]: {
                ...current,
                justifications: {
                  ...current.justifications,
                  [type]: justification,
                },
              },
            },
          };
        }),
      updateFilled: (colabId, filled) =>
        set((state) => {
          const current = state.responses[colabId] ?? {
            filled: false,
            score: null,
            justifications: { positive: "", negative: "" },
          };
          return {
            responses: {
              ...state.responses,
              [colabId]: { ...current, filled },
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
