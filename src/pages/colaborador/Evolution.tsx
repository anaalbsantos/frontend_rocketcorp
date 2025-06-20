import DashboardStatCard from "@/components/DashboardStatCard";
import { Star } from "lucide-react";

const Evolution = () => {
  const currentScore = 4.5;
  const growth = 0.3;
  const evaluations = 4;

  return (
    <div>
      <div className="bg-white flex flex-col justify-between  border-b border-gray-200 shadow-sm">
        <div className="flex justify-between p-6">
          <h3 className="font-bold">Evolução</h3>
        </div>
      </div>
      <div className="flex flex-row p-6 gap-2">
        <DashboardStatCard
          type="currentScore"
          title="Nota atual"
          description="Nota final do ciclo realizado em 2024.2."
          value={currentScore}
          icon={<Star className="w-10 h-10" />}
        />
        <DashboardStatCard
          type="growth"
          title="Crescimento"
          description="Em comparação ao ciclo de 2024.1"
          value={growth}
        />
        <DashboardStatCard
          type="evaluations"
          title="Avaliações Realizadas"
          description="Total de avaliações"
          value={evaluations}
        />
      </div>
    </div>
  );
};

export default Evolution;
