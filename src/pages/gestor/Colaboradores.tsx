import { useState } from "react";
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

  const { collaborators, cycleStatus } = useGestorDashboardData();
  const navigate = useNavigate();

  const filtered = collaborators.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 font-sans">
      <div className="shadow-sm bg-white px-8 py-8 mb-6 max-w-[1700px] mx-auto">
        <h1 className="text-2xl font-normal text-gray-800">Colaboradores</h1>
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
        {filtered
          .map((c) => {
            let dynamicStatus: "Pendente" | "Finalizada";

            if (cycleStatus === "aberto") {
              dynamicStatus =
                c.autoAssessment !== null ? "Finalizada" : "Pendente";
            } else if (cycleStatus === "emRevisao") {
              dynamicStatus =
                c.managerScore !== null ? "Finalizada" : "Pendente";
            } else {
              dynamicStatus =
                c.comiteScore !== null ? "Finalizada" : "Pendente";
            }

            return {
              ...c,
              dynamicStatus,
            };
          })
          .filter((c) =>
            statusFilter === "Todos" ? true : c.dynamicStatus === statusFilter
          )
          .map((c) => (
            <CollaboratorCard
              key={c.id}
              name={c.name}
              role={c.position}
              status={c.dynamicStatus}
              autoAssessment={c.autoAssessment}
              managerScore={c.managerScore}
              finalScore={
                cycleStatus === "finalizado" ? c.comiteScore : undefined
              }
              gestorCard
              onClickArrow={() => navigate(`/app/gestor/colaboradores/${c.id}`)}
            />
          ))}
      </div>
    </div>
  );
};

export default ColaboradoresGestor;
