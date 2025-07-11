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
const Evolution = () => {
  const { userId } = useUser();
  const [evaluations, setEvaluations] = useState<CycleInfos[]>([]);
  const [cycleFilter, setCycleFilter] = useState<string>("");
  const [lastCycle, setLastCycle] = useState<CycleInfos | null>(null);
  const [prepreviousCycle, setPrepreviousCycle] = useState<CycleInfos | null>(
    null
  );
  const [growth, setGrowth] = useState<number>(0);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await api.get<CycleInfos[]>(
          `/users/${userId}/evaluationsPerCycle`
        );

        // filtra os ciclos que já começaram
        const cycles = response.data.filter(
          (cycle) => cycle.startDate && new Date(cycle.startDate) < new Date()
        );

        if (cycles.length >= 2) {
          // procura o 'primeiro' ciclo que ainda não terminou
          let current = cycles.find(
            (e) => e.endDate && new Date(e.endDate) > new Date()
          );

          // se não houver nenhum ciclo em andamento, usa o último ciclo
          // crescimento será do previous para o current
          if (!current) {
            current = cycles[cycles.length - 1];
            const previous = cycles[cycles.length - 2];
            setLastCycle(current);
            setPrepreviousCycle(previous);
            setGrowth(
              Number(
                (
                  (current?.finalScore - previous.finalScore) /
                  previous.finalScore
                ).toFixed(1)
              )
            );
            return;
          }

          // se houver ciclo em andamento (sem nota final)
          // crescimento será do preprevious para o previous
          const previous = cycles[cycles.findIndex((e) => e === current) - 1];
          const preprevious =
            cycles[cycles.findIndex((e) => e === previous) - 1];
          if (!previous || !preprevious) {
            setGrowth(0);
            return;
          }

          setLastCycle(previous);
          setPrepreviousCycle(preprevious);
          setGrowth(
            Number(
              (
                (previous?.finalScore - preprevious.finalScore) /
                preprevious.finalScore
              ).toFixed(1)
            )
          );
        } else {
          setLastCycle(cycles[0]);
          setPrepreviousCycle(cycles[0]);
          setGrowth(0);
        }

        setEvaluations(cycles);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    };
    fetchEvaluations();
  }, [userId]);

  return (
    <div>
      <div className="bg-white flex flex-col justify-between border-b border-gray-200 shadow-sm">
        <div className="flex justify-between p-6">
          <h3 className="font-bold">Evolução</h3>
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
            description={`Em comparação ao ciclo de ${prepreviousCycle?.name}`}
            value={growth}
          />
          <DashboardStatCard
            type="evaluations"
            title="Avaliações Realizadas"
            description="Total de avaliações"
            value={evaluations.filter((e) => e.finalScore !== null).length}
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
              let finished = evaluations.filter((e) => e.finalScore !== null);

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
          {[...evaluations]
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
