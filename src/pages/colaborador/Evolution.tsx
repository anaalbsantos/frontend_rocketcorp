import { useEffect, useState } from "react";
import Chart from "@/components/Chart";
import CycleSummary from "@/components/CycleSummary";
import DashboardStatCard from "@/components/DashboardStatCard";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import type { CycleInfos } from "@/types";
import { useUser } from "@/contexts/UserContext";
import api from "@/api/api";
import Loader from "@/components/Loader";
const Evolution = () => {
  const { userId } = useUser();
  const [evaluations, setEvaluations] = useState<CycleInfos[]>([]);
  const [evaluationsWithFeedback, setEvaluationsWithFeedback] = useState<
    CycleInfos[]
  >([]);
  const [cycleFilter, setCycleFilter] = useState<string>("");
  const [lastCycle, setLastCycle] = useState<CycleInfos | null>(null);
  const [prepreviousCycle, setPrepreviousCycle] = useState<CycleInfos | null>(
    null
  );
  const [growth, setGrowth] = useState<number>(0);
  const [hasComparisonData, setHasComparisonData] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await api.get<CycleInfos[]>(
          `/users/${userId}/evaluationsPerCycle`
        );

        const cycles = response.data.filter(
          (cycle) => cycle.startDate && new Date(cycle.startDate) < new Date()
        );
        setEvaluations(cycles);

        function calculateGrowthSafe(
          previous: number | null,
          current: number | null
        ): number {
          if (
            previous === null ||
            current === null ||
            isNaN(previous) ||
            isNaN(current) ||
            previous === 0
          ) {
            return 0;
          }
          const growth = (current - previous) / previous;
          return Number(growth.toFixed(2));
        }

        if (cycles.length >= 2) {
          let current = cycles.find(
            (e) => e.endDate && new Date(e.endDate) > new Date()
          );

          if (!current) {
            current = cycles[cycles.length - 1];
            const previous = cycles[cycles.length - 2];
            setLastCycle(current);
            setPrepreviousCycle(previous);

            const hasData =
              previous.finalScore !== null && current.finalScore !== null;
            setHasComparisonData(hasData);
            setGrowth(
              hasData
                ? calculateGrowthSafe(previous.finalScore, current.finalScore)
                : 0
            );
            return;
          }

          const previous = cycles[cycles.findIndex((e) => e === current) - 1];
          const preprevious =
            cycles[cycles.findIndex((e) => e === previous) - 1];

          if (!previous || !preprevious) {
            setGrowth(0);
            setHasComparisonData(false);
            return;
          }

          setLastCycle(previous);
          setPrepreviousCycle(preprevious);

          const hasData =
            preprevious.finalScore !== null && previous.finalScore !== null;
          setHasComparisonData(hasData);
          setGrowth(
            hasData
              ? calculateGrowthSafe(preprevious.finalScore, previous.finalScore)
              : 0
          );
        } else {
          setLastCycle(cycles[0]);
          setPrepreviousCycle(cycles[0]);
          setGrowth(0);
          setHasComparisonData(false);
        }
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    };
    fetchEvaluations();
  }, [userId]);

  useEffect(() => {
    const fetchGenaiInsights = async () => {
      try {
        if (!evaluations || evaluations.length === 0) return;
        // Para cada ciclo, buscar o summary e atualizar feedback
        const updated = await Promise.all(
          evaluations.map(async (cycle) => {
            try {
              const { data } = await api.get(
                `/genai/colaborador/${userId}/cycle/${cycle.cycleId}`
              );
              console.log(cycle.cycleId, data.summary);
              return { ...cycle, feedback: data.summary };
            } catch {
              return { ...cycle };
            }
          })
        );
        setEvaluationsWithFeedback(updated);
      } catch {
        console.error("Erro ao buscar insights GenAI");
      } finally {
        setIsLoading(false);
      }
    };

    if (evaluations && evaluations.length > 0) fetchGenaiInsights();
  }, [evaluations, userId]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="bg-white flex flex-col justify-between border-b border-gray-200 shadow-sm">
        <div className="py-8 flex items-center justify-between px-8">
          <h1 className="text-2xl font-normal text-gray-800">Evolução</h1>
        </div>
      </div>
      <div className="flex flex-col p-6 gap-6">
        <div className="grid grid-cols-1 xl1300:grid-cols-3 gap-4 mb-6">
          <DashboardStatCard
            type="currentScore"
            title="Nota atual"
            description={`Nota final do ciclo realizado em ${lastCycle?.name}`}
            value={lastCycle?.finalScore || 0}
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            type="growth"
            title="Crescimento"
            description={
              hasComparisonData
                ? `Em comparação ao ciclo de ${prepreviousCycle?.name}`
                : "Não disponível por falta de nota final nos ciclos anteriores"
            }
            value={hasComparisonData ? growth : "-"}
          />
          <DashboardStatCard
            type="evaluations"
            title="Avaliações Realizadas"
            description="Total de avaliações"
            value={
              evaluationsWithFeedback.filter((e) => e.finalScore !== null)
                .length
            }
          />
        </div>
        <div className="bg-white rounded-lg p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between mb-4">
            <p className="font-bold">Desempenho</p>
            <Select value={cycleFilter} onValueChange={setCycleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Últimos 10 ciclos</SelectItem>
                <SelectItem value="5">Últimos 5 ciclos</SelectItem>
                <SelectItem value="3">Últimos 3 ciclos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Chart
            chartData={(() => {
              // filtra ciclos com nota final
              let finished = evaluationsWithFeedback.filter(
                (e) => e.finalScore !== null
              );

              if (["10", "5", "3"].includes(cycleFilter)) {
                finished = finished.slice(0, Number(cycleFilter));
              }
              return finished.map((e) => ({
                semester: e.name,
                score: e.finalScore || 0,
              }));
            })()}
            height="h-[200px]"
            barSize={45}
          />
        </div>
        <div className="bg-white rounded-lg p-5 flex flex-col gap-3">
          <p className="font-bold leading-9">Ciclos de Avaliação</p>
          {[...evaluationsWithFeedback]
            .sort((a, b) => (a.name > b.name ? -1 : 1))
            .map((cycle, index) => (
              <CycleSummary
                key={index}
                semester={cycle.name}
                status={
                  cycle.endDate && new Date(cycle.endDate) < new Date()
                    ? "Finalizado"
                    : "Em andamento"
                }
                finalScore={cycle.finalScore}
                autoevaluationScore={cycle.selfScore}
                evaluation360Score={
                  cycle.peerScores && cycle.peerScores.length > 0
                    ? Number(
                        (
                          cycle.peerScores.reduce((a, b) => a + b, 0) /
                          cycle.peerScores.length
                        ).toFixed(1)
                      )
                    : undefined
                }
                evaluationLeaderScore={cycle.leaderScore}
                summary={cycle.feedback}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
export default Evolution;
