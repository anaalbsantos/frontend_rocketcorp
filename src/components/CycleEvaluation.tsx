import { Sparkles } from "lucide-react";
import type { Evaluation } from "@/types";
import { getColorByScore } from "@/utils/scoreUtil";

const evaluationByScore = (score: number) => {
  if (score >= 4.5) {
    return "Great";
  } else if (score >= 3.5 && score < 4.5) {
    return "Good";
  } else if (score >= 2.5 && score < 3.5) {
    return "Regular";
  } else {
    return "Insufficient";
  }
};

const CycleEvaluation = ({ score, semester, status, summary }: Evaluation) => {
  return (
    <div className="flex flex-row w-full border border-[#D9D9D9] rounded-xl p-3 bg-white justify-between gap-5">
      <div
        className={`bg-[#F8F8F8] rounded-lg flex flex-col items-center justify-center min-w-28`}
      >
        {status === "Finalizado" ? (
          <>
            <h1
              className="text-2xl font-bold sm:text-3xl"
              style={{ color: getColorByScore(score) }}
            >
              {score.toFixed(1)}
            </h1>
            <p
              className="text-xs sm:text-sm font-bold"
              style={{ color: getColorByScore(score) }}
            >
              {evaluationByScore(score)}
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold sm:text-3xl text-text-primary">
            -
          </h1>
        )}
      </div>
      <div className="flex flex-col flex-grow gap-2">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-lg sm:text-base font-bold text-[#1D1D1D]">
            Ciclo {semester}
          </h1>
          <span
            className={`${
              status === "Finalizado"
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
            <Sparkles size={14} color="#08605F" fill="#08605F" />
            <div className="flex flex-col ml-2 items-start text-start gap-1">
              <h2 className="text-xs font-bold text-[#1D1D1DBF] leading-none">
                Resumo
              </h2>
              <p className="text-[11px] text-[#5C5C5C]">{summary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleEvaluation;
