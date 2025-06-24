import { useState, useEffect } from "react";
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
}

const ManagerEvaluationForm = ({
  topic,
  criteria,
  onAllFilledChange,
}: ManagerEvaluationFormProps) => {
  const [filled, setFilled] = useState<boolean[]>(() =>
    criteria.map(() => false)
  );
  const [managerScores, setManagerScores] = useState<(number | null)[]>(
    criteria.map(() => null)
  );
  const [managerJustifications, setManagerJustifications] = useState<string[]>(
    criteria.map(() => "")
  );

  const handleFilledChange = (index: number, isFilled: boolean) => {
    setFilled((prev) => {
      const updated = [...prev];
      updated[index] = isFilled;
      return updated;
    });
  };

  useEffect(() => {
    if (onAllFilledChange) {
      onAllFilledChange(filled.every(Boolean));
    }
  }, [filled, onAllFilledChange]);
  const filledCount = filled.filter(Boolean).length;
  const validScores = managerScores.filter(
    (s) => typeof s === "number" && !isNaN(s)
  ) as number[];

  const scoreMean =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : "-";

  const validAutoScores = criteria
    .map((c) => c.autoScore)
    .filter((s): s is number => typeof s === "number" && !isNaN(s));

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
          managerScore={managerScores[idx]}
          managerJustification={managerJustifications[idx]}
          setManagerScore={(score: number | null) => {
            const updated = [...managerScores];
            updated[idx] = score;
            setManagerScores(updated);
          }}
          setManagerJustification={(text: string) => {
            const updated = [...managerJustifications];
            updated[idx] = text;
            setManagerJustifications(updated);
          }}
          onFilledChange={(filled) => handleFilledChange(idx, filled)}
        />
      ))}
    </div>
  );
};

export default ManagerEvaluationForm;
