import React, { useState } from "react";
import SearchInput from "@/components/SearchInput";
import CollaboratorCard from "@/components/CollaboratorCard";
import { Filter } from "lucide-react";

interface Colaborador {
  id: number;
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  assessment360: number | null;
  managerScore: number | null;
  finalScore: number | "-";
}

const Colaboradores = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [collaborators] = useState<Colaborador[]>([

    { id: 1, name: "Alice Silva", role: "Product Owner", status: "Finalizada", autoAssessment: 4.2, assessment360: 4.0, managerScore: 4.1, finalScore: "-" },
    { id: 2, name: "Bruno Costa", role: "Desenvolvedor", status: "Pendente", autoAssessment: null, assessment360: null, managerScore: null, finalScore: "-" },
    { id: 3, name: "Carlos Souza", role: "Desenvolvedor", status: "Finalizada", autoAssessment: 3.8, assessment360: 4.2, managerScore: 3.9, finalScore: "-" },
    { id: 4, name: "Daniela Rocha", role: "Analista de QA", status: "Finalizada", autoAssessment: 4.0, assessment360: 3.9, managerScore: 4.0, finalScore: "-" },
    { id: 5, name: "Eduardo Lima", role: "Desenvolvedor", status: "Finalizada", autoAssessment: 3.5, assessment360: 3.7, managerScore: 3.8, finalScore: "-" },
    { id: 6, name: "Lucas Alves", role: "Product Owner", status: "Pendente", autoAssessment: null, assessment360: null, managerScore: null, finalScore: "-" },
    { id: 7, name: "Gabriel Costa", role: "Designer", status: "Finalizada", autoAssessment: 4.1, assessment360: 4.3, managerScore: 4.2, finalScore: "-" },
    { id: 8, name: "Helena Dias", role: "Analista de QA", status: "Finalizada", autoAssessment: 3.9, assessment360: 3.8, managerScore: 3.7, finalScore: "-" },
    { id: 9, name: "Igor Nunes", role: "Desenvolvedor", status: "Pendente", autoAssessment: null, assessment360: null, managerScore: null, finalScore: "-" },
    { id: 10, name: "Julia Prado", role: "Product Owner", status: "Finalizada", autoAssessment: 4.3, assessment360: 4.1, managerScore: 4.2, finalScore: "-" },
    { id: 11, name: "Karla Costa", role: "Designer", status: "Pendente", autoAssessment: null, assessment360: null, managerScore: null, finalScore: "-" },
    { id: 12, name: "Pedro Barbosa", role: "Analista de QA", status: "Finalizada", autoAssessment: 3.6, assessment360: 3.7, managerScore: 3.8, finalScore: "-" },
    { id: 13, name: "Maria Castro", role: "Desenvolvedor", status: "Finalizada", autoAssessment: 3.9, assessment360: 4.0, managerScore: 4.1, finalScore: "-" },
    { id: 14, name: "Nicolas Torres", role: "Product Owner", status: "Pendente", autoAssessment: null, assessment360: null, managerScore: null, finalScore: "-" },
    { id: 15, name: "Olivia Maria", role: "Designer", status: "Finalizada", autoAssessment: 4.0, assessment360: 3.9, managerScore: 4.1, finalScore: "-" },
  ]);

  const colaboradoresComNotaCalculada = collaborators.map((colab) => {
    if (
      colab.status === "Finalizada" &&
      colab.autoAssessment !== null &&
      colab.assessment360 !== null &&
      colab.managerScore !== null
    ) {

      const media =
        (colab.autoAssessment + colab.assessment360 + colab.managerScore) / 3;
      return {
        ...colab,
        finalScore: Number(media.toFixed(2)),
      };
    }
    return colab;
  });

  const filteredCollaborators = colaboradoresComNotaCalculada.filter((colab) =>
    colab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 font-sans">
      <div className="shadow-sm bg-white px-4 md:px-8 py-8 mb-6 w-full max-w-[1700px] mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800">Colaboradores</h1>
      </div>

      <div className="px-4 md:px-8 mb-8 flex flex-wrap gap-4 max-w-[1700px] mx-auto w-full">
        <div className="flex-grow min-w-[200px]">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por colaboradores"
            className="w-full"
          />
        </div>
        <div className="flex-shrink-0">
          <button className="h-full px-4 py-2 rounded-md bg-[#08605f] text-white hover:bg-[#064a49] focus:outline-none focus:ring-2 focus:ring-[#08605f] focus:ring-opacity-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-4 max-w-[1700px] mx-auto w-full pb-8">
        {filteredCollaborators.length > 0 ? (
          filteredCollaborators.map((colab) => (
            <div key={colab.id} className="w-full overflow-x-auto" style={{ minWidth: "320px" }}>
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
                  <div
                    className="
                      bg-white rounded-lg shadow p-4
                      flex flex-col 
                      min-w-[320px]
                    "
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

                    <div className="flex flex-col lg:flex-row justify-between gap-6 text-center">
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
                      <div className="px-2 py-1 ">
                        <p className="text-sm text-gray-500">Final</p>
                        <p className="font-semibold text-gray-900">{colab.finalScore}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
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


export default Colaboradores;