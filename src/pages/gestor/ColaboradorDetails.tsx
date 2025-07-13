import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Star, FilePen } from "lucide-react";
import api from "@/api/api";
import Avatar from "@/components/Avatar";
import TabsContent from "@/components/TabContent";
import DashboardStatCard from "@/components/DashboardStatCard";
import Chart from "@/components/Chart";
import CycleSummary from "@/components/CycleSummary";
import ManagerEvaluationTab from "@/components/evaluation/ManagerEvaluationTab";
import GoalCard from "@/components/GoalCard";
import type { GoalData } from "@/types";

interface EvaluationPerCycle {
  cycleId: string;
  name: string;
  startDate: string;
  reviewDate: string;
  endDate: string;
  selfScore: number | null;
  leaderScore: number | null;
  finalScore: number | null;
  feedback: string | null;
  peerScores: number[];
}

interface ColaboradorInfo {
  name: string;
  position?: {
    name: string;
  };
}

const getEvaluationCycleStatus = (
  cycle: EvaluationPerCycle | { reviewDate: string; endDate: string }
): "aberto" | "emRevisao" | "finalizado" => {
  const now = new Date();
  const reviewDate = new Date(cycle.reviewDate);
  const endDate = new Date(cycle.endDate);
  if (now < reviewDate) return "aberto";
  if (now < endDate) return "emRevisao";
  return "finalizado";
};

const calculateGrowth = (latest: number, previous: number): number => {
  return Number(((latest - previous) / previous).toFixed(1));
};

const getAverage = (scores: number[]): number | undefined => {
  if (!scores.length) return undefined;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Number(avg.toFixed(1));
};

