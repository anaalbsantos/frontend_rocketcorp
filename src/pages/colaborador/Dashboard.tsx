import Avatar from "@/components/Avatar";
import CycleStatusCard from "@/components/CycleStatusCard";
import CycleEvaluation from "@/components/CycleEvaluation";
import Chart from "@/components/Chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { CycleInfos } from "@/types";
import api from "@/api/api";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const ColaboradorDashboard = () => {
  const [evaluations, setEvaluations] = useState<CycleInfos[]>([]);
  const [evaluationsWithFeedback, setEvaluationsWithFeedback] = useState<
    CycleInfos[]
  >([]);
  const [lastCycle, setLastCycle] = useState<CycleInfos>();
  // const [isLoading, setIsLoading] = useState(true);
  const [cycleFilter, setCycleFilter] = useState<string>("");

  const navigate = useNavigate();
  const { userId, userName } = useUser();

  const daysLeft = (reviewDate: string) => {
    const end = new Date(reviewDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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

        setEvaluations(cycles.sort((a, b) => (a.name > b.name ? -1 : 1)));
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    };
    fetchEvaluations();
  }, [userId, lastCycle]);

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
      }
    };

    if (evaluations && evaluations.length > 0) fetchGenaiInsights();
  }, [evaluations, userId]);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const response = await api.get(`/score-cycle`);

        setLastCycle(response.data);
      } catch (error) {
        console.error("Erro ao buscar o ciclo:", error);
      }
    };
    fetchCycle();
  }, []);

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="text-xl text-text-primary">
          <span className="font-bold">Olá,</span>{" "}
          {userName.split(" ")[0] || "Colaborador"}!
        </h1>
        <Avatar name={userName} />
      </div>
      <div className="flex flex-col gap-4">
        <CycleStatusCard
          ciclo={{
            nome: `${lastCycle?.name || "atual"}`,
            status: `${
              new Date(lastCycle?.endDate || "") < new Date()
                ? "finalizado"
                : new Date(lastCycle?.reviewDate || "") < new Date()
                ? "emRevisao"
                : "aberto"
            }`,
            diasRestantes: daysLeft(lastCycle?.reviewDate || ""),
          }}
          onClick={() => navigate("/app/avaliacao")}
        />
        <div className="flex flex-row gap-5 h-[400px] 2xl:h-[450px]">
          <div className="flex-1 bg-white p-5 rounded-lg h-inherit flex flex-col gap-3">
            <div className="flex flex-row justify-between items-end">
              <p className="font-bold">Suas avaliações</p>
              <Link
                className="font-bold text-xs text-brand hover:text-brand/80"
                to="/app/evolucao"
              >
                Ver mais
              </Link>
            </div>
            <div className="flex flex-col gap-2 max-h-full overflow-y-scroll scrollbar">
              {[...evaluationsWithFeedback]
                .sort((a, b) => (a.name > b.name ? -1 : 1))
                .map((evaluation) => (
                  <CycleEvaluation
                    key={evaluation.cycleId}
                    finalScore={evaluation.finalScore || 0}
                    name={evaluation.name}
                    feedback={evaluation.feedback || "-"}
                    status={
                      evaluation.endDate &&
                      new Date(evaluation.endDate) < new Date()
                        ? "Finalizado"
                        : "Em andamento"
                    }
                  />
                ))}
            </div>
          </div>
          <div className="flex-2 bg-white p-5 rounded-lg flex flex-col justify-between gap-3">
            <div className="flex flex-row justify-between items-center">
              <p className="font-bold">Desempenho</p>
              <Select value={cycleFilter} onValueChange={setCycleFilter}>
                <SelectTrigger className="w-[150px] xl:w-[180px] focus:border-transparent">
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
                let finished = evaluations.filter((e) => e.finalScore !== null);
                if (["10", "5", "3"].includes(cycleFilter)) {
                  finished = finished.slice(0, Number(cycleFilter));
                }
                return finished.map((evaluation) => ({
                  semester: evaluation.name,
                  score: evaluation.finalScore || 0,
                }));
              })()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColaboradorDashboard;
