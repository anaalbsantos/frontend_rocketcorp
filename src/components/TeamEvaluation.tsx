import { Trash } from "lucide-react";
import Avatar from "./Avatar";
import { StarRating } from "./evaluation/StarRating";
import { useState } from "react";

interface TeamEvaluationProps {
  name: string;
  position: string;
  role: "colaborador" | "mentor" | "reference";
  onDelete?: () => void;
}

const TeamEvaluation = ({
  name,
  position,
  onDelete,
  role = "colaborador",
}: TeamEvaluationProps) => {
  const [score, setScore] = useState<number | undefined>(undefined);

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
              {score || "-"}
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
            <StarRating value={score} onChange={(v) => setScore(v)} />
          </div>
        )}
        {role !== "colaborador" ? (
          <div className="flex flex-col gap-2 w-full">
            <p>Justifique sua nota</p>
            <textarea
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
              placeholder="Justifique sua nota"
            />
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <div className="flex flex-col gap-2 w-full">
              <p>Pontos fortes</p>
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
                placeholder="Justifique sua nota"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p>Pontos de melhoria</p>
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
                placeholder="Justifique sua nota"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamEvaluation;
