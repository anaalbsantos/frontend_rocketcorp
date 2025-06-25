export interface Evaluation {
  score: number;
  semester: string;
  summary: string;
  status: string;
}

export interface EvaluationCriteria {
  id: string;
  title: string;
}

export interface CycleInfos {
  cycleId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  feedback: null;
  finalScore: null;
  selfScore: null;
  leaderScore: null;
  peerScores: number[];
}
