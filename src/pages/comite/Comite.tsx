import React, { useState, useEffect } from "react";
import DashboardStatCard from "@/components/DashboardStatCard";
import CollaboratorCard from "@/components/CollaboratorCard";

interface Collaborator {
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  assessment360: number | null;
  managerScore: number | null;
  finalScore: number | "-";
}

const Comite: React.FC = () => {
  const prazoData = new Date(2025, 5, 24); /*o mes é sempre 1 anterior */
  prazoData.setHours(0, 0, 0, 0);
  const hoje = new Date();
  const diffTempo = prazoData.getTime() - hoje.getTime();
  const diasRestantes = Math.max(
    Math.ceil(diffTempo / (1000 * 60 * 60 * 24)),
    0
  );

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    async function fetchCollaborators() {
      try {
        // Simulação de fetch - substituir URL pela real do backend
        // const response = await fetch("/api/collaborators");
        // const data: Omit<Collaborator, "finalScore" | "status">[] = await response.json();

        // Dados mockados para desenvolvimento - sem status definido
        const data: Omit<Collaborator, "finalScore" | "status">[] = [
          {
            name: "Colaborador 1",
            role: "Product Design",
            autoAssessment: 5.0,
            assessment360: 4.0,
            managerScore: null,
          },
          {
            name: "Colaborador 2",
            role: "Product Design",
            autoAssessment: null,
            assessment360: 4.0,
            managerScore: 4.0,
          },
          {
            name: "Colaborador 3",
            role: "Product Design",
            autoAssessment: 4.0,
            assessment360: 4.0,
            managerScore: 4.0,
          },
          {
            name: "Colaborador 4",
            role: "Product Design",
            autoAssessment: 4.0,
            assessment360: 5.0,
            managerScore: 4.0,
          },
          {
            name: "Colaborador 5",
            role: "Product Design",
            autoAssessment: 4.0,
            assessment360: 4.0,
            managerScore: 4.0,
          },
        ];

        const dataComStatusFinalScore: Collaborator[] = data.map((c) => {
          const temTodasNotas =
            c.autoAssessment !== null &&
            c.assessment360 !== null &&
            c.managerScore !== null;

          const status = temTodasNotas ? "Finalizada" : "Pendente";

          const finalScore = temTodasNotas
            ? Number(
                (
                  (c.autoAssessment! + c.assessment360! + c.managerScore!) /
                  3
                ).toFixed(1)
              )
            : "-";

          return { ...c, status, finalScore };
        });

        setCollaborators(dataComStatusFinalScore);
      } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
      }
    }

    fetchCollaborators();
  }, []);

  const totalColaboradores = collaborators.length;
  const colaboradoresFinalizados = collaborators.filter(
    (c) => c.status === "Finalizada"
  ).length;
  const progressoPreenchimento = totalColaboradores
    ? (colaboradoresFinalizados / totalColaboradores) * 100
    : 0;

  const equalizacoesPendentes = collaborators.filter(
    (c) => c.status === "Pendente"
  ).length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Olá, Comitê</h1>
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
            CN
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardStatCard
            type="prazo"
            title="Prazo"
            description={`Faltam ${diasRestantes} dias para o fechamento das notas, no dia ${prazoData.toLocaleDateString(
              "pt-BR"
            )}`}
            prazoDias={diasRestantes}
            icon={
              <svg
                className="w-13 h-13"
                style={{ marginTop: "-15px", marginLeft: "-20px" }}
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
            description={`${Math.round(
              progressoPreenchimento
            )}% dos colaboradores já fecharam suas avaliações`}
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
                className="w-12 h-12"
                style={{ marginTop: "-5px", marginRight: "10px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            }
          />
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Resumo de equalizações
            </h2>
            <a
              href="#"
              className="text-green-700 no-underline hover:text-green-900 hover:no-underline text-sm"
            >
              Ver mais
            </a>
          </div>

          <div className="space-y-4">
            {collaborators.length === 0 && (
              <p className="text-gray-500 text-center">
                Carregando colaboradores...
              </p>
            )}
            {collaborators.map((collaborator, index) => (
              <CollaboratorCard
                key={index}
                name={collaborator.name}
                role={collaborator.role}
                status={collaborator.status}
                autoAssessment={collaborator.autoAssessment}
                assessment360={collaborator.assessment360}
                managerScore={collaborator.managerScore}
                finalScore={collaborator.finalScore}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Comite;
