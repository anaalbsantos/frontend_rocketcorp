import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/SearchInput";
import StatusFilter from "@/components/StatusFilter";
import CollaboratorCard from "@/components/CollaboratorCard";

interface Collaborator {
  id: number;
  name: string;
  role: string;
  autoAssessment: number | null;
  managerScore: number | null;
}

const ColaboradoresGestor = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | "Pendente" | "Finalizada"
  >("Todos");

  const [collaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: "Maria",
      role: "Developer",
      autoAssessment: 4.0,
      managerScore: null,
    },
    {
      id: 2,
      name: "Ylson",
      role: "Developer",
      autoAssessment: 5.0,
      managerScore: 4.8,
    },
    {
      id: 3,
      name: "Ana",
      role: "Developer",
      autoAssessment: 4.0,
      managerScore: 5.0,
    },
    {
      id: 4,
      name: "Lucas",
      role: "Designer",
      autoAssessment: 4.2,
      managerScore: null,
    },
    {
      id: 5,
      name: "Clara",
      role: "QA",
      autoAssessment: 4.3,
      managerScore: 4.7,
    },
  ]);

  const filtered = collaborators
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) =>
      statusFilter === "Todos"
        ? true
        : (c.managerScore !== null) === (statusFilter === "Finalizada")
    );
  const navigate = useNavigate();

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
        {filtered.length > 0 ? (
          filtered.map((c) => (
            <CollaboratorCard
              key={c.id}
              name={c.name}
              role={c.role}
              status={c.managerScore !== null ? "Finalizada" : "Pendente"}
              autoAssessment={c.autoAssessment}
              managerScore={c.managerScore}
              gestorCard={true}
              onClickArrow={() => navigate(`/app/colaboradores/${c.id}`)}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center mt-10">
            Nenhum colaborador encontrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default ColaboradoresGestor;
