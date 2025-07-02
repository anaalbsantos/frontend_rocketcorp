import { useState, useEffect } from "react";
import SearchInput from "@/components/SearchInput";
import CollaboratorCard from "@/components/CollaboratorCard";

interface Score {
  cycleId: string;
  finalScore: number | null;
  selfScore: number | null;
  leaderScore: number | null;
}

interface UsuarioApi {
  id: string;
  name: string;
  role: string;
  positionId: string;
  scorePerCycle: Score[];
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
}

const positionMap: Record<string, string> = {
  pos1: "Product Owner",
  pos2: "Desenvolvedor",
  pos3: "Líder",
};

const Colaboradores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Finalizada" | "Pendente">("Todos");
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollaborators() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login.");
        const response = await fetch("http://localhost:3000/users", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Erro ao buscar colaboradores: ${response.statusText}`);
        const data = await response.json();
        const cicloAtualId = data.cicloAtual?.id;

        const usuariosFiltrados: Colaborador[] = (data.usuarios as UsuarioApi[])
          .filter((u) => u.role === "COLABORADOR")
          .map((u) => {
            const scoreAtual = u.scorePerCycle.find((s) => s.cycleId === cicloAtualId);
            const finalScore = scoreAtual?.finalScore ?? "-";
            const status = finalScore !== "-" && finalScore !== null ? "Finalizada" : "Pendente";
            return {
              id: u.id,
              name: u.name,
              role: positionMap[u.positionId] || "Desconhecido",
              status,
              autoAssessment: scoreAtual?.selfScore ?? null,
              assessment360: null,
              managerScore: scoreAtual?.leaderScore ?? null,
              finalScore,
            };
          });

        setCollaborators(usuariosFiltrados);
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

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="shadow-sm bg-white px-4 md:px-8 py-8 mb-6 max-w-[1700px] mx-auto w-full">
        <h1 className="text-2xl font-semibold text-gray-800">Colaboradores</h1>
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
            onFilterChange={(val) => setStatusFilter(val as "Todos" | "Finalizada" | "Pendente")}
          />
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-4 max-w-[1700px] mx-auto w-full pb-8">
        {loading && <p className="text-center text-gray-600">Carregando colaboradores...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && filteredCollaborators.length === 0 && (
          <p className="text-gray-600 text-center mt-10">Nenhum colaborador encontrado.</p>
        )}

        {!loading &&
          !error &&
          filteredCollaborators.map((colab) => (
            <div key={colab.id} className="w-full overflow-x-auto" style={{ minWidth: 320 }}>
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

                <div className="block xl1600:hidden bg-white rounded-lg shadow p-4 flex-col min-w-[320px]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-600 text-white font-semibold text-lg select-none">
                      {colab.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{colab.name}</p>
                      <p className="text-sm text-gray-600">{colab.role}</p>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          colab.status === "Finalizada" ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {colab.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row justify-between gap-6 text-center">
                    <div className="px-2 py-1 -mb-4">
                      <p className="text-sm text-gray-500">Autoavaliação</p>
                      <p className="font-semibold text-gray-900">{colab.autoAssessment ?? "-"}</p>
                    </div>
                    <div className="px-2 py-1 -mb-4">
                      <p className="text-sm text-gray-500">Assessment 360</p>
                      <p className="font-semibold text-gray-900">{colab.assessment360 ?? "-"}</p>
                    </div>
                    <div className="px-2 py-1 -mb-4">
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
            </div>
          ))}
      </div>
    </div>
  );
};

export default Colaboradores;
