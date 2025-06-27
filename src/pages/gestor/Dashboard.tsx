import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import CycleStatusCard from "@/components/CycleStatusCard";
import DashboardStatCard from "@/components/DashboardStatCard";
import CollaboratorCard from "@/components/CollaboratorCard";
import { Star, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/api";
import { useUser } from "@/contexts/UserContext";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  managerScore: number | null;
  finalScore: number | null;
  selfDone: boolean;
}

interface Cycle {
  id: string;
  name: string;
  endDate: string;
  reviewDate: string;
}

type CycleStatus = "aberto" | "emRevisao" | "finalizado";

const getCycleStatus = (cycle: Cycle): CycleStatus => {
  const now = new Date();
  const end = new Date(cycle.endDate);
  const review = new Date(cycle.reviewDate);

  if (now < review) return "aberto";
  if (now >= review && now < end) return "emRevisao";
  return "finalizado";
};

const daysLeft = (reviewDate: string): number => {
  const end = new Date(reviewDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const DashboardGestor = () => {
  const { userName, userId } = useUser();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{
          ciclo_atual_ou_ultimo: Cycle;
          usuarios: {
            id: string;
            name: string;
            role: string;
            managerId: string;
            scorePerCycle: {
              cycleId: string;
              selfScore: number | null;
              leaderScore: number | null;
              finalScore: number | null;
            }[];
          }[];
        }>("/users");

        const { ciclo_atual_ou_ultimo, usuarios } = res.data;
        const status = getCycleStatus(ciclo_atual_ou_ultimo);

        const filtered = usuarios.filter(
          (u) => u.managerId === userId && u.role === "COLABORADOR"
        );

        const enriched = filtered.map((u) => {
          const score = u.scorePerCycle.find(
            (s) => s.cycleId === ciclo_atual_ou_ultimo.id
          ) || { selfScore: null, leaderScore: null, finalScore: null };

          const selfDone = score.selfScore !== null;
          const managerDone = score.leaderScore !== null;

          let statusText: "Pendente" | "Finalizada" = "Pendente";

          if (status === "aberto" && selfDone) {
            statusText = "Finalizada";
          } else if (status === "emRevisao" && managerDone) {
            statusText = "Finalizada";
          } else if (status === "finalizado" && selfDone && managerDone) {
            statusText = "Finalizada";
          }

          return {
            id: u.id,
            name: u.name,
            role: u.role,
            autoAssessment: score.selfScore ?? null,
            managerScore: score.leaderScore ?? null,
            finalScore:
              status === "finalizado" && score.finalScore !== null
                ? score.finalScore
                : "-",
            status: statusText,
            selfDone,
          };
        });

        setCollaborators(enriched);

        const scoreList =
          status === "finalizado"
            ? enriched
                .map((c) => c.finalScore)
                .filter((v): v is number => v !== null)
            : enriched
                .map((c) => c.managerScore)
                .filter((v): v is number => v !== null);

        const average = scoreList.length
          ? scoreList.reduce((a, b) => a + b, 0) / scoreList.length
          : 0;

        setCurrentScore(Number(average.toFixed(1)));
        setCycle({ ...ciclo_atual_ou_ultimo });
        setCycleStatus(status);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard do gestor", err);
      }
    };

    fetchData();
  }, [userId]);

  const total = collaborators.length || 1;
  const selfEvaluated = collaborators.filter((c) => c.selfDone).length;
  const managerEvaluated = collaborators.filter(
    (c) => c.managerScore !== null
  ).length;

  const selfEvaluationRate = Math.round((selfEvaluated / total) * 100);
  const pendingSelfEvaluations = total - selfEvaluated;
  const pendingManagerEvaluations = total - managerEvaluated;

  const formatPendingText = (
    qtd: number,
    singular: string,
    plural: string,
    none: string
  ) => {
    if (qtd === 0) return none;
    if (qtd === 1) return singular;
    return plural.replace("{X}", qtd.toString());
  };

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
                description={`Nota consolidada dos ciclos anteriores.`}
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
                description="Crescimento de +0.3 comparação ao ciclo 2024.1"
                value={collaborators.length}
              />
              <DashboardStatCard
                type="equalizacoes"
                title="Brutal Facts"
                description="Veja o desempenho de seus liderados"
                value="-"
                icon={<FileText className="w-10 h-10" />}
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
