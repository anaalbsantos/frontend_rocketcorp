import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import TabsContent from "@/components/TabContent";
import DashboardStatCard from "@/components/DashboardStatCard";
import Chart from "@/components/Chart";
import CycleSummary from "@/components/CycleSummary";
import ManagerEvaluationForm from "@/components/evaluation/ManagerEvaluationForm";
import { Star, FilePen } from "lucide-react";
import api from "@/api/api";

interface Cycle {
  cycleId: string;
  name: string;
  startDate: string;
  endDate: string;
  selfScore: number | null;
  leaderScore: number | null;
  finalScore: number | null;
  feedback: string | null;
  peerScores: number[];
}

const ColaboradorDetails = () => {
  const { id: userId } = useParams();
  const [evaluations, setEvaluations] = useState<Cycle[]>([]);
  const [activeTab, setActiveTab] = useState("Histórico");
  const [growth, setGrowth] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [colaboradorInfo, setColaboradorInfo] = useState<{
    name: string;
    position?: { name: string };
  } | null>(null);
  const [topicFilledStatus, setTopicFilledStatus] = useState<
    Record<string, boolean>
  >({});
  const handleFilledChange = useCallback((topic: string, filled: boolean) => {
    setTopicFilledStatus((prev) => {
      if (prev[topic] === filled) return prev;
      return { ...prev, [topic]: filled };
    });
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setColaboradorInfo(res.data);
      } catch (err) {
        console.error("Erro ao buscar dados do colaborador", err);
      }
    };
    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);
  const isCycleOpen = evaluations[0]
    ? new Date(evaluations[0].endDate) > new Date()
    : false;

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await api.get(`/users/${userId}/evaluationsPerCycle`);
        const now = new Date();
        const data: Cycle[] = res.data.filter(
          (c) => new Date(c.startDate) <= now
        );
        console.log("DADOS DO BACKEND", data);

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        );

        setEvaluations(sorted);

        if (sorted.length >= 2) {
          const [current, previous] = sorted;

          if (current.finalScore !== null && previous.finalScore !== null) {
            const diff = current.finalScore - previous.finalScore;
            setGrowth(Number(diff.toFixed(1)));
          }
        }

        const latestFinal = sorted.find((c) => c.finalScore !== null);
        if (latestFinal) {
          setLastScore(latestFinal.finalScore);
        }
      } catch (err) {
        console.error("Erro ao buscar avaliações do colaborador", err);
      }
    };

    if (userId) {
      fetchEvaluations();
    }
  }, [userId]);
  const criteria = [
    {
      id: "1",
      title: "Sentimento de Dono",
      topic: "Postura",
      autoScore: 4.0,
      autoJustification: "Tenho demonstrado muita proatividade e iniciativa.",
    },
    {
      id: "2",
      title: "Organização no trabalho",
      topic: "Postura",
      autoScore: 3.5,
      autoJustification: "Organizo minhas tarefas no Trello diariamente.",
    },
    {
      id: "3",
      title: "Entregar com qualidade",
      topic: "Execução",
      autoScore: 4.5,
      autoJustification: "As entregas da sprint tiveram pouquíssimos erros.",
    },
    {
      id: "4",
      title: "Pensar fora da caixa",
      topic: "Execução",
      autoScore: 5.0,
      autoJustification: "Contribuí com soluções criativas no projeto RocketX.",
    },
  ];
  const topics = [...new Set(criteria.map((c) => c.topic))];
  const avaliacaoCompleta = topics.every((t) => topicFilledStatus[t]);

  const contentByTab: Record<string, JSX.Element> = {
    Avaliação: (
      <div className="flex flex-col gap-6 p-6">
        {topics.map((topic) => (
          <ManagerEvaluationForm
            key={topic}
            topic={topic}
            criteria={criteria.filter((c) => c.topic === topic)}
            onAllFilledChange={(filled) => handleFilledChange(topic, filled)}
          />
        ))}
      </div>
    ),
    Histórico: (
      <div className="flex flex-col px-6 pt-2 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <DashboardStatCard
            type="currentScore"
            title="Nota atual"
            description="Nota final do último ciclo finalizado."
            value={lastScore ?? "-"}
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            type="growth"
            title="Crescimento"
            description="Comparado ao ciclo anterior"
            value={growth}
          />
          <DashboardStatCard
            type="evaluations"
            title="Avaliações Realizadas"
            description="Total de ciclos finalizados"
            value={evaluations.filter((c) => c.finalScore !== null).length}
            icon={<FilePen className="w-10 h-10" />}
          />
        </div>

        <div className="bg-white rounded-lg p-5">
          <p className="font-bold mb-2">Desempenho</p>
          <Chart
            chartData={evaluations
              .filter((e) => e.finalScore !== null)
              .map((e) => ({
                semester: e.name,
                score: e.finalScore!,
              }))}
            height="h-[200px]"
            barSize={50}
          />
        </div>

        <div className="bg-white rounded-lg p-5 flex flex-col gap-3">
          <p className="font-bold leading-9">Ciclos de Avaliação</p>
          {evaluations.map((ciclo, i) => (
            <CycleSummary
              key={i}
              semester={ciclo.name}
              status={
                ciclo.endDate && new Date(ciclo.endDate) < new Date()
                  ? "Finalizado"
                  : "Em andamento"
              }
              finalScore={ciclo.finalScore ?? undefined}
              autoevaluationScore={ciclo.selfScore ?? undefined}
              evaluation360Score={
                ciclo.peerScores?.length
                  ? Number(
                      (
                        ciclo.peerScores.reduce((a, b) => a + b, 0) /
                        ciclo.peerScores.length
                      ).toFixed(1)
                    )
                  : undefined
              }
              evaluationLeaderScore={ciclo.leaderScore ?? undefined}
              summary={ciclo.feedback ?? "-"}
            />
          ))}
        </div>
      </div>
    ),
  };

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
          {activeTab === "Avaliação" && (
            <button
              className={`ml-auto text-sm px-4 py-2 rounded transition ${
                avaliacaoCompleta
                  ? "bg-brand text-white hover:bg-brand/90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!avaliacaoCompleta}
            >
              Concluir e enviar
            </button>
          )}
        </div>

        <div className="px-6">
          <TabsContent
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            tabs={["Avaliação", "Histórico"]}
            itemClasses={{
              Avaliação: "text-sm font-semibold px-6 py-3",
              Histórico: "text-sm font-semibold px-6 py-3",
            }}
            className="border-b border-gray-200 px-6"
            disabledTabs={isCycleOpen ? ["Avaliação"] : []}
          />
        </div>
      </div>

      <div className="px-6 py-6">{contentByTab[activeTab]}</div>
    </div>
  );
};

export default ColaboradorDetails;