const ColaboradorDetails = () => {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(true);
  const { id: userId } = useParams();
  const [evaluations, setEvaluations] = useState<EvaluationPerCycle[]>([]);
  const [colaboradorInfo, setColaboradorInfo] =
    useState<ColaboradorInfo | null>(null);
  const [activeTab, setActiveTab] = useState("Histórico");
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [track, setTrack] = useState<string>("");

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setColaboradorInfo(res.data);
      } finally {
        setIsLoadingUser(false);
      }
    };

    const fetchEvaluations = async () => {
      try {
        const res = await api.get(`/users/${userId}/evaluationsPerCycle`);
        setEvaluations(res.data);
      } finally {
        setIsLoadingEvaluations(false);
      }
    };

    const fetchGoals = async () => {
      try {
        const res = await api.get(`/goal/${userId}`);
        setGoals(res.data);
      } catch {
        console.error("Erro ao buscar objetivos");
      }
    };

    const fetchTrack = async () => {
      try {
        const res = await api.get(`/users/${userId}/track`);
        setTrack(res.data.position.track);
      } catch (error) {
        console.error("Erro ao buscar track do usuário", error);
        return "DESENVOLVIMENTO";
      }
    };

    if (userId) {
      fetchUserInfo();
      fetchEvaluations();
      fetchGoals();
      fetchTrack();
    }
  }, [userId]);

  const sortedEvaluations = useMemo(() => {
    return [...evaluations]
      .filter((e) => new Date(e.startDate) <= now)
      .sort(
        (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      );
  }, [evaluations, now]);

  const currentCycle =
    sortedEvaluations.find(
      (c) => getEvaluationCycleStatus(c) === "emRevisao"
    ) ?? null;

  const cycleStatus = currentCycle
    ? getEvaluationCycleStatus(currentCycle)
    : null;

  const finishedCycles = useMemo(
    () => sortedEvaluations.filter((e) => e.finalScore !== null),
    [sortedEvaluations]
  );

  const lastCycle = finishedCycles[finishedCycles.length - 1] ?? null;
  const prepreviousCycle =
    finishedCycles.length >= 2
      ? finishedCycles[finishedCycles.length - 2]
      : null;

  const growth =
    lastCycle &&
    prepreviousCycle &&
    lastCycle.finalScore &&
    prepreviousCycle.finalScore
      ? calculateGrowth(lastCycle.finalScore, prepreviousCycle.finalScore)
      : 0;

  const TABS = ["Avaliação", "Histórico", "Objetivos"];

  const contentByTab: Record<string, React.ReactElement> = {
    Avaliação: currentCycle ? (
      <ManagerEvaluationTab
        userId={userId!}
        cycle={currentCycle}
        alreadyEvaluated={currentCycle.leaderScore !== null}
      />
    ) : (
      <div className="p-6 text-sm text-gray-500">
        Ciclo não disponível para avaliação.
      </div>
    ),
    Histórico: (
      <div className="flex flex-col px-6 pt-2 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <DashboardStatCard
            type="currentScore"
            title="Nota atual"
            description={`Nota final do ciclo realizado em ${
              lastCycle?.name ?? "-"
            }`}
            value={lastCycle?.finalScore ?? "-"}
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            type="growth"
            title="Crescimento"
            description={
              prepreviousCycle?.name
                ? `Comparado ao ciclo ${prepreviousCycle.name}`
                : "Sem ciclo anterior para comparação"
            }
            value={growth}
          />
          <DashboardStatCard
            type="evaluations"
            title="Avaliações Realizadas"
            description="Total de ciclos finalizados"
            value={finishedCycles.length}
            icon={<FilePen className="w-10 h-10" />}
          />
        </div>
        <div className="bg-white rounded-lg p-5">
          <p className="font-bold mb-2">Desempenho</p>
          <Chart
            chartData={finishedCycles.map((e) => ({
              semester: e.name,
              score: e.finalScore ?? 0,
            }))}
            height="h-[200px]"
            barSize={50}
          />
        </div>
        <div className="bg-white rounded-lg p-5 flex flex-col gap-3">
          <p className="font-bold leading-9">Ciclos de Avaliação</p>
          {[...sortedEvaluations].reverse().map((ciclo, i) => (
            <CycleSummary
              key={i}
              semester={ciclo.name}
              status={
                getEvaluationCycleStatus(ciclo) === "finalizado"
                  ? "Finalizado"
                  : "Em andamento"
              }
              finalScore={ciclo.finalScore ?? undefined}
              autoevaluationScore={ciclo.selfScore ?? undefined}
              evaluation360Score={getAverage(ciclo.peerScores)}
              evaluationLeaderScore={ciclo.leaderScore ?? undefined}
              summary={ciclo.feedback ?? "-"}
            />
          ))}
        </div>
      </div>
    ),
    Objetivos: (
      <div className="flex flex-col px-6 py-2 gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">
            Acompanhamento {track === "FINANCEIRO" ? "de OKRs" : "do PDI"}
          </h3>
        </div>
        {goals.map((g) => (
          <GoalCard
            id={g.id}
            title={g.title}
            description={g.description}
            actions={g.actions || []}
            track={track}
            viewOnly
          />
        ))}
      </div>
    ),
  };
  if (isLoadingUser || isLoadingEvaluations) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-4 px-6 py-4">
          <Avatar name={colaboradorInfo?.name ?? "Carregando..."} />
          <div>
            <h2 className="font-bold text-xl text-gray-800">
              {colaboradorInfo?.name}
            </h2>
            <p className="text-sm text-gray-500">
              {colaboradorInfo?.position?.name ?? "Cargo não disponível"}
            </p>
          </div>
        </div>
        <div className="px-6">
          <TabsContent
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            tabs={TABS}
            itemClasses={{
              Avaliação: "text-sm font-semibold px-6 py-3",
              Histórico: "text-sm font-semibold px-6 py-3",
              Objetivos: "text-sm font-semibold px-6 py-3",
            }}
            className="border-b border-gray-200 px-6"
            disabledTabs={cycleStatus !== "emRevisao" ? ["Avaliação"] : []}
          />
        </div>
      </div>
      <div className="px-6 py-6">{contentByTab[activeTab]}</div>
    </div>
  );
};

export default ColaboradorDetails;
