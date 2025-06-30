import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReferenceEvaluationData {
  score: number | null;
  justification: string;
  filled: boolean;
}

interface ReferenceEvaluationStore {
  responses: Record<string, ReferenceEvaluationData>;
  selectedReferenceId: string | null;
  setResponse: (referenceId: string, data: ReferenceEvaluationData) => void;
  updateScore: (referenceId: string, score: number | null) => void;
  updateJustification: (referenceId: string, justification: string) => void;
  updateFilled: (referenceId: string, filled: boolean) => void;
  setSelectedReferenceId: (referenceId: string | null) => void;
  clearResponses: () => void;
}

export const useReferenceEvaluationStore = create<ReferenceEvaluationStore>()(
  persist(
    (set) => ({
      responses: {},
      selectedReferenceId: null,
      setResponse: (referenceId, data) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [referenceId]: {
              score:
                typeof data.score === "number" && !isNaN(data.score)
                  ? data.score
                  : null,
              justification: data.justification ?? "",
              filled: !!data.filled,
            },
          },
        })),
      updateScore: (referenceId, score) =>
        set((state) => {
          const current = state.responses[referenceId] ?? {
            score: null,
            justification: "",
            filled: false,
          };
          return {
            responses: {
              ...state.responses,
              [referenceId]: { ...current, score },
            },
          };
        }),
      updateJustification: (referenceId, justification) =>
        set((state) => {
          const current = state.responses[referenceId] ?? {
            score: null,
            justification: "",
            filled: false,
          };
          return {
            responses: {
              ...state.responses,
              [referenceId]: { ...current, justification },
            },
          };
        }),
      updateFilled: (referenceId, filled) =>
        set((state) => {
          const current = state.responses[referenceId] ?? {
            score: null,
            justification: "",
            filled: false,
          };
          return {
            responses: {
              ...state.responses,
              [referenceId]: { ...current, filled },
            },
          };
        }),
      setSelectedReferenceId: (referenceId) =>
        set({ selectedReferenceId: referenceId }),
      clearResponses: () => set({ responses: {}, selectedReferenceId: null }),
    }),
    {
      name: "reference-evaluation-responses",
    }
  )
);
