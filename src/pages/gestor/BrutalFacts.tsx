import { useState } from "react";
import DashboardStatCard from "@/components/DashboardStatCard";
import Chart from "@/components/Chart";
import CollaboratorCard from "@/components/CollaboratorCard";
import SearchInput from "@/components/SearchInput";
import { Star } from "lucide-react";
import InsightBox from "@/components/InsightBox";
import { useNavigate } from "react-router-dom";

const BrutalFacts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const colaboradores = [
    {
      id: "1",
      nome: "Maria",
      cargo: "Product Design",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 4.0,
      final: 4.5,
    },
    {
      id: "2",
      nome: "Ana",
      cargo: "Dev Backend",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 3.5,
      final: 4.0,
    },
    {
      id: "3",
      nome: "Ylson",
      cargo: "Product Design",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 4.0,
      final: 4.5,
    },
    {
      id: "4",
      nome: "Luiz",
      cargo: "Dev Backend",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 3.5,
      final: 4.0,
    },
    {
      id: "5",
      nome: "Paulo",
      cargo: "Product Design",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 4.0,
      final: 4.5,
    },
    {
      id: "6",
      nome: "Vinicius",
      cargo: "Dev Backend",
      auto: 4.0,
      avaliacao360: 5.0,
      gestor: 4.5,
      final: 5.0,
    },
    {
      id: "7",
      nome: "Rafael",
      cargo: "Product Design",
      auto: 1.0,
      avaliacao360: 4.0,
      gestor: 4.0,
      final: 4.5,
    },
    {
      id: "8",
      nome: "Colaborador 1",
      cargo: "Dev Backend",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 3.5,
      final: 2.0,
    },
    {
      id: "8",
      nome: "Colaborador 2",
      cargo: "Dev Backend",
      auto: 4.0,
      avaliacao360: 4.0,
      gestor: 3.5,
      final: 2.5,
    },
  ];

  const filteredColaboradores = colaboradores.filter((colab) =>
    colab.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      <div className="shadow-sm bg-white px-6 py-4 mb-6 max-w-[1700px] mx-auto w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Brutal Facts</h2>
          <button
            className="bg-brand text-white text-sm px-3 py-2 rounded hover:bg-brand/90 transition"
            onClick={() => {}}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6 px-4 sm:px-8 max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard
            title="Nota média geral"
            description="Média das avaliações dos ciclos"
            value={4.4}
            type="currentScore"
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            title="Desempenho de liderados"
            description="Diferença em relação ao último ciclo"
            value={"+0.3"}
            type="growth"
          />
          <DashboardStatCard
            title="Liderados avaliados"
            description="Total de pessoas avaliadas no ciclo"
            value={10}
            type="evaluations"
          />
        </div>
        <div className="bg-white p-5 rounded-lg">
          <h3 className="font-bold mb-2">Resumo</h3>
          <InsightBox>
            No employees achieved top performer status (4.5+). This indicates
            either grade inflation avoidance or a fundamental talent
            acquisition/development problem.
          </InsightBox>
        </div>
        <div className="bg-white p-5 rounded-lg">
          <h3 className="font-bold mb-4">Desempenho</h3>
          <Chart
            chartData={[
              { semester: "2023.1", score: 3.4 },
              { semester: "2023.2", score: 3.5 },
              { semester: "2024.1", score: 4.1 },
              { semester: "2024.2", score: 4.3 },
            ]}
            height="h-[200px]"
            barSize={50}
          />
          <InsightBox>
            No employees achieved top performer status (4.5+). This indicates
            either grade inflation avoidance or a fundamental talent
            acquisition/development problem.
          </InsightBox>
        </div>
        <div className="bg-white p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Resumo de equalizações</h3>
            <div className="flex gap-2 items-center">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar"
                className="w-64"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredColaboradores.map((colab) => (
              <CollaboratorCard
                key={colab.id}
                name={colab.nome}
                role={colab.cargo}
                status="Finalizada"
                autoAssessment={colab.auto}
                assessment360={colab.avaliacao360}
                managerScore={colab.gestor}
                finalScore={colab.final}
                brutalFactsCard
                onClickArrow={() => navigate(`/app/colaboradores/${colab.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrutalFacts;
