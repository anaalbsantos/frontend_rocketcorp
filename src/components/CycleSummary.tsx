import { getColorByScore } from "@/utils/scoreUtil";
import { Progress } from "@/components/ui/progress";
import clsx from "clsx";
import { Sparkles } from "lucide-react";

interface CycleSummaryProps {
  semester: string;
  status: "Finalizado" | "Em andamento";
  finalScore?: number;
  autoevaluationScore?: number;
  evaluation360Score?: number;
  evaluationLeaderScore?: number;
  summary?: string;
}

const CycleSummary = ({
  semester,
  status,
  finalScore,
  autoevaluationScore,
  evaluation360Score,
  evaluationLeaderScore,
  summary,
}: CycleSummaryProps) => {
  const color = getColorByScore(autoevaluationScore || 0);
  const isFinalizado = status === "Finalizado";

  return (
    <div className="flex flex-col flex-grow p-4 gap-6 border rounded-2xl ">
      <div className="flex gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <p className="font-bold"> Ciclo {semester}</p>
          <span
            className={`$${
              isFinalizado
                ? " text-score-great bg-score-great/25"
                : " text-score-regular bg-score-regular/25"
            } text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg break-all leading-none`}
          >
            {status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-text-muted text-xs">Nota Final</p>
          {isFinalizado && finalScore ? (
            <p
              className="text-white font-bold text-sm py-1 px-2 rounded-lg"
              style={{ backgroundColor: getColorByScore(finalScore) }}
            >
              {finalScore.toFixed(1)}
            </p>
          ) : (
            <p className="text-text-muted font-bold text-md bg-border px-3 rounded-md">
              -
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-text-muted font-bold text-xs">Autoavaliação</p>
            <p
              className={clsx(`text-xs font-semibold`, {
                "text-text-primary": !autoevaluationScore,
                "text-score-bad": color === "#E04040",
                "text-score-regular": color === "#F5C130",
                "text-score-good": color === "#24A19F",
                "text-score-great": color === "#208A2A",
              })}
            >
              {autoevaluationScore?.toFixed(1) || "-"}
            </p>
          </div>
          <Progress
            value={((autoevaluationScore || 0) / 5) * 100}
            className={clsx(`h-4 [&>div]:rounded-full`, {
              "[&>div]:bg-score-bad": color === "#E04040",
              "[&>div]:bg-score-regular": color === "#F5C130",
              "[&>div]:bg-score-good": color === "#24A19F",
              "[&>div]:bg-score-great": color === "#208A2A",
            })}
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-text-muted font-bold text-xs">Avaliação 360</p>
            <p className="text-text-muted text-xs text-right">
              {isFinalizado
                ? evaluation360Score?.toFixed(1) ?? "-"
                : "Disponível após o fim do ciclo"}
            </p>
          </div>
          <Progress
            value={isFinalizado ? ((evaluation360Score || 0) / 5) * 100 : 0}
            className={"h-4 [&>div]:rounded-full [&>div]:bg-brand/70"}
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-text-muted font-bold text-xs">
              Avaliação do Gestor
            </p>
            <p className="text-text-muted text-xs text-right">
              {isFinalizado
                ? evaluationLeaderScore ?? "-"
                : "Disponível após o fim do ciclo"}
            </p>
          </div>
          <Progress
            value={isFinalizado ? ((evaluationLeaderScore || 0) / 5) * 100 : 0}
            className={"h-4 [&>div]:rounded-full [&>div]:bg-brand"}
          />
        </div>
      </div>

      <div className="flex bg-[#F8F8F8] rounded-sm">
        <div className="border-r-4 border-brand rounded-sm self-stretch"></div>
        <div className="flex flex-row p-3">
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
              {isFinalizado ? summary || "-" : "Disponível após o fim do ciclo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleSummary;
