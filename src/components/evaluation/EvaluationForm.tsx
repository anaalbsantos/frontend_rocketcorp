import type { EvaluationCriteria } from "@/types";
import CriterionCollapse from "./CriterionCollapse";
import { useState } from "react";

interface EvaluationFormProps {
  criteria: EvaluationCriteria[];
  topic: string;
  variant?: "autoevaluation" | "gestor-evaluation" | "final-evaluation";
}

const EvaluationForm = ({
  criteria,
  topic,
  variant = "autoevaluation",
}: EvaluationFormProps) => {
  const [filled, setFilled] = useState<boolean[]>(() =>
    criteria.map(() => false)
  );

  const handleFilledChange = (index: number, isFilled: boolean) => {
    setFilled((prev) => {
      const updated = [...prev];
      updated[index] = isFilled;
      return updated;
    });
  };

  const filledCount = filled.filter(Boolean).length;
  const allCount = criteria.length;
  let badgeBg = "bg-score-good/25 text-score-good";
  if (filledCount === 0) badgeBg = "bg-score-bad/25 text-score-bad";
  else if (filledCount === allCount)
    badgeBg = "bg-score-great/25 text-score-great";

  return (
    <div className="bg-white p-8 rounded-lg w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-base text-brand font-bold mb-6 ">
          Critérios de {topic}
        </h3>
        {variant === "autoevaluation" && (
          <p className={`text-xs rounded-md h-fit p-2 font-bold ${badgeBg}`}>
            {filledCount}/{criteria.length} preenchidos
          </p>
        )}
      </div>
      {criteria.map((criterion, idx) => (
        <CriterionCollapse
          key={criterion.id}
          variant={variant}
          title={criterion.title}
          onFilledChange={(isFilled: boolean) =>
            handleFilledChange(idx, isFilled)
          }
        />
      ))}
    </div>
  );
};

export default EvaluationForm;
