import type { EvaluationCriteria } from "@/types";
import CriterionCollapse from "./CriterionCollapse";
import { useEffect } from "react";
import FinalEvaluationCollapse from "./FinalEvaluationCollapse";
import { useForm } from "react-hook-form";
import { useAutoevaluationStore } from "@/stores/useAutoevaluationStore";
import { useUser } from "@/contexts/UserContext";
import api from "@/api/api";

interface EvaluationFormProps {
  criteria: EvaluationCriteria[];
  variant?: "autoevaluation" | "final-evaluation";
}

interface FormValues {
  scores: (number | null)[];
  justifications: string[];
  filled: boolean[];
}

const EvaluationForm = ({
  criteria,
  variant = "autoevaluation",
}: EvaluationFormProps) => {
  const { responses, setResponse } = useAutoevaluationStore();
  const { userId } = useUser();

  // estado inicial do formulário
  const defaultValues: FormValues = {
    scores: responses.scores ?? Array(criteria.length).fill(null),
    justifications: responses.justifications ?? Array(criteria.length).fill(""),
    filled: responses.filled ?? Array(criteria.length).fill(false),
  };

  const { watch, setValue } = useForm<FormValues>({
    defaultValues,
  });

  // atualiza zustand sempre que o formulário muda
  useEffect(() => {
    const subscription = watch((values) => {
      const safeScores = (values.scores ?? []).map((v) => v ?? null);
      const safeJustifications = (values.justifications ?? []).map(
        (v) => v ?? ""
      );
      const safeFilled = (values.filled ?? []).map((v) => v === true);
      setResponse({
        scores: safeScores,
        justifications: safeJustifications,
        filled: safeFilled,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setResponse]);

  useEffect(() => {
    async function fetchFinalScores() {
      try {
        const response = await api.get(`/users/${userId}/evolutions`);
        console.log(response.data);
      } catch {
        console.error("Erro ao buscar scores finais");
      }
    }

    fetchFinalScores();
  }, [userId]);

  // mapea os campos dinamicamente
  const scores = watch("scores");
  const justifications = watch("justifications");
  const filled = watch("filled");

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
        <h3 className="text-base text-brand font-bold mb-6 ">Critérios</h3>
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
            setScore={(score: number | null) =>
              setValue(`scores.${idx}`, score)
            }
            setJustification={(justification: string) =>
              setValue(`justifications.${idx}`, justification)
            }
            onFilledChange={(isFilled: boolean) =>
              setValue(`filled.${idx}`, isFilled)
            }
          />
        ))}

      {variant === "final-evaluation" &&
        criteria.map((criterion, idx) => (
          <FinalEvaluationCollapse
            key={criterion.id}
            title={criterion.title}
            score={scores[idx]}
            finalScore={finalScores[idx]}
            justification={justifications[idx]}
            onFilledChange={(isFilled: boolean) =>
              setValue(`filled.${idx}`, isFilled)
            }
          />
        ))}
    </div>
  );
};

export default EvaluationForm;
