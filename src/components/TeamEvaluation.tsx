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
  const referenceData = referenceStore.responses[id] || {
    score: null,
    justification: "",
    filled: false,
  };
  // 360 store
  const evaluation360Store = useEvaluation360Store();
  const evaluation360Data = evaluation360Store.responses[id] || {
    scores: [null],
    justifications: ["", "", ""],
    filled: [false],
  };

  // Para mentor
  const mentorScore = mentorData.score ?? undefined;
  const mentorJustification = mentorData.justification;
  // Para referência
  const referenceScore = referenceData.score ?? undefined;
  const referenceJustification = referenceData.justification;
  // Para 360
  const score = evaluation360Data.scores[0] ?? undefined;
  const [justification1, justification2] = evaluation360Data.justifications;

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
  const handleReferenceScoreChange = (value: number | undefined) => {
    referenceStore.setResponse(id, {
      score: value ?? null,
      justification: referenceJustification ?? "",
      filled: !!referenceJustification && typeof value === "number",
    });
  };
  const handleReferenceJustificationChange = (value: string) => {
    referenceStore.setResponse(id, {
      score: referenceScore ?? null,
      justification: value,
      filled: !!referenceScore && value.length > 0,
    });
  };
  const handle360ScoreChange = (value: number | undefined) => {
    evaluation360Store.setResponse(id, {
      ...evaluation360Data,
      scores: [value ?? null],
    });
  };
  const handle360JustificationChange = (idx: number, value: string) => {
    const justifications = [
      ...(evaluation360Data.justifications || ["", "", ""]),
    ];
    justifications[idx] = value;
    evaluation360Store.setResponse(id, {
      ...evaluation360Data,
      justifications,
    });
  };

  // Renderização condicional dos valores e handlers
  const currentScore = isReference
    ? referenceScore
    : isMentor
    ? mentorScore
    : score;
  const currentJustification = isReference
    ? referenceJustification
    : isMentor
    ? mentorJustification
    : justification1;
  const handleScoreChange = isReference
    ? handleReferenceScoreChange
    : isMentor
    ? handleMentorScoreChange
    : handle360ScoreChange;
  const handle360JustificationChangeWrapper = (idx: number, v: string) =>
    handle360JustificationChange(idx, v);

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
              {isMentor ? mentorScore || "-" : score || "-"}
            </p>
          )}
          {role !== "mentor" && (
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
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
              placeholder="Justifique sua nota"
              value={currentJustification || ""}
              onChange={(e) =>
                isReference
                  ? handleReferenceJustificationChange(e.target.value)
                  : isMentor
                  ? handleMentorJustificationChange(e.target.value)
                  : handle360JustificationChangeWrapper(0, e.target.value)
              }
            />
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <div className="flex flex-col gap-2 w-full">
              <p>Pontos fortes</p>
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
                placeholder="Justifique sua nota"
                value={justification1 || ""}
                onChange={(e) =>
                  handle360JustificationChangeWrapper(0, e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p>Pontos de melhoria</p>
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
                placeholder="Justifique sua nota"
                value={justification2 || ""}
                onChange={(e) =>
                  handle360JustificationChangeWrapper(1, e.target.value)
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
