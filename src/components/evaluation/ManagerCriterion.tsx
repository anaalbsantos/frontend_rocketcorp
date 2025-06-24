import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "./StarRating";
import ReadonlyStars from "./ReadonlyStars";
import { CircleCheck } from "lucide-react";

interface ManagerCriterionProps {
  index: number;
  title: string;
  autoScore: number | null;
  autoJustification: string;
  managerScore: number | null;
  managerJustification: string;
  setManagerScore: (score: number | null) => void;
  setManagerJustification: (text: string) => void;
  onFilledChange?: (isFilled: boolean) => void;
}

const ManagerCriterion = ({
  index,
  title,
  autoScore,
  autoJustification,
  managerScore,
  managerJustification,
  setManagerScore,
  setManagerJustification,
  onFilledChange,
}: ManagerCriterionProps) => {
  const isFilled =
    managerScore !== null && managerJustification.trim().length > 0;

  useEffect(() => {
    onFilledChange?.(isFilled);
  }, [isFilled]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={`item-${index}`}>
        <AccordionTrigger className="bg-white hover:no-underline">
          <div className="flex items-center justify-between w-full mr-2 py-3">
            <div className="flex gap-2 items-center">
              {isFilled ? (
                <CircleCheck className="text-white" fill="#208A2A" size={24} />
              ) : (
                <div className="w-5 h-5 rounded-full border border-text-primary flex items-center justify-center">
                  <p className="text-xs">{index}</p>
                </div>
              )}
              <h3 className="font-bold">{title}</h3>
            </div>
            <div className="flex gap-2 items-center text-xs font-bold">
              <span className="bg-[#E6E6E6] px-3 py-1 rounded text-brand">
                {autoScore !== null ? autoScore.toFixed(1) : "-"}
              </span>
              <span className="bg-brand px-3 py-1 rounded text-white">
                {managerScore !== null ? managerScore.toFixed(1) : "-"}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-6 px-4 text-sm text-text-muted mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Autoavaliação (read-only) */}
            <div className="p-4 rounded-lg">
              <p className="font-bold mb-2">Autoavaliação</p>
              <p className="text-xs mb-1">Nota:</p>
              <ReadonlyStars value={autoScore ?? 0} lowOpacity />
              <p className="text-xs mt-3 mb-1">Justificativa:</p>
              <textarea
                className="bg-gray-100 w-full h-20 p-2 border border-gray-300 rounded-md resize-none bg-gray-100"
                readOnly
                value={autoJustification}
              />
            </div>

            {/* Avaliação do Gestor */}
            <div className="p-4">
              <p className="font-bold mb-2">Sua avaliação</p>
              <p className="text-xs mb-1">
                Sua avaliação de 1 a 5 com base no critério:
              </p>
              <StarRating
                value={managerScore ?? undefined}
                onChange={setManagerScore}
              />
              <p className="text-xs mt-3 mb-1">Justifique sua nota:</p>
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
                placeholder="Justifique sua nota"
                value={managerJustification}
                onChange={(e) => setManagerJustification(e.target.value)}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ManagerCriterion;
