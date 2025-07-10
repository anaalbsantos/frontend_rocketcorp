import { Link, useNavigate } from "react-router-dom";
import { Star, Users, FileText } from "lucide-react";

import Avatar from "@/components/Avatar";
import CycleStatusCard from "@/components/CycleStatusCard";
import DashboardStatCard from "@/components/DashboardStatCard";
import CollaboratorCard from "@/components/CollaboratorCard";

import { useUser } from "@/contexts/UserContext";
import { daysLeft } from "@/utils/daysLeft";
import { formatPendingText } from "@/utils/formatPendingText";

import { useGestorDashboardData } from "./hooks/useGestorDashboardData";

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

  let evaluated = 0;

  if (cycleStatus === "aberto") {
    evaluated = collaborators.filter((c) => c.autoAssessment !== null).length;
  } else if (cycleStatus === "emRevisao") {
    evaluated = collaborators.filter((c) => c.managerScore !== null).length;
  } else if (cycleStatus === "finalizado") {
    evaluated = collaborators.filter((c) => c.comiteScore !== null).length;
  }

  const evaluationRate = Math.round((evaluated / total) * 100);
  const pendingEvaluations = total - evaluated;
  const autoEvaluated = collaborators.filter(
    (c) => c.autoAssessment !== null
  ).length;
  const pendingAutoEvaluations = collaborators.length - autoEvaluated;

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
            onClick={() =>
              cycleStatus == "finalizado"
                ? navigate(`/app/gestor/brutalfacts`)
                : navigate(`/app/gestor/colaboradores/`)
            }
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
                description={`${evaluationRate}% dos colaboradores já concluíram suas avaliações.`}
                progress={evaluationRate}
              />
              <DashboardStatCard
                type="managerReviews"
                title="Avaliações pendentes"
                description={formatPendingText(
                  pendingEvaluations,
                  "1 colaborador ainda não concluiu as avaliações.",
                  "{X} colaboradores ainda não concluíram as avaliações.",
                  "Nenhum colaborador com avaliações pendentes."
                )}
                value={pendingEvaluations}
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
                  pendingAutoEvaluations,
                  "1 colaborador não concluiu sua avaliação.",
                  "{X} colaboradores não concluíram suas avaliações.",
                  "Todos os colaboradores concluíram suas avaliações."
                )}
                value={pendingEvaluations}
                icon={<Users className="w-10 h-10" />}
              />
              <DashboardStatCard
                type="equalizacoes"
                title="Revisões pendentes"
                description={formatPendingText(
                  pendingEvaluations,
                  "1 revisão ainda está pendente.",
                  "{X} revisões ainda estão pendentes.",
                  "Nenhuma revisão pendente."
                )}
                value={pendingEvaluations}
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
                onClick={() => navigate("/app/gestor/brutalfacts")}
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
              to="/app/gestor/colaboradores"
              className="text-brand font-medium text-sm hover:underline transition-colors"
            >
              Ver mais
            </Link>
          </div>

          <div className="space-y-4">
            {collaborators.map((collaborator) => {
              let dynamicStatus: "Pendente" | "Finalizada";

              if (cycleStatus === "aberto") {
                dynamicStatus =
                  collaborator.autoAssessment !== null
                    ? "Finalizada"
                    : "Pendente";
              } else if (cycleStatus === "emRevisao") {
                dynamicStatus =
                  collaborator.managerScore !== null
                    ? "Finalizada"
                    : "Pendente";
              } else {
                dynamicStatus =
                  collaborator.comiteScore !== null ? "Finalizada" : "Pendente";
              }

              return (
                <CollaboratorCard
                  key={collaborator.id}
                  name={collaborator.name}
                  role={collaborator.position}
                  status={dynamicStatus}
                  autoAssessment={collaborator.autoAssessment}
                  managerScore={collaborator.managerScore}
                  finalScore={
                    cycleStatus === "finalizado"
                      ? collaborator.comiteScore
                      : undefined
                  }
                  gestorCard
                  onClickArrow={() =>
                    navigate(`/app/gestor/colaboradores/${collaborator.id}`)
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGestor;
