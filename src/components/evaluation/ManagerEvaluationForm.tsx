import { useState, useEffect, useRef } from "react";
import ManagerCriterion from "./ManagerCriterion";
import type { EvaluationCriteria } from "@/types";

interface ManagerCriterionData extends EvaluationCriteria {
  autoScore: number | null;
  autoJustification: string;
}

interface ManagerEvaluationFormProps {
  topic: string;
  criteria: ManagerCriterionData[];
  onAllFilledChange?: (allFilled: boolean) => void;
  onManagerAnswerChange?: (
    criterionId: string,
    score: number,
    justification: string
  ) => void;
}

const ManagerEvaluationForm = ({
  topic,
  criteria,
  onAllFilledChange,
  onManagerAnswerChange,
}: ManagerEvaluationFormProps) => {
  const [filled, setFilled] = useState<boolean[]>([]);
  const [managerScores, setManagerScores] = useState<(number | null)[]>([]);
  const [managerJustifications, setManagerJustifications] = useState<string[]>(
    []
  );
  const firstRun = useRef(true);

  useEffect(() => {
    setFilled(criteria.map(() => false));
    setManagerScores(criteria.map(() => null));
    setManagerJustifications(criteria.map(() => ""));
  }, [criteria]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    onAllFilledChange?.(filled.every(Boolean));
  }, [filled]);

  const handleFilledChange = (index: number, isFilled: boolean) => {
    setFilled((prev) => {
      if (prev[index] === isFilled) return prev;
      const updated = [...prev];
      updated[index] = isFilled;
      return updated;
    });
  };

  const filledCount = filled.filter(Boolean).length;
  const validScores = managerScores.filter(
    (s): s is number => typeof s === "number"
  );
  const scoreMean =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : "-";

  const validAutoScores = criteria
    .map((c) => c.autoScore)
    .filter((s): s is number => typeof s === "number");

  const autoMean =
    validAutoScores.length > 0
      ? (
          validAutoScores.reduce((a, b) => a + b, 0) / validAutoScores.length
        ).toFixed(1)
      : "-";

  return (
    <div className="bg-white p-7 rounded-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base text-brand font-bold">Critérios de {topic}</h3>
        <div className="flex gap-2 items-center text-xs font-bold">
          <span className="bg-[#E6E6E6] px-3 py-1 rounded text-brand">
            {autoMean}
          </span>
          <span className="bg-brand px-3 py-1 rounded text-white">
            {scoreMean}
          </span>
          <span
            className="rounded-md px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: "#24A19F40", color: "#24A19F" }}
          >
            {filledCount}/{criteria.length} preenchidos
          </span>
        </div>
      </div>

      {criteria.map((criterion, idx) => (
        <ManagerCriterion
          key={criterion.id}
          index={idx + 1}
          title={criterion.title}
          autoScore={criterion.autoScore}
          autoJustification={criterion.autoJustification}
          managerScore={managerScores[idx] ?? null}
          managerJustification={managerJustifications[idx] ?? ""}
          setManagerScore={(score) => {
            setManagerScores((prev) => {
              const updated = [...prev];
              updated[idx] = score;
              return updated;
            });
            onManagerAnswerChange?.(
              criterion.id,
              score ?? 0,
              managerJustifications[idx] ?? ""
            );
          }}
          setManagerJustification={(text) => {
            setManagerJustifications((prev) => {
              const updated = [...prev];
              updated[idx] = text;
              return updated;
            });
            onManagerAnswerChange?.(
              criterion.id,
              managerScores[idx] ?? 0,
              text
            );
          }}
          onFilledChange={(isFilled) => handleFilledChange(idx, isFilled)}
        />
      ))}
    </div>
  );
};

export default ManagerEvaluationForm;
