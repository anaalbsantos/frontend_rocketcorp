import { useEffect, useState } from "react";
import SearchInput from "@/components/SearchInput";
import CollaboratorCard from "@/components/CollaboratorCard";

interface PeerScore {
  value: number;
}

interface ScorePerCycle {
  id: string;
  selfScore: number | null;
  leaderScore: number | null;
  finalScore: number | null;
  peerScores?: PeerScore[];
}

interface UsuarioAPI {
  id: string;
  name: string;
  role: string;
  positionId: string | null;
  scorePerCycle: ScorePerCycle[];
  position?: {
    name: string;
  };
}

interface ApiResponse {
  ciclo_atual_ou_ultimo?: {
    id: string;
    name: string;
    startDate: string;
    reviewDate: string;
    endDate: string;
  };
  usuarios: UsuarioAPI[];
}

interface Colaborador {
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

const calcularMedia360 = (peerScores?: PeerScore[]): number | null => {
  if (!peerScores || peerScores.length === 0) return null;
  const soma = peerScores.reduce((acc, curr) => acc + curr.value, 0);
  return Number((soma / peerScores.length).toFixed(1));
};

const Colaboradores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Finalizada" | "Pendente">("Todos");
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchCollaborators() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const response = await fetch("http://localhost:3000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao buscar colaboradores.");

        const data: ApiResponse = await response.json();

        const colaboradoresFiltrados: Colaborador[] = data.usuarios
          .filter((u) => u.role === "COLABORADOR")
          .map((u) => {
            const scoreAtual = u.scorePerCycle[0];
            const todasPeerScores = u.scorePerCycle.flatMap((s) => s.peerScores ?? []);
            const assessment360Raw = calcularMedia360(todasPeerScores);
            const autoAssessmentRaw = scoreAtual?.selfScore ?? null;
            const managerScoreRaw = scoreAtual?.leaderScore ?? null;

            const status =
              scoreAtual && scoreAtual.finalScore !== null && scoreAtual.finalScore !== undefined
                ? "Finalizada"
                : "Pendente";

            const finalScore =
              status === "Finalizada" && scoreAtual && scoreAtual.finalScore !== null
                ? Number(scoreAtual.finalScore.toFixed(1))
                : "-";

            return {
              id: u.id,
              name: u.name,
              role: u.position?.name || u.role || "Desconhecido",
              status,
              autoAssessment:
                autoAssessmentRaw !== null ? Number(autoAssessmentRaw.toFixed(1)) : null,
              assessment360:
                assessment360Raw !== null ? Number(assessment360Raw.toFixed(1)) : null,
              managerScore:
                managerScoreRaw !== null ? Number(managerScoreRaw.toFixed(1)) : null,
              finalScore,
              scoreCycleId: scoreAtual?.id || null,
            };
          });
        
        setCollaborators(colaboradoresFiltrados);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchCollaborators();
  }, []);

  const filteredCollaborators = collaborators.filter((colab) => {
    const matchesSearch =
      colab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "Todos" || colab.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isMobileLayout = windowWidth < 1024;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="shadow-sm bg-white px-4 md:px-8 py-8 mb-6 max-w-[1700px] mx-auto w-full">
        <h1 className="text-2xl font-normal text-gray-800">Colaboradores</h1>
      </div>

      <div className="px-4 md:px-8 mb-8 flex flex-wrap gap-4 max-w-[1700px] mx-auto w-full">
        <div className="flex-grow min-w-[200px]">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por colaboradores"
            className="w-full"
            filterOptions={["Todos", "Finalizada", "Pendente"]}
            initialFilter="Todos"
            onFilterChange={(val) =>
              setStatusFilter(val as "Todos" | "Finalizada" | "Pendente")
            }
          />
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-4 max-w-[1700px] mx-auto w-full pb-8">
        {loading && (
          <p className="text-center text-gray-600">Carregando colaboradores...</p>
        )}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && filteredCollaborators.length === 0 && (
          <p className="text-gray-600 text-center mt-10">Nenhum colaborador encontrado.</p>
        )}

        {!loading &&
          !error &&
          filteredCollaborators.map((colab) => {
            if (!isMobileLayout) {
              return (
                <div
                  key={colab.id}
                  className="w-full overflow-x-auto"
                  style={{ minWidth: 320 }}
                >
                  <div className="max-w-full">
                    <div className="hidden xl1600:block">
                    <CollaboratorCard {...colab} esconderSetaXL1600={true} rhCard={true} />                    </div>
                    <div className="block xl1600:hidden bg-white rounded-lg shadow p-4 flex-col min-w-[320px]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-600 text-white font-semibold text-lg select-none">
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
                            {colab.autoAssessment !== null
                              ? Number(colab.autoAssessment).toFixed(1)
                              : "-"}
                          </p>
                        </div>
                        <div className="px-2 py-1 -mb-4">
                          <p className="text-sm text-gray-500">Avaliação 360</p>
                          <p className="font-semibold text-gray-900">
                            {colab.assessment360 !== null
                              ? Number(colab.assessment360).toFixed(1)
                              : "-"}
                          </p>
                        </div>
                        <div className="px-2 py-1 -mb-4">
                          <p className="text-sm text-gray-500">Gestor</p>
                          <p className="font-semibold text-gray-900">
                            {colab.managerScore !== null
                              ? Number(colab.managerScore).toFixed(1)
                              : "-"}
                          </p>
                        </div>
                        <div className="px-2 py-1">
                          <p className="text-sm text-gray-500">Final</p>
                          <p className="font-semibold text-gray-900">{colab.finalScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const isExpanded = expandedIds.has(colab.id);

            return (
              <div
                key={colab.id}
                className="w-full overflow-x-auto"
                style={{ minWidth: 320 }}
              >
                <div className="max-w-full bg-white rounded-lg shadow p-4 flex flex-col">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(colab.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-600 text-white font-semibold text-lg select-none">
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

                    <div
                      className={`transition-transform duration-300 text-gray-700`}
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div
                    className={`flex flex-col gap-4 text-center mt-4 transition-[max-height,opacity,padding] duration-300 ease-in-out overflow-hidden ${
                      isExpanded
                        ? "max-h-[500px] opacity-100 pt-4 pb-4"
                        : "max-h-0 opacity-0 pt-0 pb-0"
                    }`}
                    aria-expanded={isExpanded}
                  >
                    <div className="px-2 py-1">
                      <p className="text-sm text-gray-500">Autoavaliação</p>
                      <p className="font-semibold text-gray-900">{colab.autoAssessment ?? "-"}</p>
                    </div>
                    <div className="px-2 py-1">
                      <p className="text-sm text-gray-500">Avaliação 360</p>
                      <p className="font-semibold text-gray-900">{colab.assessment360 ?? "-"}</p>
                    </div>
                    <div className="px-2 py-1">
                      <p className="text-sm text-gray-500">Gestor</p>
                      <p className="font-semibold text-gray-900">{colab.managerScore ?? "-"}</p>
                    </div>
                    <div className="px-2 py-1">
                      <p className="text-sm text-gray-500">Final</p>
                      <p className="font-semibold text-gray-900">{colab.finalScore}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Colaboradores;
