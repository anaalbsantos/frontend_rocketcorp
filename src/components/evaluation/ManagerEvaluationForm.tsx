import { useState, useEffect } from "react";
import ManagerCriterion from "./ManagerCriterion";
import type { EvaluationCriteria } from "@/types";
import type { ManagerResponse } from "@/stores/useManagerEvaluationStore";
import { useManagerEvaluationStore } from "@/stores/useManagerEvaluationStore";

interface ManagerCriterionData extends EvaluationCriteria {
  autoScore: number | null;
  autoJustification: string;
}

interface ManagerEvaluationFormProps {
  topic: string;
  criteria: ManagerCriterionData[];
  responses: Record<string, ManagerResponse>;
  userId: string;
  readonly?: boolean;
  onAllFilledChange?: (allFilled: boolean) => void;
}

function formatTopic(topic: string) {
  return topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
}
const ManagerEvaluationForm = ({
  topic,
  criteria,
  responses,
  userId,
  onAllFilledChange,
  readonly,
}: ManagerEvaluationFormProps) => {
  const [filled, setFilled] = useState<boolean[]>([]);
  const [managerScores, setManagerScores] = useState<(number | null)[]>([]);
  const [managerJustifications, setManagerJustifications] = useState<string[]>(
    []
  );
  const { setResponse } = useManagerEvaluationStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub1 = useManagerEvaluationStore.persist?.onHydrate(() =>
      setHydrated(false)
    );
    const unsub2 = useManagerEvaluationStore.persist?.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useManagerEvaluationStore.persist?.hasHydrated()) setHydrated(true);

    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, []);
  useEffect(() => {
    const savedResponses = criteria.map((c) => responses?.[c.id] ?? {});
    setManagerScores(
      savedResponses.map((r) => (typeof r.score === "number" ? r.score : null))
    );
    setManagerJustifications(
      savedResponses.map((r) =>
        typeof r.justification === "string" ? r.justification : ""
      )
    );
    setFilled(savedResponses.map((r) => r.filled === true));
  }, [criteria, responses]);

  useEffect(() => {
    onAllFilledChange?.(filled.every(Boolean));
  }, [filled, onAllFilledChange]);

  const handleFilledChange = (index: number, isFilled: boolean) => {
    setFilled((prev) => {
      if (prev[index] === isFilled) return prev;
      const updated = [...prev];
      updated[index] = isFilled;
      return updated;
    });
  };

  const handleScoreChange = (idx: number, score: number | null) => {
    setManagerScores((prev) => {
      const updated = [...prev];
      updated[idx] = score;
      return updated;
    });

    setResponse(userId, criteria[idx].id, {
      score,
      justification: managerJustifications[idx],
      filled: score !== null && managerJustifications[idx].trim().length > 0,
    });
  };

  const handleJustificationChange = (idx: number, text: string) => {
    setManagerJustifications((prev) => {
      const updated = [...prev];
      updated[idx] = text;
      return updated;
    });

    setResponse(userId, criteria[idx].id, {
      score: managerScores[idx],
      justification: text,
      filled: managerScores[idx] !== null && text.trim().length > 0,
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
  if (!hydrated) {
    return <div className="p-6">Carregando avaliação...</div>;
  }
  return (
    <div className="bg-white p-7 rounded-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base text-brand font-bold">
          Critérios de {formatTopic(topic)}
        </h3>
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
          setManagerScore={(score) =>
            !readonly && handleScoreChange(idx, score)
          }
          setManagerJustification={(text) =>
            !readonly && handleJustificationChange(idx, text)
          }
          onFilledChange={(isFilled) => handleFilledChange(idx, isFilled)}
          readonly={readonly}
        />
      ))}
    </div>
  );
};

export default ManagerEvaluationForm;
