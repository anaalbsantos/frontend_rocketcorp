import GoalCard from "@/components/GoalCard";
import { PlusIcon } from "lucide-react";

const Goals = () => {
  return (
    <div>
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <h3 className="font-bold">Objetivos</h3>
      </div>
      <div className="flex flex-col p-6 gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Acompanhamento do PDI</h3>
          <button className="bg-brand text-white text-sm flex gap-1 items-center">
            <span>
              <PlusIcon size={20} />
            </span>
            Novo Objetivo
          </button>
        </div>
        <GoalCard
          title="Melhorar habilidades de liderança"
          description="Desenvolver competências para liderar projetos e equipes com mais eficiência."
          actions={[
            {
              description: "Participar de curso de liderança",
              completed: true,
              deadline: "30/06/2024",
            },
            {
              description: "Reuniões quinzenais com mentor",
              completed: false,
              deadline: "15/07/2024",
            },
            {
              description: "Dar feedbacks construtivos para colegas",
              completed: false,
              deadline: "31/07/2024",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Goals;
