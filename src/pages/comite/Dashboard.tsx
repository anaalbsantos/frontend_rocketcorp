import React, { useState, useEffect } from "react";
import DashboardStatCard from "@/components/DashboardStatCard";
import CollaboratorCard from "@/components/CollaboratorCard";
import { Link } from "react-router-dom";

interface PeerScore {
  value: number;
}

interface ScorePerCycle {
  id: string;
  cycleId: string;
  selfScore: number | null;
  leaderScore: number | null;
  finalScore: number | null;
  peerScores?: PeerScore[]; 
}

interface UsuarioDaAPI {
  id: string;
  name: string;
  role: string;
  positionId: string | null;
  scorePerCycle: ScorePerCycle[];
  position?: {
    name: string;
  };
}

interface RespostaAPI {
  ciclo_atual_ou_ultimo?: {
    id: string;
    name: string;
    startDate: string;
    reviewDate: string;
    endDate: string;
  };
  usuarios: UsuarioDaAPI[];
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  assessment360: number | null;
  managerScore: number | null;
  finalScore: number | "-";
  scoreCycleId: string | null;
}

const Comite: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [reviewDate, setReviewDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [erro, setErro] = useState<string>("");

  const hoje = new Date();

  useEffect(() => {
    async function fetchCollaborators() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const response = await fetch("http://localhost:3000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok)
          throw new Error(`Erro ao buscar colaboradores. Código: ${response.status}`);

        const data: RespostaAPI = await response.json();

        if (data.ciclo_atual_ou_ultimo) {
          if (data.ciclo_atual_ou_ultimo.startDate)
            setStartDate(new Date(data.ciclo_atual_ou_ultimo.startDate));
          if (data.ciclo_atual_ou_ultimo.reviewDate)
            setReviewDate(new Date(data.ciclo_atual_ou_ultimo.reviewDate));
          if (data.ciclo_atual_ou_ultimo.endDate)
            setEndDate(new Date(data.ciclo_atual_ou_ultimo.endDate));
        }

        const cicloAtualId = data.ciclo_atual_ou_ultimo?.id;
        const colaboradoresApi = data.usuarios.filter((u) => u.role === "COLABORADOR");

        const colaboradoresFormatados: Collaborator[] = colaboradoresApi.map((u) => {
          const scoreAtual = u.scorePerCycle.find((s) => s.cycleId === cicloAtualId);
          const autoAssessment = scoreAtual?.selfScore ?? null;
          const todasNotas360: number[] = u.scorePerCycle.flatMap((cycle) =>
            cycle.peerScores?.map((score) => score.value) || []
          );
          const assessment360 = todasNotas360.length
            ? Number(
                (todasNotas360.reduce((acc, val) => acc + val, 0) / todasNotas360.length).toFixed(1)
              )
            : null;
          const managerScore = scoreAtual?.leaderScore ?? null;
          const status =
            scoreAtual?.finalScore !== null && scoreAtual?.finalScore !== undefined
              ? "Finalizada"
              : "Pendente";
          const finalScore =
            status === "Finalizada" ? Number(scoreAtual!.finalScore!.toFixed(1)) : "-";
          return {
            id: u.id,
            name: u.name,
            role: u.position?.name || u.role || "Desconhecido",
            status,
            autoAssessment,
            assessment360,
            managerScore,
            finalScore,
            scoreCycleId: scoreAtual?.id ?? null,
          };
        });

        setCollaborators(colaboradoresFormatados);
        setErro("");
      } catch (error: unknown) {
        if (error instanceof Error) setErro(error.message);
        else setErro("Erro desconhecido");
      }
    }
    fetchCollaborators();
  }, []);

  let descricaoPrazo = "Data de fechamento não disponível";
  let prazoDias = 0;

  if (startDate && reviewDate && endDate) {
    if (hoje < reviewDate) {
      descricaoPrazo = "O prazo de avaliações ainda não se iniciou";
    } else if (hoje >= reviewDate && hoje <= endDate) {
      const diffTempo = endDate.getTime() - hoje.getTime();
      prazoDias = Math.max(Math.ceil(diffTempo / (1000 * 60 * 60 * 24)), 0);
      descricaoPrazo = `Faltam ${prazoDias} dias para o fechamento das notas, no dia ${endDate.toLocaleDateString(
        "pt-BR"
      )}`;
    } else if (hoje > endDate) {
      descricaoPrazo = "O período de avaliação já foi encerrado.";
    }
  }

  const totalColaboradores = collaborators.length;
  const colaboradoresFinalizados = collaborators.filter((c) => c.status === "Finalizada").length;
  const progressoPreenchimento = totalColaboradores
    ? (colaboradoresFinalizados / totalColaboradores) * 100
    : 0;
  const equalizacoesPendentes = collaborators.filter((c) => c.status === "Pendente").length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Olá, Comitê</h1>
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
            CN
          </div>
        </header>

        <section className="grid grid-cols-1 xl1300:grid-cols-3 gap-6 mb-6">
          <DashboardStatCard
            type="prazo"
            title="Prazo"
            description={descricaoPrazo}
            prazoDias={prazoDias}
            icon={
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <DashboardStatCard
            type="preenchimento"
            title="Preenchimento de avaliação"
            description={`${Math.round(progressoPreenchimento)}% dos colaboradores já fecharam suas avaliações`}
            progress={Math.round(progressoPreenchimento)}
          />
          <DashboardStatCard
            type="equalizacoes"
            title="Equalizações pendentes"
            description="Conclua suas revisões de nota"
            value={equalizacoesPendentes}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 -mt-1 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0Zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0Z"
                />
              </svg>
            }
          />
        </section>
        <section
          className="bg-white p-6 rounded-lg shadow-md max-h-[690px] flex flex-col"
          style={{
            paddingRight: 12,
            backgroundColor: "white",
            scrollbarWidth: "thin",
            scrollbarColor: "#08605f #e2e8f0",
            height: "690px",
          }}
        >
          <div
            className="flex justify-between items-center mb-4 bg-white"
            style={{ position: "sticky", top: 0, zIndex: 10, paddingBottom: 12 }}
          >
            <h2 className="text-xl font-semibold text-gray-800">Resumo de equalizações</h2>
            <Link to="/app/equalizacao" className="text-green-700 hover:text-green-900 text-sm">
              Ver mais
            </Link>
          </div>

          <div style={{ overflowY: "auto", flexGrow: 1, paddingRight: 12 }}>
            {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}
            {collaborators.length === 0 && !erro ? (
              <p className="text-gray-500 text-center">Carregando colaboradores...</p>
            ) : (
              <div className="space-y-4 min-w-[320px]">
                {collaborators.map((colab, index) => (
                  <div key={index} className="w-full overflow-x-auto">
                    <div className="max-w-full">
                      <div className="hidden xl1600:block">
                        <CollaboratorCard
                          name={colab.name}
                          role={colab.role}
                          status={colab.status}
                          autoAssessment={colab.autoAssessment}
                          assessment360={colab.assessment360}
                          managerScore={colab.managerScore}
                          finalScore={colab.finalScore}
                        />
                      </div>
                      <div className="block xl1600:hidden">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col min-w-[320px]">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-semibold text-lg flex items-center justify-center">
                              {colab.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{colab.name}</p>
                              <p className="text-sm text-gray-600">{colab.role}</p>
                              <p
                                className={`mt-1 text-xs font-medium ${
                                  colab.status === "Finalizada"
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {colab.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col lg:flex-row justify-between gap-6 text-center mt-4">
                            <div className="px-2 py-1 -mb-4">
                              <p className="text-sm text-gray-500">Autoavaliação</p>
                              <p className="font-semibold text-gray-900">
                                {colab.autoAssessment ?? "-"}
                              </p>
                            </div>
                            <div className="px-2 py-1 -mb-4">
                              <p className="text-sm text-gray-500">Assessment 360</p>
                              <p className="font-semibold text-gray-900">
                                {colab.assessment360 ?? "-"}
                              </p>
                            </div>
                            <div className="px-2 py-1 -mb-4">
                              <p className="text-sm text-gray-500">Gestor</p>
                              <p className="font-semibold text-gray-900">
                                {colab.managerScore ?? "-"}
                              </p>
                            </div>
                            <div className="px-2 py-1">
                              <p className="text-sm text-gray-500">Final</p>
                              <p className="font-semibold text-white rounded-md px-2 py-1 inline-block bg-[#08605f]">
                                {colab.finalScore}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Comite;