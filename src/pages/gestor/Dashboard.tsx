import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import CycleStatusCard from "@/components/CycleStatusCard";
import DashboardStatCard from "@/components/DashboardStatCard";
import CollaboratorCard from "@/components/CollaboratorCard";
import { Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface Collaborator {
  id: number;
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  managerScore: number | null;
}

const DashboardGestor = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    const data: Omit<Collaborator, "status">[] = [
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
        name: "Maria",
        role: "Developer",
        autoAssessment: 4.0,
        managerScore: null,
      },
      {
        id: 5,
        name: "Ylson",
        role: "Developer",
        autoAssessment: 5.0,
        managerScore: 4.8,
      },
      {
        id: 6,
        name: "Ana",
        role: "Developer",
        autoAssessment: 4.0,
        managerScore: 5.0,
      },
      {
        id: 7,
        name: "Maria",
        role: "Developer",
        autoAssessment: 4.0,
        managerScore: null,
      },
      {
        id: 8,
        name: "Ylson",
        role: "Developer",
        autoAssessment: 5.0,
        managerScore: 4.8,
      },
      {
        id: 9,
        name: "Ana",
        role: "Developer",
        autoAssessment: 4.0,
        managerScore: 5.0,
      },
      {
        id: 10,
        name: "Maria",
        role: "Developer",
        autoAssessment: 4.0,
        managerScore: null,
      },
      {
        id: 11,
        name: "Ylson",
        role: "Developer",
        autoAssessment: 5.0,
        managerScore: 4.8,
      },
      {
        id: 12,
        name: "Ana",
        role: "Developer",
        autoAssessment: 4.0,
        managerScore: 5.0,
      },
    ];

    const enriched = data.map((c) => {
      const complete = c.managerScore !== null;

      const status: "Pendente" | "Finalizada" = complete
        ? "Finalizada"
        : "Pendente";

      return { ...c, status };
    });

    setCollaborators(enriched);
  }, []);

  const currentScore = 4.5;

  const preenchimento = Math.round(
    (collaborators.filter((c) => c.status === "Finalizada").length /
      collaborators.length) *
      100
  );

  const pendentes = collaborators.filter((c) => c.status === "Pendente").length;

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl text-text-primary">
          <span className="font-bold">Olá,</span> Gestor
        </h1>
        <Avatar name="Gestor Nome" />
      </div>

      <div className="flex flex-col gap-4">
        <CycleStatusCard
          ciclo={{
            nome: "2025.1",
            status: "finalizado",
            resultadosDisponiveis: true,
          }}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-4">
          <DashboardStatCard
            type="currentScore"
            title="Nota atual"
            description="Nota final do ciclo realizado em 2024.2."
            value={currentScore}
            icon={<Star className="w-10 h-10" />}
          />

          <DashboardStatCard
            type="preenchimento"
            title="Preenchimento"
            description={`Você preencheu ${preenchimento}% das suas avaliações de gestor.`}
            progress={preenchimento}
          />

          <DashboardStatCard
            type="equalizacoes"
            title="Revisões pendentes"
            description="Conclua suas revisões de nota"
            value={pendentes}
            icon={<Users className="w-10 h-10" />}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Colaboradores
            </h2>
            <Link
              to="/app/colaboradores"
              className="text-brand font-medium text-sm hover:underline transition-colors"
            >
              Ver mais
            </Link>
          </div>

          <div className="space-y-4">
            {collaborators.map((collaborator, index) => (
              <CollaboratorCard
                key={index}
                {...collaborator}
                gestorCard={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGestor;
