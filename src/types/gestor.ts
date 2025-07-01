export interface Collaborator {
  id: string;
  name: string;
  role: string;
  position: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  managerScore: number | null;
  comiteScore: number | null;
  selfDone: boolean;
  allScores: ScorePerCycle[];
}

export interface Cycle {
  id: string;
  name: string;
  endDate: string;
  reviewDate: string;
}

export type CycleStatus = "aberto" | "emRevisao" | "finalizado";

export interface ScorePerCycle {
  cycleId: string;
  selfScore: number | null;
  leaderScore: number | null;
  finalScore: number | null;
  createdAt: string;
}

export interface RawUser {
  id: string;
  name: string;
  role: string;
  position: { name: string };
  managerId: string;
  scorePerCycle: ScorePerCycle[];
}
