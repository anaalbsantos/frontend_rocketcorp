import React from "react";
import type { ReactNode } from "react";

interface DashboardStatCardProps {
  type: "prazo" | "preenchimento" | "equalizacoes";
  title: string;
  description: string;
  icon?: ReactNode;
  progress?: number;
  value?: string | number;
  prazoDias?: number;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  type,
  title,
  description,
  icon,
  progress = 0,
  value,
  prazoDias = 0,
}) => {
  const baseStyle =
    "w-[482px] h-[150px] rounded-[12px] shadow-md p-6 flex items-center";

  const renderContent = () => {
    switch (type) {
      case "prazo": {
        return (
          <div className={`${baseStyle} bg-white`}>
            <div className="flex-grow">
              <p className="font-bold text-black text-base mb-4 mt-1">{title}</p>
              <p className="font-semibold text-gray-800 text-xs border-l-4 border-green-500 pl-1 mb-4">
                {description}
              </p>
            </div>
            <div className="flex items-center text-green-600 font-bold ml-4">
              <div className="w-[43px] h-[43px] mr-3 flex-shrink-0">{icon}</div>
              <div className="flex flex-col items-center leading-none">
                <span className="text-4xl">{prazoDias}</span>
                <span className="text-xl mt-0">dias</span>
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
          <div className={`${baseStyle} bg-white justify-between`}>
            <div className="flex-grow pr-4">
              <p className="font-bold text-black text-base mb-4 mt-1">{title}</p>
              <p className="font-semibold text-gray-800 text-xs border-l-4 border-[#08605f] pl-1 mb-4">
                {description}
              </p>
            </div>
            <div
              className="w-28 h-28 relative flex items-center justify-center shrink-0"
              style={{ marginRight: "-15px" }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
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

      case "equalizacoes": {
        return (
          <div
            className={`${baseStyle} bg-gradient-to-r from-green-500 to-green-600 text-white justify-between`}
          >
            <div>
              <p className="font-bold text-white text-base mb-4 mt-1">{title}</p>
              <p className="font-semibold text-white text-xs border-l-4 border-white pl-1 pt-2 pb-2 mb-4">
                {description}
              </p>
            </div>
            <div className="flex items-center text-5xl font-bold mr-2">
              {icon}
              {value}
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
