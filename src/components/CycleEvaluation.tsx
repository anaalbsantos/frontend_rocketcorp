import { Sparkles } from "lucide-react";
import type { CycleInfos } from "@/types";
import { getColorByScore, getScoreLabel } from "@/utils/scoreUtil";

const CycleEvaluation = ({
  finalScore,
  name,
  status,
  feedback,
}: CycleInfos & { status: string }) => {
  const isFinalizado = status === "Finalizado";

  return (
    <div className="flex flex-row w-full border border-[#D9D9D9] rounded-xl p-3 bg-white justify-between gap-5">
      <div className="bg-[#F8F8F8] rounded-lg flex flex-col items-center justify-center min-w-20 sm:min-w-28">
        {finalScore || status === "Finalizado" ? (
          <>
            <h1
              className="text-2xl font-bold sm:text-3xl"
              style={{ color: getColorByScore(finalScore) }}
            >
              {finalScore.toFixed(1)}
            </h1>
            <p
              className="text-xs sm:text-sm font-bold"
              style={{ color: getColorByScore(finalScore) }}
            >
              {getScoreLabel(finalScore)}
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold sm:text-3xl text-text-primary">
            -
          </h1>
        )}
      </div>
      <div className="flex flex-col flex-grow gap-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
          <h1 className="text-base sm:text-lg font-bold text-[#1D1D1D]">
            Ciclo {name}
          </h1>
          <span
            className={`${
              isFinalizado
                ? "bg-[#BEE7CF] text-score-great"
                : "bg-[#FEEC6580] text-score-regular"
            } text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg break-all leading-none`}
          >
            {status}
          </span>
        </div>
        <div className="flex items-start bg-[#F8F8F8] rounded-sm">
          <div className="border-l-4 border-[#08605F] h-full rounded-sm"></div>
          <div className="flex flex-row p-2">
            <Sparkles
              size={14}
              color="#08605F"
              fill="#08605F"
              className="min-w-4"
            />
            <div className="flex flex-col ml-2 items-start text-start gap-1">
              <h2 className="text-xs font-bold text-[#1D1D1DBF] leading-none">
                Resumo
              </h2>
              <p className="text-[11px] text-[#5C5C5C]">
                {isFinalizado ? feedback : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleEvaluation;
