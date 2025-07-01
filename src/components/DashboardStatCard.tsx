import React from "react";
import type { ReactNode } from "react";
import {
  getScoreLabel,
  getColorByScore,
  getColorByGrowth,
} from "@/utils/scoreUtil";
import { FilePen, MoveDown, MoveUp } from "lucide-react";

interface DashboardStatCardProps {
  type:
    | "prazo"
    | "preenchimento"
    | "equalizacoes"
    | "currentScore"
    | "pendingReviews"
    | "growth"
    | "evaluations"
    | "managerReviews";
  title: string;
  description: string;
  icon?: ReactNode;
  progress?: number;
  value?: string | number;
  prazoDias?: number;
  bgColor?: string;
  onClick?: () => void;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  type,
  title,
  description,
  icon,
  progress = 0,
  value,
  prazoDias = 0,
  bgColor,
  onClick,
}) => {
  const baseStyle = `w-full max-w-full min-h-[150px] rounded-2xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4 ${
    bgColor ??
    (type === "pendingReviews" || type === "equalizacoes"
      ? "bg-brand"
      : "bg-white")
  }`;

  const renderContent = () => {
    switch (type) {
      case "currentScore": {
        const score = typeof value === "number" ? value : 0;
        const label = getScoreLabel(score);
        const color = getColorByScore(score);
        return (
          <div className={`${baseStyle} items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p
                className="text-text-muted text-sm border-l-4 pl-2"
                style={{ borderColor: color }}
              >
                {description}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-auto mt-2 sm:mt-4">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement, {
                    color,
                    fill: color,
                  })
                : icon}
              <div className="flex flex-col items-start">
                <span className="text-3xl font-bold" style={{ color }}>
                  {score.toFixed(1)}
                </span>

                <span className="text-base font-semibold" style={{ color }}>
                  {label}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "pendingReviews": {
        return (
          <div className={`${baseStyle} items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p className="text-text-muted text-sm border-l-4 border-red-500 pl-2">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-bold ml-auto mt-6 xl:mt-6">
              {icon}
              <span style={{ color: "red" }}>
                {value !== undefined
                  ? value.toString().padStart(2, "0")
                  : value}
              </span>
            </div>
          </div>
        );
      }

      case "equalizacoes": {
        return (
          <div
            className={`${baseStyle} text-white items-start ${
              onClick
                ? "cursor-pointer hover:opacity-90 transition-opacity"
                : ""
            }`}
            onClick={onClick}
          >
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-white text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p className="text-white text-sm border-l-4 border-white pl-2">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-bold ml-auto mt-6 xl:mt-6">
              {icon}
              {value}
            </div>
          </div>
        );
      }

      case "prazo": {
        return (
          <div className={`${baseStyle} items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p className="text-text-muted text-sm border-l-4 border-green-500 pl-2">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-3 text-green-600 font-bold ml-auto mt-2 sm:mt-4">
              <div className="w-10 h-10 flex-shrink-0">{icon}</div>
              <div className="flex flex-col items-center leading-none">
                <span className="text-3xl">
                  {prazoDias.toString().padStart(2, "0")}
                </span>
                <span className="text-base">dias</span>
              </div>
            </div>
          </div>
        );
      }

      case "preenchimento": {
        const raio = 40;
        const circunferencia = 2 * Math.PI * raio;
        const deslocamento = circunferencia - (progress / 100) * circunferencia;
        return (
          <div className={`${baseStyle} items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p className="text-text-muted text-sm border-l-4 border-[#08605f] pl-2">
                {description}
              </p>
            </div>
            <div
              className="w-20 h-20 relative flex items-center justify-center ml-auto mt-2 sm:mt-2"
              style={{ marginRight: "-15px" }}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r={raio}
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={raio}
                  stroke="#08605f"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={deslocamento}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[#08605f] font-bold text-xl">
                {progress}%
              </span>
            </div>
          </div>
        );
      }

      case "growth": {
        const growth = typeof value === "number" ? value : 0;
        const color = getColorByGrowth(growth);

        return (
          <div className={`${baseStyle} bg-white items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p
                className="text-text-muted text-sm border-l-4 pl-2"
                style={{ borderColor: color }}
              >
                {description}
              </p>
            </div>
            <div className="flex items-center ml-auto mt-4 sm:mt-6">
              {growth > 0 ? (
                <MoveUp className="w-10 h-10" style={{ color }} />
              ) : (
                <MoveDown className="w-10 h-10" style={{ color }} />
              )}
              <div className="flex flex-col items-start">
                <span className="text-3xl font-bold" style={{ color }}>
                  {growth > 0 ? "+" : ""}
                  {growth}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "evaluations": {
        const evaluations = typeof value === "number" ? value : 0;
        const color = "#08605f";

        return (
          <div className={`${baseStyle} bg-white items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p
                className="text-text-muted text-sm border-l-4 pl-2"
                style={{ borderColor: color }}
              >
                {description}
              </p>
            </div>
            <div className="flex items-center ml-auto gap-2 mt-4 sm:mt-6">
              <FilePen className="w-10 h-10" style={{ color }} />
              <div className="flex flex-col items-start">
                <span className="text-3xl font-bold" style={{ color }}>
                  {evaluations.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case "managerReviews": {
        const reviews = typeof value === "number" ? value : 0;
        const color = "#dc2626";

        return (
          <div className={`${baseStyle} bg-white items-start`}>
            <div className="flex-1 flex flex-col justify-start">
              <p className="font-bold text-black text-lg sm:text-xl mb-5">
                {title}
              </p>
              <p
                className="text-text-muted text-sm border-l-4 pl-2"
                style={{ borderColor: color }}
              >
                {description}
              </p>
            </div>
            <div className="flex items-center ml-auto gap-2 mt-4 sm:mt-6">
              <FilePen className="w-10 h-10" style={{ color }} />
              <div className="flex flex-col items-start">
                <span className="text-3xl font-bold" style={{ color }}>
                  {reviews.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default DashboardStatCard;
