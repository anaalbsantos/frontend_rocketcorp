import type { EvaluationCriteria } from "@/types";
import CriterionCollapse from "./CriterionCollapse";
import { useState } from "react";
import FinalEvaluationCollapse from "./FinalEvaluationCollapse";

interface EvaluationFormProps {
  criteria: EvaluationCriteria[];
  topic: string;
  variant?: "autoevaluation" | "final-evaluation";
  // autoEvaluation?:  (para integração futura)
  // finalEvaluation?: (para integração futura)
}

const EvaluationForm = ({
  criteria,
  topic,
  variant = "autoevaluation",
}: EvaluationFormProps) => {
  const [filled, setFilled] = useState<boolean[]>(() =>
    criteria.map(() => false)
  );
  const [scores, setScores] = useState<(number | null)[]>(() =>
    criteria.map(() => null)
  );

  const [justifications, setJustifications] = useState<string[]>(() =>
    criteria.map(() => "")
  );

  const handleFilledChange = (index: number, isFilled: boolean) => {
    setFilled((prev) => {
      const updated = [...prev];
      updated[index] = isFilled;
      return updated;
    });
  };

  const handleScoreChange = (index: number, score: number | null) => {
    setScores((prev) => {
      const updated = [...prev];
      updated[index] = score;
      return updated;
    });
  };

  const handleJustificationChange = (index: number, justification: string) => {
    setJustifications((prev) => {
      const updated = [...prev];
      updated[index] = justification;
      return updated;
    });
  };

  const filledCount = filled.filter(Boolean).length;
  const allCount = criteria.length;
  let badgeBg = "bg-score-good/25 text-score-good";
  if (filledCount === 0) badgeBg = "bg-score-bad/25 text-score-bad";
  else if (filledCount === allCount)
    badgeBg = "bg-score-great/25 text-score-great";

  // Calcular média dos scores preenchidos
  const validScores = scores.filter(
    (s) => typeof s === "number" && !isNaN(s)
  ) as number[];
  const scoreMean =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : "-";

  // Calcular média dos finalScores preenchidos
  const finalScores = criteria.map(() => 3.5); // simulação
  const validFinalScores = finalScores.filter(
    (s) => typeof s === "number" && !isNaN(s)
  ) as number[];
  const finalScoreMean =
    validFinalScores.length > 0
      ? (
          validFinalScores.reduce((a, b) => a + b, 0) / validFinalScores.length
        ).toFixed(1)
      : "-";

  return (
    <div className="bg-white p-7 rounded-lg w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-base text-brand font-bold mb-6 ">
          Critérios de {topic}
        </h3>
        {variant === "autoevaluation" && (
          <div className="flex gap-2 items-center">
            {filledCount === allCount ? (
              <p className="bg-[#E6E6E6] py-2 px-3 h-full rounded-md text-brand font-bold text-xs">
                {scoreMean}
              </p>
            ) : (
              <p className="bg-[#E6E6E6] px-3 py-1 rounded-md text-text-primary font-bold text-xs">
                -
              </p>
            )}
            <p className={`text-xs rounded-md h-fit p-2 font-bold ${badgeBg}`}>
              {filledCount}/{criteria.length} preenchidos
            </p>
          </div>
        )}
        {variant === "final-evaluation" && (
          <div className="flex gap-2 items-center">
            <p className="bg-[#E6E6E6] py-2 px-3 h-full rounded-md text-brand font-bold text-xs">
              {scoreMean}
            </p>
            <p className="text-[#E6E6E6] py-2 px-3 h-full rounded-md bg-brand font-bold text-xs">
              {finalScoreMean}
            </p>
          </div>
        )}
      </div>
      {variant === "autoevaluation" &&
        criteria.map((criterion, idx) => (
          <CriterionCollapse
            key={criterion.id}
            index={idx + 1}
            title={criterion.title}
            score={scores[idx]}
            justification={justifications[idx]}
            setScore={(score: number | null) => handleScoreChange(idx, score)}
            setJustification={(justification: string) =>
              handleJustificationChange(idx, justification)
            }
            onFilledChange={(isFilled: boolean) =>
              handleFilledChange(idx, isFilled)
            }
          />
        ))}
      {variant === "final-evaluation" &&
        criteria.map((criterion, idx) => (
          <FinalEvaluationCollapse
            key={criterion.id}
            title={criterion.title}
            score={2.5}
            finalScore={3.5}
            justification={justifications[idx]}
            onFilledChange={(isFilled: boolean) =>
              handleFilledChange(idx, isFilled)
            }
          />
        ))}
    </div>
  );
};

export default EvaluationForm;
