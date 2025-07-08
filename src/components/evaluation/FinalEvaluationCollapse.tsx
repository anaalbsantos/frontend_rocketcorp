import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "./StarRating";

interface CriterionCollapseProps {
  title: string;
  score: number | null;
  justification: string;
}

const FinalEvaluationCollapse = ({
  title,
  score,
  justification = "",
}: CriterionCollapseProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-white hover:no-underline">
          <div className="flex items-center justify-between w-full mr-2 py-3">
            <div className="flex gap-2 items-center">
              <h3 className="font-bold">{title}</h3>
            </div>
            <div className="flex gap-1 items-center">
              {score && (
                <p className="px-2 py-1 rounded-md text-text-primary/75 font-bold text-xs">
                  {score?.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 px-4 text-text-muted text-xs">
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <p>Sua avaliação de 1 à 5 com base no critério</p>
              <StarRating value={score ?? 0} disableHover lowOpacity />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p>Justifique sua nota</p>
            <textarea
              className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none focus:outline-none bg-white"
              placeholder="Justifique sua nota"
              value={justification}
              readOnly
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FinalEvaluationCollapse;
