/* import { useParams } from "react-router-dom"; */
import { useCallback, useState } from "react";
import TabsContent from "@/components/TabContent";
import DashboardStatCard from "@/components/DashboardStatCard";
import Chart from "@/components/Chart";
import CycleSummary from "@/components/CycleSummary";
import { Star, FilePen } from "lucide-react";
import Avatar from "@/components/Avatar";
import ManagerEvaluationForm from "@/components/evaluation/ManagerEvaluationForm";

const ColaboradorDetails = () => {
  /* const { id } = useParams(); */
  const handleFilledChange = useCallback((topic: string, filled: boolean) => {
    setTopicFilledStatus((prev) => {
      if (prev[topic] === filled) return prev;
      return { ...prev, [topic]: filled };
    });
  }, []);
  const [topicFilledStatus, setTopicFilledStatus] = useState<
    Record<string, boolean>
  >({});

  const [activeTab, setActiveTab] = useState("Histórico");
  const colaborador = {
    nome: "Colaborador 1",
    cargo: "Product Design",
    notaAtual: 4.5,
    crescimento: 0.3,
    avaliacoesRealizadas: 4,
    ciclos: [
      {
        semester: "2025.1",
        status: "Em andamento",
      },
      {
        semester: "2024.2",
        status: "Finalizado",
        finalScore: 4.5,
        autoevaluationScore: 4.0,
        criterionEvaluation1: "Execução",
        finalEvaluation1: 5.0,
        criterionEvaluation2: "Postura",
        finalEvaluation2: 4.2,
        summary: "Você se saiu muito bem por conta disso e isso.",
      },
    ],
    criteria: [
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
        autoJustification:
          "Contribuí com soluções criativas no projeto RocketX.",
      },
    ],
  };

  const topics = [...new Set(colaborador.criteria.map((c) => c.topic))];
  const avaliacaoCompleta = topics.every((t) => topicFilledStatus[t]);

  const contentByTab: Record<string, JSX.Element> = {
    Avaliação: (
      <div className="flex flex-col gap-6 p-6">
        {topics.map((topic) => (
          <ManagerEvaluationForm
            key={topic}
            topic={topic}
            criteria={colaborador.criteria.filter((c) => c.topic === topic)}
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
            description="Nota final do ciclo realizado em 2024.2."
            value={colaborador.notaAtual}
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            type="growth"
            title="Crescimento"
            description="Em comparação ao ciclo 2024.1"
            value={colaborador.crescimento}
          />
          <DashboardStatCard
            type="evaluations"
            title="Avaliações Realizadas"
            description="Total de avaliações"
            value={colaborador.avaliacoesRealizadas}
            icon={<FilePen className="w-10 h-10" />}
          />
        </div>

        <div className="bg-white rounded-lg p-5">
          <p className="font-bold mb-2">Desempenho</p>
          <Chart
            chartData={[
              { semester: "2023.1", score: 3.4 },
              { semester: "2023.2", score: 3.3 },
              { semester: "2024.1", score: 4.1 },
              { semester: "2024.2", score: 4.5 },
            ]}
            height="h-[200px]"
            barSize={50}
          />
        </div>

        <div className="bg-white rounded-lg p-5 flex flex-col gap-3">
          <p className="font-bold leading-9">Ciclos de Avaliação</p>
          {colaborador.ciclos.map((ciclo, i) => (
            <CycleSummary
              key={i}
              semester={ciclo.semester}
              status={
                ciclo.status === "Finalizado" ? "Finalizado" : "Em andamento"
              }
              finalScore={ciclo.finalScore ?? undefined}
              autoevaluationScore={ciclo.autoevaluationScore ?? undefined}
              criterionEvaluation1={ciclo.criterionEvaluation1 ?? "-"}
              finalEvaluation1={ciclo.finalEvaluation1 ?? undefined}
              criterionEvaluation2={ciclo.criterionEvaluation2 ?? "-"}
              finalEvaluation2={ciclo.finalEvaluation2 ?? undefined}
              summary={ciclo.summary ?? "-"}
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
          <Avatar name={colaborador.nome} />
          <div>
            <h2 className="font-bold text-xl text-gray-800">
              {colaborador.nome}
            </h2>
            <p className="text-sm text-gray-500">{colaborador.cargo}</p>
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
          />
        </div>
      </div>

      <div className="px-6 py-6">{contentByTab[activeTab]}</div>
    </div>
  );
};

export default ColaboradorDetails;
