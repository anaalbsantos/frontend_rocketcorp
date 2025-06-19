import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "./StarRating";
import { Circle, CircleCheck } from "lucide-react";

interface CriterionCollapseProps {
  title: string;
  variant?: "autoevaluation" | "gestor-evaluation" | "final-evaluation";
  onFilledChange?: (isFilled: boolean) => void;
}

const CriterionCollapse = ({
  title,
  variant = "autoevaluation",
  onFilledChange,
}: CriterionCollapseProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const isFilled = score !== null && justification.trim().length > 0;

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
          <div className="flex items-center justify-between w-full mr-2">
            <div className="flex gap-2 items-center">
              {variant === "autoevaluation" &&
                (isFilled ? (
                  <CircleCheck
                    className="text-white"
                    fill="#208A2A"
                    size={24}
                  />
                ) : (
                  <Circle className="text-text-primary" size={20} />
                ))}
              <h3 className="font-bold">{title}</h3>
            </div>
            {score ? (
              <p className="bg-[#E6E6E6] px-2 py-1 rounded-md text-brand font-bold">
                {score?.toFixed(1)}
              </p>
            ) : (
              <p className="bg-[#E6E6E6] px-3 py-1 rounded-md text-text-primary font-bold">
                -
              </p>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 px-4 text-text-muted text-xs">
          <div className="flex flex-col gap-2">
            <p>Dê uma avaliação de 1 à 5 com base no critério</p>
            <StarRating onChange={(v) => setScore(v)} />
          </div>
          <div className="flex flex-col gap-2">
            <p>Justifique sua nota</p>
            <textarea
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
              placeholder="Escreva aqui sua justificativa..."
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
