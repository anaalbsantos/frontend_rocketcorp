import { Trash } from "lucide-react";
import Avatar from "./Avatar";
import { StarRating } from "./evaluation/StarRating";
import { useEvaluation360Store } from "@/stores/useEvaluation360Store";
import { useMentorEvaluationStore } from "@/stores/useMentorEvaluationStore";
import { useReferenceEvaluationStore } from "@/stores/useReferenceEvaluationStore";

interface TeamEvaluationProps {
  id: string;
  name: string;
  position: string;
  role: "colaborador" | "mentor" | "reference";
  onDelete?: () => void;
}

const TeamEvaluation = ({
  id,
  name,
  position,
  onDelete,
  role = "colaborador",
}: TeamEvaluationProps) => {
  const isMentor = role === "mentor";
  const isReference = role === "reference";
  // Mentor store
  const mentorStore = useMentorEvaluationStore();
  const mentorData = mentorStore.responses[id] || {
    score: null,
    justification: "",
    filled: false,
  };
  // Reference store
  const referenceStore = useReferenceEvaluationStore();
  const referenceData = referenceStore.response || {
    justification: "",
    filled: false,
  };
  // 360 store
  const evaluation360Store = useEvaluation360Store();
  const evaluation360Data = evaluation360Store.responses[id] || {
    score: null,
    justifications: { positive: "", negative: "" },
    filled: false,
  };

  // Para mentor
  const mentorScore = mentorData.score ?? undefined;
  const mentorJustification = mentorData.justification;
  // Para referência
  const referenceJustification = referenceData.justification;
  // Para 360
  const score = evaluation360Data.score ?? undefined;
  const justification1 = evaluation360Data.justifications.positive;
  const justification2 = evaluation360Data.justifications.negative;

  // Função utilitária para saber se está preenchido
  const is360Filled = (data: {
    score: number | null;
    justifications: { positive: string; negative: string };
  }) => {
    return (
      typeof data.score === "number" &&
      !isNaN(data.score) &&
      data.justifications.positive.trim().length > 0 &&
      data.justifications.negative.trim().length > 0
    );
  };

  // Handlers
  const handleMentorScoreChange = (value: number | undefined) => {
    mentorStore.setResponse(id, {
      score: value ?? null,
      justification: mentorJustification ?? "",
      filled: !!mentorJustification && typeof value === "number",
    });
  };
  const handleMentorJustificationChange = (value: string) => {
    mentorStore.setResponse(id, {
      score: mentorScore ?? null,
      justification: value,
      filled: !!mentorScore && value.length > 0,
    });
  };
  const handleReferenceJustificationChange = (value: string) => {
    referenceStore.setResponse({
      justification: value,
      filled: value.length > 0,
    });
  };
  const handle360ScoreChange = (value: number | undefined) => {
    const newData = {
      ...evaluation360Data,
      score: value ?? null,
    };
    evaluation360Store.setResponse(id, {
      ...newData,
      filled: is360Filled({
        score: newData.score,
        justifications: newData.justifications,
      }),
    });
  };
  const handle360JustificationChange = (
    type: "positive" | "negative",
    value: string
  ) => {
    const newJustifications = {
      ...evaluation360Data.justifications,
      [type]: value,
    };
    const newData = {
      ...evaluation360Data,
      justifications: newJustifications,
    };
    evaluation360Store.setResponse(id, {
      ...newData,
      filled: is360Filled({
        score: newData.score,
        justifications: newJustifications,
      }),
    });
  };

  // Renderização condicional dos valores e handlers
  const currentScore = isReference
    ? undefined // referência não tem score
    : isMentor
    ? mentorScore
    : score;
  const currentJustification = isReference
    ? referenceJustification
    : isMentor
    ? mentorJustification
    : justification1;
  const handleScoreChange = isReference
    ? undefined // referência não tem score
    : isMentor
    ? handleMentorScoreChange
    : handle360ScoreChange;

  return (
    <div className="flex flex-col bg-white py-6 px-8 rounded-lg gap-4">
      <div className="flex justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div className="flex flex-col">
            <p className="font-bold text-sm">{name}</p>
            <p className="text-xs">{position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role !== "reference" && (
            <p className="flex bg-border min-w-8 px-2 leading-6 justify-center rounded-sm text-sm text-brand font-bold">
              {isMentor
                ? mentorScore?.toFixed(1) || "-"
                : score?.toFixed(1) || "-"}
            </p>
          )}
          {role === "reference" && (
            <Trash
              className="text-red-600 cursor-pointer"
              size={20}
              onClick={onDelete}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 text-text-muted text-xs">
        {role !== "reference" && (
          <div className="flex flex-col gap-2">
            <p>
              Dê uma avaliação de 1 à 5 ao{" "}
              {role === "colaborador" ? "colaborador" : "seu mentor"}
            </p>
            <StarRating value={currentScore} onChange={handleScoreChange} />
          </div>
        )}
        {role !== "colaborador" ? (
          <div className="flex flex-col gap-2 w-full">
            <p>Justifique sua nota</p>
            <textarea
              maxLength={500}
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white scrollbar"
              placeholder="Justifique sua nota"
              value={currentJustification || ""}
              onChange={(e) =>
                isReference
                  ? handleReferenceJustificationChange(e.target.value)
                  : isMentor
                  ? handleMentorJustificationChange(e.target.value)
                  : handle360JustificationChange("positive", e.target.value)
              }
            />
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <div className="flex flex-col gap-2 w-full">
              <p>Pontos fortes</p>
              <textarea
                maxLength={500}
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white scrollbar"
                placeholder="Justifique sua nota"
                value={justification1 || ""}
                onChange={(e) =>
                  handle360JustificationChange("positive", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p>Pontos de melhoria</p>
              <textarea
                maxLength={500}
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white scrollbar"
                placeholder="Justifique sua nota"
                value={justification2 || ""}
                onChange={(e) =>
                  handle360JustificationChange("negative", e.target.value)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamEvaluation;
