import React from "react";
import { getColorByScore } from "@/utils/scoreUtil";


interface CollaboratorCardProps {
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  assessment360?: number | null;
  managerScore: number | null;
  finalScore?: number | "-" | null;
  gestorCard?: boolean;
  brutalFactsCard?: boolean;
  rhCard?: boolean;  
  comiteCard?: boolean; 
  onClickArrow?: () => void;
  esconderSetaXL1600?: boolean;
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({
  name,
  role,
  status,
  autoAssessment,
  assessment360,
  managerScore,
  finalScore,
  gestorCard = false,
  brutalFactsCard = false,
  rhCard = false,
  comiteCard = false,
  onClickArrow,
  esconderSetaXL1600 = false,
}) => {
  const statusColorClass =
    status === "Pendente"
      ? "bg-yellow-100 text-red-500"
      : "bg-green-100 text-green-800";

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("");
  };

  const formatScore = (score: number | null | undefined) =>
    typeof score === "number" ? score.toFixed(1) : "-";

  const fixedRhComiteColor = "#08605f";

  return (
    <div className="flex items-center p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center mr-6 min-w-[200px]">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700 mr-3">
          {getInitials(name)}
        </div>
        <div className="w-[150px] xl:w-[200px]">
          <p className="font-semibold text-gray-800 leading-tight">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>

      <div
        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColorClass}`}
      >
        {status}
      </div>

      <div className="flex flex-wrap gap-4 justify-end xl:justify-start xl:flex-nowrap items-center ml-auto">
        <div className="flex items-center min-w-[140px] space-x-2">
          <span className="text-gray-500 text-sm whitespace-nowrap">
            Autoavaliação
          </span>
          <span className="font-bold text-gray-800 text-sm inline-block bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
            {formatScore(autoAssessment)}
          </span>
        </div>

        {!gestorCard && (
          <div className="flex items-center min-w-[140px] space-x-2">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              Avaliação 360
            </span>
            <span className="font-bold text-gray-800 text-sm inline-block bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
              {formatScore(assessment360)}
            </span>
          </div>
        )}

        <div className="flex items-center min-w-[140px] space-x-2">
          <span className="text-gray-500 text-sm whitespace-nowrap">
            Nota gestor
          </span>
          <span className="font-bold text-gray-800 text-sm inline-block bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
            {formatScore(managerScore)}
          </span>
        </div>

        {finalScore !== undefined && (
          <div className="flex items-center min-w-[140px] space-x-2">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              Nota final
            </span>
            <span
              className={`font-bold text-sm inline-block px-2 py-0.5 rounded w-10 text-center ${
                typeof finalScore === "number" &&
                (gestorCard || brutalFactsCard || rhCard || comiteCard)
                  ? "text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
              style={
                typeof finalScore === "number"
                  ? gestorCard || brutalFactsCard
                    ? { backgroundColor: getColorByScore(finalScore) }
                    : rhCard || comiteCard
                    ? { backgroundColor: fixedRhComiteColor }
                    : {}
                  : {}
              }
            >
              {typeof finalScore === "number" ? finalScore.toFixed(1) : "-"}
            </span>
          </div>
        )}

        <button
          className={`p-2 rounded-full bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 border-0 ${
            esconderSetaXL1600 ? "xl1600:hidden" : ""
          }`}
          onClick={onClickArrow}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CollaboratorCard;
