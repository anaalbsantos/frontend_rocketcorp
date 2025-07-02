import type { Cycle, CycleStatus } from "../types/gestor";

export const getCycleStatus = (cycle: Cycle): CycleStatus => {
  const now = new Date();
  const end = new Date(cycle.endDate);
  const review = new Date(cycle.reviewDate);

  if (now < review) return "aberto";
  if (now >= review && now < end) return "emRevisao";
  return "finalizado";
};
