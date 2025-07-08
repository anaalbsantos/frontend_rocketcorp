import CriterionCollapse from "./CriterionCollapse";
import { useEffect } from "react";
import FinalEvaluationCollapse from "./FinalEvaluationCollapse";
import { useForm } from "react-hook-form";
import { useAutoevaluationStore } from "@/stores/useAutoevaluationStore";
import { useUser } from "@/contexts/UserContext";

interface Criterion {
  id: string;
  title: string;
  description?: string;
  type: "COMPORTAMENTO" | "EXECUCAO" | "GESTAO";
}

interface FinalCriterion {
  criterion: string;
  score: number | null;
  justification: string;
  type: "COMPORTAMENTO" | "EXECUCAO" | "GESTAO";
}

interface EvaluationFormProps {
  topic: string;
  criteria?: Criterion[];
  finalCriteria?: FinalCriterion[];
  selfScore?: number | null;
  finalScore?: number | null;
  variant?: "autoevaluation" | "final-evaluation" | null;
}

interface FormValues {
  scores: (number | null)[] | undefined;
  justifications: string[];
  filled: boolean[];
}

const EvaluationForm = ({
  topic,
  criteria = [],
  finalCriteria = [],
  finalScore = null,
  variant = "autoevaluation",
}: EvaluationFormProps) => {
  const { responses, setResponse } = useAutoevaluationStore();
  const { userId } = useUser();

  // estado inicial do formulário
  const defaultValues: FormValues = {
    scores: criteria.map((c) => responses[c.id]?.score ?? null),
    justifications: criteria.map((c) => responses[c.id]?.justification ?? ""),
    filled: criteria.map((c) => responses[c.id]?.filled ?? false),
  };

  const { watch, setValue, reset } = useForm<FormValues>({
    defaultValues,
  });

  // sincronizar formulário com zustand/responses/criteria
  useEffect(() => {
    reset({
      scores: criteria.map((c) => responses[c.id]?.score ?? null),
      justifications: criteria.map((c) => responses[c.id]?.justification ?? ""),
      filled: criteria.map((c) => responses[c.id]?.filled ?? false),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(responses), JSON.stringify(criteria)]);

  const isCriterionFilled = (score: number | null, justification: string) => {
    return (
      typeof score === "number" && !isNaN(score) && justification.trim() !== ""
    );
  };

  // atualiza zustand sempre que o formulário muda
  useEffect(() => {
    const subscription = watch((values) => {
      const safeScores = Array.isArray(values.scores)
        ? values.scores.map((v) => v ?? null)
        : Array(criteria.length).fill(null);

      const safeJustifications = Array.isArray(values.justifications)
        ? values.justifications.map((v) => v ?? "")
        : Array(criteria.length).fill("");

      (criteria || []).forEach((criterion, idx) => {
        setResponse(criterion.id, {
          score: safeScores[idx],
          justification: safeJustifications[idx],
          filled: isCriterionFilled(safeScores[idx], safeJustifications[idx]),
        });
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setResponse, criteria]);

  // resultados
  useEffect(() => {
    async function fetchFinalScores() {
      try {
        // const response = await api.get(`/users/${userId}/evolutions`);
      } catch {
        console.error("Erro ao buscar scores finais");
      }
    }

    fetchFinalScores();
  }, [userId]);

  // mapea os campos dinamicamente
  const scores = watch("scores") || [];
  const justifications = watch("justifications") || [];
  const filled = watch("filled") || [];

  const filledCount = filled.filter(Boolean).length;
  const allCount = criteria.length;
  let badgeBg = "bg-score-good/25 text-score-good";
  if (filledCount === 0) badgeBg = "bg-score-bad/25 text-score-bad";
  else if (filledCount === allCount)
    badgeBg = "bg-score-great/25 text-score-great";

  // Calcular média dos scores preenchidos
  const validScores = scores?.filter(
    (s) => typeof s === "number" && !isNaN(s)
  ) as number[];
  const scoreMean =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : "-";

  // Calcular média dos finalCriteria scores
  const validFinalScores =
    finalCriteria
      ?.filter(
        (criterion) =>
          typeof criterion.score === "number" && !isNaN(criterion.score)
      )
      .map((criterion) => criterion.score as number) || [];
  const finalCriteriaMean =
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
              {finalCriteriaMean}
            </p>
            <p className="text-[#E6E6E6] py-2 px-3 h-full rounded-md bg-brand font-bold text-xs">
              {finalScore?.toFixed(1) ?? "-"}
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
            setScore={(score: number | null) => {
              setValue(`scores.${idx}`, score);
              // atualizar filled automaticamente
              const newFilled = isCriterionFilled(score, justifications[idx]);
              setValue(`filled.${idx}`, newFilled);
            }}
            setJustification={(justification: string) => {
              setValue(`justifications.${idx}`, justification);
              // atualizar filled automaticamente
              const newFilled = isCriterionFilled(scores[idx], justification);
              setValue(`filled.${idx}`, newFilled);
            }}
            onFilledChange={() => {
              const calculatedFilled = isCriterionFilled(
                scores[idx],
                justifications[idx]
              );
              setValue(`filled.${idx}`, calculatedFilled);
            }}
          />
        ))}

      {variant === "final-evaluation" &&
        finalCriteria.map((criterion, idx) => (
          <FinalEvaluationCollapse
            key={idx}
            title={criterion.criterion}
            score={finalCriteria[idx]?.score ?? null}
            justification={finalCriteria[idx]?.justification ?? ""}
          />
        ))}
    </div>
  );
};

export default EvaluationForm;
