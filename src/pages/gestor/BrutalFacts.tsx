import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

import api from "@/api/api";
import { useUser } from "@/contexts/UserContext";
import DashboardStatCard from "@/components/DashboardStatCard";
import Chart from "@/components/Chart";
import CollaboratorCard from "@/components/CollaboratorCard";
import SearchInput from "@/components/SearchInput";
import InsightBox from "@/components/InsightBox";

interface PeerScore {
  value: number;
}

interface Score {
  cycleId: string;
  finalScore: number | null;
  leaderScore: number | null;
  selfScore: number | null;
  peerScores?: PeerScore[];
}

interface Collaborator {
  id: string;
  name: string;
  position: {
    id: string;
    name: string;
    track: string;
  } | null;
  scorePerCycle: Score[];
  peerAvg?: number | null;
}

interface HistoricalCycle {
  id: string;
  name: string;
}

interface BrutalFactsResponse {
  usuarios: Collaborator[];
  ciclos: HistoricalCycle[];
}

const BrutalFacts = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUser();
  const [analiseEvolucao, setAnaliseEvolucao] = useState<string | null>(null);
  const [resumoExecutivo, setResumoExecutivo] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [historicalAverage, setHistoricalAverage] = useState<HistoricalCycle[]>(
    []
  );
  const [growth, setGrowth] = useState<number | null>(null);

  useEffect(() => {
    const fetchBrutalFacts = async () => {
      try {
        const { data }: { data: BrutalFactsResponse } = await api.get(
          `/users/${userId}/brutalFacts`
        );

        const ordered = [...(data.ciclos || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setHistoricalAverage(ordered);

        const currentCycleId = ordered[ordered.length - 1]?.id ?? null;
        if (currentCycleId) {
          try {
            const { data } = await api.get(
              `/genai/evolucao-equipe/gestor/cycle/${currentCycleId}`
            );
            setAnaliseEvolucao(data.analiseEvolucao || null);
          } catch (error) {
            console.error("Erro ao buscar análise de evolução:", error);
            setAnaliseEvolucao(null);
          }
          try {
            const { data } = await api.get(
              `/genai/brutal-facts/gestor/resumo/cycle/${currentCycleId}`
            );
            setResumoExecutivo(data.resumoExecutivo || null);
          } catch (error) {
            console.error("erro ao buscar resumo executivo:", error);
            setResumoExecutivo(null);
          }
        }

        const enriched = data.usuarios.map((colab) => {
          const peerScores =
            colab.scorePerCycle.find((s) => s.cycleId === currentCycleId)
              ?.peerScores ?? [];
          const peerAvg = peerScores.length
            ? Number(
                (
                  peerScores.reduce((acc, p) => acc + p.value, 0) /
                  peerScores.length
                ).toFixed(1)
              )
            : null;
          return { ...colab, peerAvg };
        });

        setCollaborators(enriched);

        // calcular growth com base nas médias reais dos ciclos anteriores
        if (ordered.length >= 2) {
          const lastId = ordered[ordered.length - 1].id;
          const prevId = ordered[ordered.length - 2].id;

          const lastScores = enriched
            .map(
              (c) =>
                c.scorePerCycle.find((s) => s.cycleId === lastId)?.finalScore
            )
            .filter((v): v is number => v !== null && v !== undefined);

          const prevScores = enriched
            .map(
              (c) =>
                c.scorePerCycle.find((s) => s.cycleId === prevId)?.finalScore
            )
            .filter((v): v is number => v !== null && v !== undefined);

          const avgLast =
            lastScores.length > 0
              ? lastScores.reduce((a, b) => a + b, 0) / lastScores.length
              : null;

          const avgPrev =
            prevScores.length > 0
              ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length
              : null;

          if (avgLast !== null && avgPrev !== null && avgPrev !== 0) {
            const diff = avgLast - avgPrev;
            setGrowth(Number(diff.toFixed(2)));
          } else {
            setGrowth(null);
          }
        } else {
          setGrowth(null);
        }
      } catch (err) {
        console.error("erro ao buscar dados do brutal facts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchBrutalFacts();
  }, [userId]);

  const currentCycleId =
    historicalAverage[historicalAverage.length - 1]?.id ?? null;
  const currentCycleName =
    historicalAverage[historicalAverage.length - 1]?.name ?? "-";

  const finalScores = collaborators
    .map(
      (colab) =>
        colab.scorePerCycle.find((s) => s.cycleId === currentCycleId)
          ?.finalScore
    )
    .filter((v): v is number => v !== null && v !== undefined);

  const mediaFinal =
    finalScores.length > 0
      ? Number(
          (
            finalScores.reduce((acc, score) => acc + score, 0) /
            finalScores.length
          ).toFixed(1)
        )
      : 0;

  const numFinalScores = finalScores.length;

  const growthDescription = (() => {
    if (numFinalScores === 0) return "Sem avaliações no ciclo atual";
    if (numFinalScores === 1) return "Nota com base em 1 colaborador";
    return `Nota com base em ${numFinalScores} colaboradores`;
  })();

  const filteredColaboradores = collaborators.filter((colab) =>
    colab.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = historicalAverage.map((cycle) => {
    const scores = collaborators
      .map(
        (colab) =>
          colab.scorePerCycle.find((s) => s.cycleId === cycle.id)?.finalScore
      )
      .filter((v): v is number => v !== null && v !== undefined);

    const average =
      scores.length > 0
        ? scores.reduce((acc, s) => acc + s, 0) / scores.length
        : 0;

    return {
      semester: cycle.name,
      score: average,
    };
  });
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="bg-gray-100 min-h-screen pb-8 scrollbar">
      <div className="shadow-sm bg-white px-6 py-4 mb-6 max-w-[1700px] mx-auto w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Brutal Facts</h2>
        </div>
      </div>

      <div className="space-y-6 px-4 sm:px-8 max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-[260px]">
          <DashboardStatCard
            title="Nota média geral"
            description={`Média das avaliações do ciclo ${currentCycleName}`}
            value={mediaFinal}
            type="currentScore"
            icon={<Star className="w-10 h-10" />}
          />
          <DashboardStatCard
            title="Desempenho de liderados"
            description={
              growth === null
                ? "Sem dados suficientes para comparar com ciclo anterior"
                : growthDescription
            }
            value={growth === null ? "-" : growth}
            type="growth"
          />
          <DashboardStatCard
            title="Liderados avaliados"
            description={
              numFinalScores === 0
                ? "Nenhum colaborador avaliado neste ciclo"
                : `${numFinalScores} colaborador${
                    numFinalScores > 1 ? "es" : ""
                  } avaliados neste ciclo`
            }
            value={numFinalScores}
            type="evaluations"
          />
        </div>

        <div className="bg-white p-5 rounded-lg">
          <h3 className="font-bold mb-2">Resumo</h3>
          <InsightBox>
            {resumoExecutivo ??
              "Resumo executivo da equipe não disponível para este ciclo."}
          </InsightBox>
        </div>

        <div className="bg-white p-5 rounded-lg">
          <h3 className="font-bold mb-4">Desempenho</h3>
          <Chart chartData={chartData} height="h-[200px]" barSize={50} />
          <InsightBox>
            {analiseEvolucao ??
              "Análise de evolução da equipe não disponível para este ciclo."}
          </InsightBox>
        </div>

        <div className="bg-white p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Resumo de equalizações</h3>
            <div className="flex gap-2 items-center">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar"
                className="w-64"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredColaboradores.map((colab) => {
              const score = colab.scorePerCycle.find(
                (s) => s.cycleId === currentCycleId
              );

              return (
                <CollaboratorCard
                  key={colab.id}
                  name={colab.name}
                  role={colab.position?.name ?? "Sem cargo"}
                  status="Finalizada"
                  autoAssessment={score?.selfScore ?? null}
                  managerScore={score?.leaderScore ?? null}
                  finalScore={score?.finalScore ?? null}
                  assessment360={colab.peerAvg ?? null}
                  brutalFactsCard
                  onClickArrow={() =>
                    navigate(`/app/gestor/colaboradores/${colab.id}`)
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

export default BrutalFacts;
