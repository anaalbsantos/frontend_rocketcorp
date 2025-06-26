import React, { useState, useEffect, useRef } from "react";
import { getColorByScore } from "@/utils/scoreUtil";
import { Progress } from "@/components/ui/progress";
import clsx from "clsx";
import { Sparkles, Star, FileText, Edit } from "lucide-react";

interface ScoreInputSectionProps {
  autoevaluationScore: number;
  managerEvaluationScore: number;
  evaluation360Score: number;
  summaryText: string;
  notaFinal: number | null;
  isEditable: boolean;
  status: "Pendente" | "Finalizado";
  isVisible?: boolean;
  onScoreChange?: (score: number | null) => void;
  onJustificationChange?: (justification: string) => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onConcluir?: (notaEstrelas: number) => void;
}

const ScoreInputSection: React.FC<ScoreInputSectionProps> = ({
  autoevaluationScore,
  managerEvaluationScore,
  evaluation360Score,
  summaryText,
  notaFinal,
  isEditable,
  status,
  isVisible = true,
  onScoreChange,
  onJustificationChange,
  onDownload,
  onEdit,
  onConcluir,
}) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [justification, setJustification] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");
  const [shouldRenderContent, setShouldRenderContent] = useState(isVisible);

  useEffect(() => { setJustification(summaryText); }, [summaryText]);
  useEffect(() => { setSelectedScore(notaFinal); }, [notaFinal]);
  useEffect(() => {
    if (isVisible) {
      setShouldRenderContent(true);
      requestAnimationFrame(() => { if (contentRef.current) setMaxHeight(contentRef.current.scrollHeight + "px"); });
    } else {
      setMaxHeight("0px");
      const timeout = setTimeout(() => setShouldRenderContent(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);
  useEffect(() => { if (contentRef.current && isVisible) setMaxHeight(contentRef.current.scrollHeight + "px"); }, [status, isEditable, isVisible]);

  const renderStars = () => Array.from({ length: 5 }, (_, i) => {
    const filled = selectedScore !== null && i + 1 <= selectedScore;
    const isClickable = status === "Pendente" && isEditable;
    return (
      <Star key={i + 1} size={28} className={clsx("transition-colors duration-200", filled ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300", { "cursor-pointer hover:fill-yellow-500 hover:text-yellow-500": isClickable, "cursor-not-allowed opacity-60": !isClickable })} onClick={() => { if (isClickable) { setSelectedScore(i + 1); onScoreChange?.(i + 1); } }} aria-label={`Nota ${i + 1} estrela${i === 0 ? "" : "s"}`} role={isClickable ? "button" : undefined} tabIndex={isClickable ? 0 : -1} onKeyDown={e => { if (isClickable && (e.key === "Enter" || e.key === " ")) { setSelectedScore(i + 1); onScoreChange?.(i + 1); } }} />
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col xl:flex-row gap-4 pt-4 border-b border-gray-200 pb-4 px-6">
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-bold text-xs">Autoavaliação</p>
            <p className="text-xs font-semibold" style={{ color: getColorByScore(autoevaluationScore) }}>{autoevaluationScore.toFixed(1)}</p>
          </div>
          <Progress value={(autoevaluationScore / 5) * 100} className={clsx("h-4 [&>div]:rounded-full", { "[&>div]:bg-score-bad": getColorByScore(autoevaluationScore) === "#E04040", "[&>div]:bg-score-regular": getColorByScore(autoevaluationScore) === "#F5C130", "[&>div]:bg-score-good": getColorByScore(autoevaluationScore) === "#24A19F", "[&>div]:bg-score-great": getColorByScore(autoevaluationScore) === "#208A2A" })} />
        </div>
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-bold text-xs">Avaliação Gestor</p>
            <p className="text-xs font-semibold text-brand/70">{managerEvaluationScore.toFixed(1)}</p>
          </div>
          <Progress value={(managerEvaluationScore / 5) * 100} className="h-4 [&>div]:rounded-full [&>div]:bg-[#08605F]" />
        </div>
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-bold text-xs">Avaliação 360</p>
            <p className="text-xs font-semibold text-brand">{evaluation360Score.toFixed(1)}</p>
          </div>
          <Progress value={(evaluation360Score / 5) * 100} className="h-4 [&>div]:rounded-full [&>div]:bg-[#08605F]" />
        </div>
      </div>
      <div className="flex bg-[#F8F8F8] rounded-sm mt-4 mx-6 min-h-[150px]">
        <div className="border-l-4 border-[#08605F] rounded-sm self-stretch" />
        <div className="flex flex-row p-3 items-start">
          <Sparkles size={14} color="#08605F" fill="#08605F" className="mt-0.5" />
          <div className="flex flex-col ml-2 items-start text-start gap-1">
            <h2 className="text-sm font-bold text-[#1D1D1DBF] leading-none">Resumo</h2>
            <p className="text-[15px] text-[#5C5C5C]">{summaryText || "-"}</p>
          </div>
        </div>
      </div>
      <div ref={contentRef} style={{ maxHeight, overflow: "hidden", transition: "max-height 0.35s ease, opacity 0.35s ease", opacity: isVisible ? 1 : 0 }}>
        {shouldRenderContent && (
          <div className="flex flex-col gap-4 px-6 mb-2">
            <p className="text-gray-700 font-semibold text-sm">Avaliação</p>
            <div className="flex flex-wrap gap-2">{renderStars()}</div>
            {status === "Pendente" && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-700 font-semibold text-sm">Justifique sua nota</p>
                  <textarea className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none text-sm text-black placeholder-gray-400 bg-white mb-1" placeholder="Justifique sua nota" value={justification} onChange={e => { setJustification(e.target.value); onJustificationChange?.(e.target.value); }} />
                </div>
                <div className="flex gap-2 justify-end mb-2">
                  <button type="button" onClick={() => onConcluir && selectedScore !== null && onConcluir(selectedScore)} disabled={selectedScore === null} className={clsx("flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-semibold hover:bg-green-700 transition-colors duration-200 text-sm", selectedScore === null ? "bg-green-300 cursor-not-allowed" : "bg-green-600")}>Concluir</button>
                </div>
              </>
            )}
            {status === "Finalizado" && (
              <div className="flex gap-2 justify-end mb-2">
                <button type="button" onClick={onDownload} className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm">
                  <FileText size={16} className="text-gray-500" /> Baixar
                </button>
                <button type="button" onClick={() => { onEdit?.(); requestAnimationFrame(() => { if (contentRef.current) { setMaxHeight(contentRef.current.scrollHeight + "px"); setShouldRenderContent(true); } }); }} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#08605F] text-white font-semibold hover:bg-[#064a49] transition-colors duration-200 text-sm">
                  <Edit size={16} /> Editar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreInputSection;
