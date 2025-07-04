import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReferenceEvaluationData {
  justification: string;
  filled: boolean;
}

interface ReferenceEvaluationStore {
  selectedReferenceId: string | null;
  response: ReferenceEvaluationData | null;
  setResponse: (data: ReferenceEvaluationData) => void;
  updateJustification: (justification: string) => void;
  updateFilled: (filled: boolean) => void;
  setSelectedReferenceId: (referenceId: string | null) => void;
  clearResponse: () => void;
}

export const useReferenceEvaluationStore = create<ReferenceEvaluationStore>()(
  persist(
    (set) => ({
      selectedReferenceId: null,
      response: null,
      setResponse: (data) => set({ response: { ...data } }),
      updateJustification: (justification) =>
        set((state) => ({
          response: state.response
            ? { ...state.response, justification }
            : { justification, filled: false },
        })),
      updateFilled: (filled) =>
        set((state) => ({
          response: state.response
            ? { ...state.response, filled }
            : { justification: "", filled },
        })),
      setSelectedReferenceId: (referenceId) => {
        set({ selectedReferenceId: referenceId, response: null });
      },
      clearResponse: () => set({ response: null, selectedReferenceId: null }),
    }),
    {
      name: "reference-evaluation-response",
    }
  )
);
