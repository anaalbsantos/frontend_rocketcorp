import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ManagerResponse {
  score: number | null;
  justification: string;
  filled: boolean;
}

type EvaluationsByUser = Record<string, Record<string, ManagerResponse>>;

interface ManagerEvaluationStore {
  evaluations: EvaluationsByUser;
  setResponse: (
    userId: string,
    criterionId: string,
    response: ManagerResponse
  ) => void;
  getResponsesByUser: (userId: string) => Record<string, ManagerResponse>;
  clearResponsesByUser: (userId: string) => void;
}

export const useManagerEvaluationStore = create(
  persist<ManagerEvaluationStore>(
    (set, get) => ({
      evaluations: {},
      setResponse: (userId, criterionId, response) =>
        set((state) => ({
          evaluations: {
            ...state.evaluations,
            [userId]: {
              ...state.evaluations[userId],
              [criterionId]: response,
            },
          },
        })),
      getResponsesByUser: (userId) => get().evaluations[userId] || {},
      clearResponsesByUser: (userId) =>
        set((state) => {
          const newEvaluations = { ...state.evaluations };
          delete newEvaluations[userId];
          return { evaluations: newEvaluations };
        }),
    }),
    {
      name: "manager-evaluation-store",
    }
  )
);
