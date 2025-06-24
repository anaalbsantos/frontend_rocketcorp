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
import type { Evaluation } from "@/types";

const mockEvaluations: Evaluation[] = [
  {
    score: 4.8,
    semester: "2024.2",
    summary: "Você teve um desempenho excelente, continue assim!",
    status: "Finalizado",
  },
  {
    score: 1.5,
    semester: "2024.1",
    summary: "Você se saiu muito bem por conta disso e isso",
    status: "Finalizado",
  },
  {
    score: 3.0,
    semester: "2023.2",
    summary: "Você teve um desempenho regular, mas pode melhorar.",
    status: "Finalizado",
  },
  {
    score: 4.2,
    semester: "2023.1",
    summary: "Excelente desempenho, continue assim!",
    status: "Finalizado",
  },
  {
    score: 2.8,
    semester: "2022.2",
    summary: "Você teve um desempenho regular, mas pode melhorar.",
    status: "Finalizado",
  },
  {
    score: 3.5,
    semester: "2022.1",
    summary: "Bom trabalho, mas há espaço para melhorias.",
    status: "Finalizado",
  },
];

const ColaboradorDashboard = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando uma chamada à API
    const fetchEvaluations = async () => {
      try {
        // Simulando um delay de rede
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEvaluations(mockEvaluations);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="text-xl text-text-primary">
          <span className="font-bold">Olá,</span> Colaborador
        </h1>
        <Avatar name="Colaborador Novo" />
      </div>
      <div className="flex flex-col gap-4">
        <CycleStatusCard
          ciclo={{
            nome: "2025.1",
            status: "aberto",
            diasRestantes: 15,
          }}
        />
        <div className="flex flex-row gap-5 h-[400px] 2xl:h-[450px]">
          <div className="flex-1 bg-white p-5 rounded-lg h-inherit flex flex-col gap-3">
            <div className="flex flex-row justify-between items-end">
              <p className="font-bold">Suas avaliações</p>
              <a className="font-bold text-xs text-brand hover:text-brand/80">
                Ver mais
              </a>
            </div>
            <div className="flex flex-col gap-2 max-h-full overflow-y-scroll scrollbar">
              {evaluations.map((evaluation, index) => (
                <CycleEvaluation
                  key={index}
                  score={evaluation.score}
                  semester={evaluation.semester}
                  summary={evaluation.summary}
                  status={evaluation.status}
                />
              ))}
            </div>
          </div>
          <div className="flex-2 bg-white p-5 rounded-lg flex flex-col justify-between gap-3">
            <div className="flex flex-row justify-between items-center">
              <p className="font-bold">Desempenho</p>
              <Select>
                <SelectTrigger className="w-[150px] xl:w-[180px] focus:border-transparent">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">2024.1</SelectItem>
                  <SelectItem value="dark">2024.2</SelectItem>
                  <SelectItem value="system">2025.1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Chart chartData={evaluations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColaboradorDashboard;
