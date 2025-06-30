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
  position: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  managerScore: number | null;
  comiteScore: number | null;
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
  const [growth, setGrowth] = useState<number>(0);
  const [hasGrowthData, setHasGrowthData] = useState<boolean>(false);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus | null>(null);
  const [growthBaseCount, setGrowthBaseCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{
          ciclo_atual_ou_ultimo: Cycle;
          usuarios: {
            id: string;
            name: string;
            role: string;
            position: {
              name: string;
            };
            managerId: string;
            scorePerCycle: {
              cycleId: string;
              selfScore: number | null;
              leaderScore: number | null;
              finalScore: number | null;
              createdAt: string;
            }[];
          }[];
        }>("/users");

        const { ciclo_atual_ou_ultimo, usuarios } = res.data;
        const status = getCycleStatus(ciclo_atual_ou_ultimo);

        const filtered = usuarios.filter(
          (u) => u.managerId === userId && u.role === "COLABORADOR"
        );
        console.log(
          "Usuários filtrados (COLABORADORES do gestor):",
          filtered.map((u) => u.name)
        );
        filtered.forEach((u) => {
          console.log(`Usuário: ${u.name}`);
          console.log(
            "Ciclos disponíveis:",
            u.scorePerCycle.map((s) => s.cycleId)
          );
          console.log(
            "FinalScores:",
            u.scorePerCycle.map((s) => s.finalScore)
          );
        });

        const enriched = filtered.map((u) => {
          if (u.name === "Alice Silva") {
            u.scorePerCycle.push({
              cycleId: "cycle2024_2",
              selfScore: 4,
              leaderScore: 3.5,
              finalScore: 4.1,
              createdAt: "2024-12-15T00:00:00Z",
            });
          }
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
            position: u.position.name,
            autoAssessment: score.selfScore ?? null,
            managerScore: score.leaderScore ?? null,
            comiteScore: score.finalScore ?? null,
            status: statusText,
            allScores: u.scorePerCycle,
            selfDone,
          };
        });
        const finalScoresAtual: number[] = [];
        const finalScoresAnterior: number[] = [];

        enriched.forEach((colab) => {
          const atual = colab.allScores.find(
            (s) => s.cycleId === ciclo_atual_ou_ultimo.id
          );
          const anterior = colab.allScores
            .filter((s) => s.cycleId !== ciclo_atual_ou_ultimo.id)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0];

          if (atual?.finalScore != null && anterior?.finalScore != null) {
            finalScoresAtual.push(atual.finalScore);
            finalScoresAnterior.push(anterior.finalScore);
          }
        });

        const avgAtual = finalScoresAtual.length
          ? finalScoresAtual.reduce((a, b) => a + b, 0) /
            finalScoresAtual.length
          : 0;

        const avgAnterior = finalScoresAnterior.length
          ? finalScoresAnterior.reduce((a, b) => a + b, 0) /
            finalScoresAnterior.length
          : 0;

        const colabsComHistorico = enriched.filter((colab) => {
          const ciclosComNota = colab.allScores.filter(
            (s) => s.finalScore !== null
          );
          return ciclosComNota.length >= 2;
        }).length;
        console.log(
          "Colaboradores com 2 ou mais ciclos com finalScore:",
          colabsComHistorico
        );

        const hasValidGrowth = colabsComHistorico > 0;

        const calculatedGrowth = hasValidGrowth ? avgAtual - avgAnterior : NaN;

        setGrowth(Number(calculatedGrowth.toFixed(1)));
        setHasGrowthData(hasValidGrowth);

        setCollaborators(enriched);

        const scoreList =
          status === "finalizado"
            ? enriched
                .map((c) => c.comiteScore)
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
