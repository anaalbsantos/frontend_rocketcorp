import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/SearchInput";
import StatusFilter from "@/components/StatusFilter";
import CollaboratorCard from "@/components/CollaboratorCard";
import { useGestorDashboardData } from "../gestor/hooks/useGestorDashboardData";

const ColaboradoresGestor = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | "Pendente" | "Finalizada"
  >("Todos");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400
  );

  const { collaborators, cycleStatus } = useGestorDashboardData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileLayout = windowWidth < 1215;

  const filtered = collaborators.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase())
  );

  const processedCollaborators = filtered
    .map((c) => {
      let dynamicStatus: "Pendente" | "Finalizada";

      if (cycleStatus === "aberto") {
        dynamicStatus = c.autoAssessment !== null ? "Finalizada" : "Pendente";
      } else if (cycleStatus === "emRevisao") {
        dynamicStatus = c.managerScore !== null ? "Finalizada" : "Pendente";
      } else {
        dynamicStatus = c.comiteScore !== null ? "Finalizada" : "Pendente";
      }

      return {
        ...c,
        dynamicStatus,
      };
    })
    .filter((c) =>
      statusFilter === "Todos" ? true : c.dynamicStatus === statusFilter
    );

  return (
    <div className="bg-gray-100 font-sans">
      <div className="shadow-sm bg-white px-8 py-8 mb-6 max-w-[1700px] mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800">Colaboradores</h1>
      </div>

      <div className="px-4 sm:px-8 mb-4 flex items-center space-x-4 max-w-[1700px] mx-auto">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por colaboradores"
          className="flex-grow w-full sm:w-[1550px]"
        />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      <div className="px-4 sm:px-8 space-y-4 w-full max-w-full pb-8">
        {processedCollaborators.map((c) => {
          if (!isMobileLayout) {
            // Desktop: mostrar o card original
            return (
              <CollaboratorCard
                key={c.id}
                name={c.name}
                role={c.position}
                status={c.dynamicStatus}
                autoAssessment={c.autoAssessment}
                managerScore={c.managerScore}
                finalScore={cycleStatus === "finalizado" ? c.comiteScore : undefined}
                gestorCard
                onClickArrow={() => navigate(`/app/gestor/colaboradores/${c.id}`)}
              />
            );
          }

          // Mobile: empilhar nome, profissão, status + notas lado a lado + seta
          return (
            <div
              key={c.id}
              className="bg-white rounded-lg shadow p-4 max-w-full cursor-pointer"
              onClick={() => navigate(`/app/gestor/colaboradores/${c.id}`)}
              style={{ minWidth: 320 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 text-white font-semibold text-lg select-none">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-600">{c.position}</p>
                    <p
                      className={`mt-1 text-xs font-medium ${
                        c.dynamicStatus === "Finalizada"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {c.dynamicStatus}
                    </p>
                  </div>
                </div>

                <div className="text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-center gap-8 mt-4">
                <div className="px-2 py-1 text-center">
                  <p className="text-sm text-gray-500">Autoavaliação</p>
                  <p className="font-semibold text-gray-900">
                    {c.autoAssessment !== null ? c.autoAssessment.toFixed(1) : "-"}
                  </p>
                </div>
                <div className="px-2 py-1 text-center">
                  <p className="text-sm text-gray-500">Gestor</p>
                  <p className="font-semibold text-gray-900">
                    {c.managerScore !== null ? c.managerScore.toFixed(1) : "-"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColaboradoresGestor;
