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

const Evolution = () => {
  const currentScore = 4.5;
  const growth = 0.3;
  const evaluations = 4;
  const cycles = [
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
    {
      semester: "2024.1",
      status: "Finalizado",
      finalScore: 4.1,
      autoevaluationScore: 4.0,
      criterionEvaluation1: "Execução",
      finalEvaluation1: 4.0,
      criterionEvaluation2: "Postura",
      finalEvaluation2: 4.5,
      summary: "Você se saiu muito bem por conta disso e isso.",
    },
    {
      semester: "2023.2",
      status: "Finalizado",
      finalScore: 3.2,
      autoevaluationScore: 3.5,
      criterionEvaluation1: "Execução",
      finalEvaluation1: 3.0,
      criterionEvaluation2: "Postura",
      finalEvaluation2: 3.0,
      summary: "Você se saiu muito bem por conta disso e isso.",
    },
    {
      semester: "2023.1",
      status: "Finalizado",
      finalScore: 3.2,
      autoevaluationScore: 3.5,
      criterionEvaluation1: "Execução",
      finalEvaluation1: 3.0,
      criterionEvaluation2: "Postura",
      finalEvaluation2: 3.0,
      summary: "Você se saiu muito bem por conta disso e isso.",
    },
  ];

  return (
    <div>
      <div className="bg-white flex flex-col justify-between  border-b border-gray-200 shadow-sm">
        <div className="flex justify-between p-6">
          <h3 className="font-bold">Evolução</h3>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os ciclos</SelectItem>
              <SelectItem value="2023.1">2023.1</SelectItem>
              <SelectItem value="2023.2">2023.2</SelectItem>
              <SelectItem value="2024.1">2024.1</SelectItem>
              <SelectItem value="2024.2">2024.2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col p-6 gap-6">
        <div className="flex flex-row gap-2">
          <DashboardStatCard
            type="currentScore"
            title="Nota atual"
            description="Nota final do ciclo realizado em 2024.2."
            value={currentScore}
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            type="growth"
            title="Crescimento"
            description="Em comparação ao ciclo de 2024.1"
            value={growth}
          />
          <DashboardStatCard
            type="evaluations"
            title="Avaliações Realizadas"
            description="Total de avaliações"
            value={evaluations}
          />
        </div>
        <div className="bg-white rounded-lg p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between mb-4">
            <p className="font-bold">Desempenho</p>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023.1">2023.1</SelectItem>
                <SelectItem value="2023.2">2023.2</SelectItem>
                <SelectItem value="2024.1">2024.1</SelectItem>
                <SelectItem value="2024.2">2024.2</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          {cycles.map((cycle, index) => (
            <CycleSummary
              key={index}
              semester={cycle.semester}
              status={cycle.status as "Em andamento" | "Finalizado"}
              finalScore={cycle.finalScore}
              autoevaluationScore={cycle.autoevaluationScore}
              criterionEvaluation1={cycle.criterionEvaluation1}
              finalEvaluation1={cycle.finalEvaluation1}
              criterionEvaluation2={cycle.criterionEvaluation2}
              finalEvaluation2={cycle.finalEvaluation2}
              summary={cycle.summary}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Evolution;
