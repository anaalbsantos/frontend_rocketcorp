import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "./StarRating";
import { CircleCheck } from "lucide-react";

interface CriterionCollapseProps {
  title: string;
  index: number;
  onFilledChange?: (isFilled: boolean) => void;
  score: number | null;
  justification: string;
  setScore: (score: number | null) => void;
  setJustification: (justification: string) => void;
}

const CriterionCollapse = ({
  title,
  index,
  onFilledChange,
  score,
  justification = "",
  setScore,
  setJustification,
}: CriterionCollapseProps) => {
  const isFilled =
    typeof score === "number" && !isNaN(score) && justification.trim() !== "";

  useEffect(() => {
    if (onFilledChange) {
      onFilledChange(isFilled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilled]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
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
            {score ? (
              <p className="bg-[#E6E6E6] px-2 py-1 rounded-md text-brand font-bold text-xs">
                {score?.toFixed(1)}
              </p>
            ) : (
              <p className="bg-[#E6E6E6] px-3 py-1 rounded-md text-text-primary font-bold text-xs">
                -
              </p>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 px-4 text-text-muted text-xs">
          <div className="flex flex-col gap-2">
            <p>Dê uma avaliação de 1 à 5 com base no critério</p>
            <StarRating
              onChange={(v) => setScore(v)}
              value={score ?? undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p>Justifique sua nota</p>
            <textarea
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
              placeholder="Justifique sua nota"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CriterionCollapse;
