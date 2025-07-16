interface Score {
  cycleId: string;
  finalScore: number | null;
  createdAt: string;
}

export function calcularGrowth(
  colaboradores: { allScores: Score[] }[],
  cicloAtualId: string
): {
  growth: number;
  hasGrowthData: boolean;
  growthBaseCount: number;
} {
  const atual: number[] = [];
  const anterior: number[] = [];

  colaboradores.forEach((colab) => {
    const atualScore = colab.allScores.find((s) => s.cycleId === cicloAtualId);
    const anteriorScore = colab.allScores
      .filter((s) => s.cycleId !== cicloAtualId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    if (atualScore?.finalScore != null && anteriorScore?.finalScore != null) {
      atual.push(atualScore.finalScore);
      anterior.push(anteriorScore.finalScore);
    }
  });

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const avgAtual = avg(atual);
  const avgAnterior = avg(anterior);

  const base = colaboradores.filter(
    (c) => c.allScores.filter((s) => s.finalScore !== null).length >= 2
  ).length;

  const growth =
    avgAnterior && avgAnterior !== 0
      ? (avgAtual! - avgAnterior) / avgAnterior
      : null;

  return {
    growth: growth !== null ? Number(growth.toFixed(2)) : 0,
    hasGrowthData: base > 0,
    growthBaseCount: base,
  };
}
