import { Link, useNavigate } from "react-router-dom";
import { Star, Users, FileText } from "lucide-react";

import Avatar from "@/components/Avatar";
import CycleStatusCard from "@/components/CycleStatusCard";
import DashboardStatCard from "@/components/DashboardStatCard";
import CollaboratorCard from "@/components/CollaboratorCard";

import { useUser } from "@/contexts/UserContext";
import { daysLeft } from "@/utils/daysLeft";
import { formatPendingText } from "@/utils/formatPendingText";

import { useGestorDashboardData } from "./hooks/useGestorDashboardData"; // ajuste o path conforme sua estrutura

const DashboardGestor = () => {
  const navigate = useNavigate();
  const { userName } = useUser();

  const {
    collaborators,
    cycle,
    cycleStatus,
    currentScore,
    growth,
    hasGrowthData,
    growthBaseCount,
  } = useGestorDashboardData();

  const total = collaborators.length || 1;
  const selfEvaluated = collaborators.filter((c) => c.selfDone).length;
  const managerEvaluated = collaborators.filter(
    (c) => c.managerScore !== null
  ).length;

  const selfEvaluationRate = Math.round((selfEvaluated / total) * 100);
  const pendingSelfEvaluations = total - selfEvaluated;
  const pendingManagerEvaluations = total - managerEvaluated;

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl text-text-primary">
          <span className="font-bold">Olá,</span> {userName}
        </h1>
        <Avatar name={userName} />
      </div>

      <div className="flex flex-col gap-4">
        {cycle && cycleStatus && (
          <CycleStatusCard
            ciclo={{
              nome: cycle.name,
              status: cycleStatus,
              diasRestantes:
                cycleStatus === "aberto"
                  ? daysLeft(cycle.reviewDate)
                  : undefined,
              resultadosDisponiveis: true,
            }}
            isGestor
          />
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-4">
          {cycleStatus === "aberto" && (
            <>
              <DashboardStatCard
                type="currentScore"
                title="Nota atual"
                description="Nota consolidada dos ciclos anteriores."
                value={currentScore}
                icon={<Star className="w-10 h-10" />}
              />
              <DashboardStatCard
                type="preenchimento"
                title="Preenchimento"
                description={`${selfEvaluationRate}% dos colaboradores já concluíram suas avaliações.`}
                progress={selfEvaluationRate}
              />
              <DashboardStatCard
                type="managerReviews"
                title="Avaliações pendentes"
                description={formatPendingText(
                  pendingSelfEvaluations,
                  "1 colaborador ainda não concluiu as avaliações.",
                  "{X} colaboradores ainda não concluíram as avaliações.",
                  "Nenhum colaborador com avaliações pendentes."
                )}
                value={pendingSelfEvaluations}
              />
            </>
          )}

          {cycleStatus === "emRevisao" && (
            <>
              <DashboardStatCard
                type="currentScore"
                title="Nota atual"
                description={`Nota parcial do ciclo ${cycle?.name}`}
                value={currentScore}
                icon={<Star className="w-10 h-10" />}
              />
              <DashboardStatCard
                type="managerReviews"
                title="Avaliações pendentes"
                description={formatPendingText(
                  pendingManagerEvaluations,
                  "1 colaborador aguarda avaliação do gestor.",
                  "{X} colaboradores aguardam avaliação do gestor.",
                  "Nenhum colaborador aguarda avaliação do gestor."
                )}
                value={pendingManagerEvaluations}
                icon={<Users className="w-10 h-10" />}
              />
              <DashboardStatCard
                type="equalizacoes"
                title="Revisões pendentes"
                description={formatPendingText(
                  pendingManagerEvaluations,
                  "1 revisão ainda está pendente.",
                  "{X} revisões ainda estão pendentes.",
                  "Nenhuma revisão pendente."
                )}
                value={pendingManagerEvaluations}
                icon={<Users className="w-10 h-10" />}
              />
            </>
          )}

          {cycleStatus === "finalizado" && (
            <>
              <DashboardStatCard
                type="currentScore"
                title="Nota atual"
                description={`Nota final do ciclo realizado em ${cycle?.name}.`}
                value={currentScore}
                icon={<Star className="w-10 h-10" />}
              />
              <DashboardStatCard
                type="growth"
                title="Desempenho dos liderados"
                description={
                  !hasGrowthData
                    ? "Ainda não há colaboradores com histórico suficiente para mostrar crescimento."
                    : `${
                        growth >= 0 ? "Crescimento" : "Queda"
                      } de ${growth.toFixed(
                        1
                      )} em relação ao ciclo anterior. (baseado em ${growthBaseCount} colaborador${
                        growthBaseCount > 1 ? "es" : ""
                      })`
                }
                value={!hasGrowthData ? "-" : growth}
              />
              <DashboardStatCard
                type="equalizacoes"
                title="Brutal Facts"
                description="Veja o desempenho de seus liderados"
                icon={<FileText className="w-10 h-10" />}
                onClick={() => navigate("/app/brutal-facts")}
              />
            </>
          )}
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
            {collaborators.map((collaborator) => (
              <CollaboratorCard
                key={collaborator.id}
                name={collaborator.name}
                role={collaborator.position}
                status={collaborator.status}
                autoAssessment={collaborator.autoAssessment}
                managerScore={collaborator.managerScore}
                finalScore={collaborator.comiteScore}
                gestorCard
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGestor;
