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
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const base = colaboradores.filter(
    (c) => c.allScores.filter((s) => s.finalScore !== null).length >= 2
  ).length;

  const growth = avg(atual) - avg(anterior);

  return {
    growth: Number(growth.toFixed(1)),
    hasGrowthData: base > 0,
    growthBaseCount: base,
  };
}
