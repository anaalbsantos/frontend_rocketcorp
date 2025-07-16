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
  justification: string;
  notaFinal: number | null;
  isEditable: boolean;
  status: "Pendente" | "Finalizado";
  isVisible?: boolean;
  onScoreChange?: (score: number | null) => void;
  onJustificationChange?: (justification: string) => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onConcluir?: (notaEstrelas: number) => void;
  onCancelEdit?: () => void;
  onDelete?: () => void;
}

const ScoreInputSection: React.FC<ScoreInputSectionProps> = ({
  autoevaluationScore,
  managerEvaluationScore,
  evaluation360Score,
  summaryText,
  justification,
  notaFinal,
  isEditable,
  status,
  isVisible = true,
  onScoreChange,
  onJustificationChange,
  onDownload,
  onEdit,
  onConcluir,
  onCancelEdit,
  onDelete,
}) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [justText, setJustText] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");
  const [shouldRenderContent, setShouldRenderContent] = useState(isVisible);

  useEffect(() => {
    setSelectedScore(notaFinal);
  }, [notaFinal]);

  useEffect(() => {
    setJustText(justification);
  }, [justification]);

  useEffect(() => {
    if (isVisible) {
      setShouldRenderContent(true);
      requestAnimationFrame(() => {
        if (contentRef.current) setMaxHeight(contentRef.current.scrollHeight + "px");
      });
    } else {
      setMaxHeight("0px");
      const timeout = setTimeout(() => setShouldRenderContent(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  useEffect(() => {
    if (contentRef.current && isVisible) setMaxHeight(contentRef.current.scrollHeight + "px");
  }, [status, isEditable, isVisible]);

  const renderStars = () =>
    Array.from({ length: 5 }, (_, i) => {
      const starIndex = i;
      let fill = 0;
      if (selectedScore !== null) fill = Math.max(0, Math.min(1, selectedScore - starIndex)) * 100;
      const isClickable = status === "Pendente" && isEditable;
      return (
        <div
          key={starIndex}
          className={clsx("relative w-7 h-7 text-yellow-400", { "cursor-pointer": isClickable, "cursor-default": !isClickable })}
          onClick={(e) => {
            if (!isClickable) return;
            const { left, width } = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - left;
            const percent = x / width;
            const part = percent < 0.5 ? 0.5 : 1;
            const selectedValue = Math.min(5, starIndex + part);
            setSelectedScore(selectedValue);
            onScoreChange?.(selectedValue);
          }}
        >
          <Star className="w-7 h-7 text-[#08605F] absolute" />
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fill}%` }}>
            <Star className="w-7 h-7 fill-current" style={{ color: "#08605F" }} />
          </div>
        </div>
      );
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col xl:flex-row gap-4 pt-4 pb-4 px-6 border-b border-gray-200">
        {[
          { label: "Autoavaliação", value: autoevaluationScore },
          { label: "Avaliação Gestor", value: managerEvaluationScore },
          { label: "Avaliação 360", value: evaluation360Score },
        ].map(({ label, value }, idx) => (
          <div key={idx} className="w-full flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-gray-500">{label}</p>
              <p
                className="text-xs font-semibold"
                style={{ color: idx === 0 ? getColorByScore(value) : "#08605F" }}
              >
                {value.toFixed(1)}
              </p>
            </div>
            <Progress
              value={(value / 5) * 100}
              className={clsx("h-4 [&>div]:rounded-full", {
                "[&>div]:bg-score-bad": getColorByScore(value) === "#E04040",
                "[&>div]:bg-score-regular": getColorByScore(value) === "#F5C130",
                "[&>div]:bg-score-good": getColorByScore(value) === "#24A19F",
                "[&>div]:bg-score-great": getColorByScore(value) === "#208A2A",
              })}
            />
          </div>
        ))}
      </div>

      <div className="flex bg-[#F8F8F8] rounded-sm mt-4 mx-6 min-h-[150px]">
        <div className="border-l-4 border-[#08605F] rounded-sm self-stretch" />
        <div className="flex flex-row p-3 items-start">
          <Sparkles size={14} color="#08605F" fill="#08605F" className="mt-0.5" />
          <div className="flex flex-col ml-2 items-start text-start gap-1">
            <h2 className="text-sm font-bold text-[#1D1D1DBF] leading-none">Resumo</h2>
            <p className="text-[15px] text-[#5C5C5C]">
              {summaryText && summaryText.trim() !== "" ? summaryText : "Ainda não há dados suficientes para gerar este conteúdo."}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        style={{ maxHeight, overflow: "hidden", transition: "max-height 0.35s ease, opacity 0.35s ease", opacity: isVisible ? 1 : 0 }}
      >
        {shouldRenderContent && (
          <div className="flex flex-col gap-4 px-6 mb-2">
            <p className="text-sm font-semibold text-gray-700">Avaliação</p>
            <div className="flex gap-2">{renderStars()}</div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">Justifique sua nota</p>
              {status === "Pendente" ? (
                <textarea
                  className="w-full h-24 p-3 mb-1 text-sm text-black placeholder-gray-400 bg-white border border-gray-300 rounded-md resize-none"
                  placeholder="Justifique sua nota"
                  value={justText}
                  onChange={(e) => {
                    if (!isEditable) return;
                    setJustText(e.target.value);
                    onJustificationChange?.(e.target.value);
                  }}
                  disabled={!isEditable}
                />
              ) : (
                <textarea
                  readOnly
                  value={justText}
                  className="w-full h-24 p-3 mb-1 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md resize-none cursor-default"
                />
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-2 mb-2 sm:flex-row sm:justify-end">
              {status === "Pendente" && (
                <>
                  {onDelete && notaFinal !== null && (
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={!isEditable}
                      className={clsx(
                        "flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md text-white",
                        isEditable
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-red-300 cursor-not-allowed"
                      )}
                    >
                      Excluir
                    </button>
                  )}
                  {onCancelEdit && notaFinal !== null && (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={!isEditable}
                      className={clsx(
                        "flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md text-white",
                        isEditable
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-gray-300 cursor-not-allowed"
                      )}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onConcluir && selectedScore !== null && onConcluir(selectedScore)}
                    disabled={!isEditable || selectedScore === null}
                    className={clsx(
                      "flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md text-white",
                      !isEditable || selectedScore === null
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    Concluir
                  </button>
                </>
              )}

              {status === "Finalizado" && (
                <>
                  <button
                    type="button"
                    onClick={onDownload}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <FileText size={16} /> Baixar
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    disabled={!isEditable}
                    className={clsx(
                      "flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-md text-white",
                      isEditable
                        ? "bg-[#08605F] hover:bg-[#064a49]"
                        : "bg-[#72a19e] cursor-not-allowed"
                    )}
                  >
                    <Edit size={16} /> Editar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreInputSection;
