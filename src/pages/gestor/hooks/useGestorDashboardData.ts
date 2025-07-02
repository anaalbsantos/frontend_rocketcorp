import { useEffect, useState } from "react";
import api from "@/api/api";
import { useUser } from "@/contexts/UserContext";
import { getCycleStatus } from "@/utils/getCycleStatus";
import { calcularGrowth } from "@/utils/growthUtil";
import type {
  Collaborator,
  Cycle,
  CycleStatus,
  RawUser,
  ScorePerCycle,
} from "@/types/gestor";

export const useGestorDashboardData = () => {
  const { userId } = useUser();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [hasGrowthData, setHasGrowthData] = useState<boolean>(false);
  const [growthBaseCount, setGrowthBaseCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{
          ciclo_atual_ou_ultimo: Cycle | Cycle[];
          usuarios: RawUser[];
        }>(`/users/${userId}/subordinates`);

        const { ciclo_atual_ou_ultimo, usuarios } = res.data;
        const ultimoCiclo = Array.isArray(ciclo_atual_ou_ultimo)
          ? ciclo_atual_ou_ultimo.sort(
              (a, b) =>
                new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
            )[0]
          : ciclo_atual_ou_ultimo;

        const status = getCycleStatus(ultimoCiclo);
        const filtered = usuarios.filter(
          (u) => u.managerId === userId && u.role === "COLABORADOR"
        );

        const enriched = filtered.map((u) => {
          const score: Partial<ScorePerCycle> =
            u.scorePerCycle.find((s) => s.cycleId === ultimoCiclo.id) || {};

          const selfDone = score.selfScore !== null;
          const managerDone = score.leaderScore !== null;

          let statusText: "Pendente" | "Finalizada" = "Pendente";
          if (status === "aberto" && selfDone) statusText = "Finalizada";
          else if (status === "emRevisao" && managerDone)
            statusText = "Finalizada";
          else if (status === "finalizado" && selfDone && managerDone)
            statusText = "Finalizada";

          return {
            id: u.id,
            name: u.name,
            role: u.role,
            position: u.position.name,
            autoAssessment: score.selfScore ?? null,
            managerScore: score.leaderScore ?? null,
            comiteScore: score.finalScore ?? null,
            status: statusText,
            allScores: u.scorePerCycle,
            selfDone,
          };
        });

        const { growth, hasGrowthData, growthBaseCount } = calcularGrowth(
          enriched,
          ultimoCiclo.id
        );
        setGrowth(growth);
        setHasGrowthData(hasGrowthData);
        setGrowthBaseCount(growthBaseCount);

        const scoreList =
          status === "finalizado"
            ? enriched
                .map((c) => c.comiteScore)
                .filter((v): v is number => v !== null)
            : enriched
                .map((c) => c.managerScore)
                .filter((v): v is number => v !== null);

        const average = scoreList.length
          ? scoreList.reduce((a, b) => a + b, 0) / scoreList.length
          : 0;

        setCurrentScore(Number(average.toFixed(1)));
        setCollaborators(enriched);
        setCycle(ultimoCiclo);
        setCycleStatus(status);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard do gestor", err);
      }
    };

    fetchData();
  }, [userId]);

  return {
    collaborators,
    cycle,
    cycleStatus,
    currentScore,
    growth,
    hasGrowthData,
    growthBaseCount,
  };
};
