// stores/useEvaluationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CriterionData {
  filled: boolean[];
  scores: (number | null)[];
  justifications: string[];
}

interface AutoevaluationData {
  COMPORTAMENTO: CriterionData;
  EXECUCAO: CriterionData;
}

interface AutoevaluationStore {
  responses: AutoevaluationData;
  setResponse: (
    topic: "COMPORTAMENTO" | "EXECUCAO",
    data: CriterionData
  ) => void;
  updateScore: (
    topic: "COMPORTAMENTO" | "EXECUCAO",
    index: number,
    score: number | null
  ) => void;
  updateJustification: (
    topic: "COMPORTAMENTO" | "EXECUCAO",
    index: number,
    justification: string
  ) => void;
  updateFilled: (
    topic: "COMPORTAMENTO" | "EXECUCAO",
    index: number,
    filled: boolean
  ) => void;
  clearResponses: () => void;
  getAllFilled: (comportamentoCount: number, execucaoCount: number) => boolean;
}

export const useAutoevaluationStore = create<AutoevaluationStore>()(
  persist(
    (set, get) => ({
      responses: {
        COMPORTAMENTO: {
          filled: [],
          scores: [],
          justifications: [],
        },
        EXECUCAO: {
          filled: [],
          scores: [],
          justifications: [],
        },
      },
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
          const scores = [...state.responses[topic].scores];
          scores[index] = score;
          return {
            responses: {
              ...state.responses,
              [topic]: {
                ...state.responses[topic],
                scores,
              },
            },
          };
        }),
      updateJustification: (topic, index, justification) =>
        set((state) => {
          const justifications = [...state.responses[topic].justifications];
          justifications[index] = justification;
          return {
            responses: {
              ...state.responses,
              [topic]: {
                ...state.responses[topic],
                justifications,
              },
            },
          };
        }),
      updateFilled: (topic, index, filled) =>
        set((state) => {
          const filledArr = [...state.responses[topic].filled];
          filledArr[index] = filled;
          return {
            responses: {
              ...state.responses,
              [topic]: {
                ...state.responses[topic],
                filled: filledArr,
              },
            },
          };
        }),
      clearResponses: () =>
        set({
          responses: {
            COMPORTAMENTO: {
              filled: [],
              scores: [],
              justifications: [],
            },
            EXECUCAO: {
              filled: [],
              scores: [],
              justifications: [],
            },
          },
        }),
      getAllFilled: (comportamentoCount: number, execucaoCount: number) => {
        const state = get();
        const comportamentoFilled =
          (state.responses?.COMPORTAMENTO?.filled?.length ===
            comportamentoCount &&
            state.responses?.COMPORTAMENTO?.filled?.every(Boolean)) ??
          false;
        const execucaoFilled =
          (state.responses?.EXECUCAO?.filled?.length === execucaoCount &&
            state.responses?.EXECUCAO?.filled?.every(Boolean)) ??
          false;
        return comportamentoFilled && execucaoFilled;
      },
    }),
    {
      name: "autoevaluation-responses",
    }
  )
);
