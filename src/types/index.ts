export interface Evaluation {
  score: number | null;
  semester: string;
  summary: string;
  status: string;
}

export interface EvaluationCriteria {
  id: string;
  title: string;
}

export interface CycleInfos {
  cycleId?: string;
  name: string;
  startDate?: string;
  reviewDate?: string;
  endDate?: string;
  feedback: string;
  finalScore: number;
  selfScore?: number;
  leaderScore?: number;
  peerScores?: number[];
}

export type Role = "colaborador" | "gestor" | "rh" | "comite";
export interface GoalAction {
  id: string;
  description: string;
  deadline: string;
  completed: boolean;
}

export interface GoalData {
  id: string;
  title: string;
  description: string;
  actions: GoalAction[];
}
