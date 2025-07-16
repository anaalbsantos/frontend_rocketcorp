import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface NotificationCardProps {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  type?: string;
  onClick: () => void;
}

const typeLabels: Record<string, string> = {
  EVALUATION_DUE: "Avaliações Pendentes",
  GOAL_DEADLINE_APPROACHING: "Prazo de Metas",
  SURVEY_AVAILABLE: "Nova Pesquisa",
  CYCLE_ENDING: "Fim do Ciclo",
  MENTORSHIP_EVALUATION: "Avaliação de Mentoria",
  SYSTEM_ANNOUNCEMENT: "Comunicado do Sistema",
};

export const NotificationCard = ({
  message,
  createdAt,
  read,
  type,
  onClick,
}: NotificationCardProps) => {
  const label = type ? typeLabels[type] || type : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm cursor-pointer border border-gray-200 hover:bg-gray-50 transition"
      )}
    >
      <div className="w-3 h-3 mt-1">
        {!read && <span className="block w-2 h-2 rounded-full bg-red-500" />}
      </div>

      <div className="flex-1">
        {label && <p className="text-xs text-gray-400 mb-1">{label}</p>}
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(createdAt), "dd/MM/yyyy HH:mm")}
        </p>
      </div>
    </div>
  );
};
