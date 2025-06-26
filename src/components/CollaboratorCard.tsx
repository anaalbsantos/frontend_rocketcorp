import React from "react";
import { getColorByScore } from "@/utils/scoreUtil";

interface CollaboratorCardProps {
  name: string;
  role: string;
  status: "Pendente" | "Finalizada";
  autoAssessment: number | null;
  assessment360?: number | null;
  managerScore: number | null;
  finalScore?: number | "-";
  gestorCard?: boolean;
  brutalFactsCard?: boolean;
  onClickArrow?: () => void;
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
  onClickArrow,
}) => {
  const statusColorClass =
    status === "Pendente"
      ? "bg-yellow-100 text-red-500"
      : "bg-green-100 text-green-800";

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  };

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
            {autoAssessment !== null ? autoAssessment.toFixed(1) : "-"}
          </span>
        </div>
        {gestorCard !== true && (
          <div className="flex items-center min-w-[140px] space-x-2">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              Avaliação 360
            </span>
            <span className="font-bold text-gray-800 text-sm inline-block bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
              {assessment360 !== undefined && assessment360 !== null
                ? assessment360.toFixed(1)
                : "-"}
            </span>
          </div>
        )}
        <div className="flex items-center min-w-[140px] space-x-2">
          <span className="text-gray-500 text-sm whitespace-nowrap">
            Nota gestor
          </span>
          <span className="font-bold text-gray-800 text-sm inline-block bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
            {managerScore !== null ? managerScore.toFixed(1) : "-"}
          </span>
        </div>
        {gestorCard !== true && (
          <div className="flex items-center min-w-[140px] space-x-2">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              Nota final
            </span>
            <span
              className={`font-bold text-sm inline-block px-2 py-0.5 rounded w-10 text-center ${
                finalScore === "-" || finalScore === undefined
                  ? "bg-gray-100 text-gray-800"
                  : "bg-[#08605f] text-white"
              }`}
              style={
                finalScore !== "-" &&
                finalScore !== undefined &&
                brutalFactsCard
                  ? { backgroundColor: getColorByScore(finalScore) }
                  : {}
              }
            >
              {finalScore === "-" || finalScore === undefined
                ? "-"
                : finalScore.toFixed(1)}
            </span>
          </div>
        )}

        <button
          className="p-2 rounded-full bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 border-0"
          onClick={onClickArrow}
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
