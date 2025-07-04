import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MentorEvaluationData {
  score: number | null;
  justification: string;
  filled: boolean;
}

interface MentorEvaluationStore {
  responses: Record<string, MentorEvaluationData>;
  setResponse: (mentorId: string, data: MentorEvaluationData) => void;
  updateScore: (mentorId: string, score: number | null) => void;
  updateJustification: (mentorId: string, justification: string) => void;
  updateFilled: (mentorId: string, filled: boolean) => void;
  clearResponses: () => void;
}

export const useMentorEvaluationStore = create<MentorEvaluationStore>()(
  persist(
    (set) => ({
      responses: {},
      setResponse: (mentorId, data) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [mentorId]: {
              score:
                typeof data.score === "number" && !isNaN(data.score)
                  ? data.score
                  : null,
              justification: data.justification ?? "",
              filled: !!data.filled,
            },
          },
        })),
      updateScore: (mentorId, score) =>
        set((state) => {
          const current = state.responses[mentorId] ?? {
            score: null,
            justification: "",
            filled: false,
          };
          return {
            responses: {
              ...state.responses,
              [mentorId]: { ...current, score },
            },
          };
        }),
      updateJustification: (mentorId, justification) =>
        set((state) => {
          const current = state.responses[mentorId] ?? {
            score: null,
            justification: "",
            filled: false,
          };
          return {
            responses: {
              ...state.responses,
              [mentorId]: { ...current, justification },
            },
          };
        }),
      updateFilled: (mentorId, filled) =>
        set((state) => {
          const current = state.responses[mentorId] ?? {
            score: null,
            justification: "",
            filled: false,
          };
          return {
            responses: {
              ...state.responses,
              [mentorId]: { ...current, filled },
            },
          };
        }),
      clearResponses: () => set({ responses: {} }),
    }),
    {
      name: "mentor-evaluation-responses",
    }
  )
);
