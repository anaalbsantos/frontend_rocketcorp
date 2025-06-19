import { useState } from "react";
import EvaluationForm from "@/components/evaluation/EvaluationForm";
import TabsContent from "@/components/TabContent";

const evaluationCriteria = [
  {
    id: "1",
    title: "Sentimento de Dono",
  },
  {
    id: "2",
    title: "Resiliência nas adversidades",
  },
  {
    id: "3",
    title: "Organização no trabalho",
  },
  {
    id: "4",
    title: "Capacidade de aprender",
  },
  {
    id: "5",
    title: `Ser "team player"`,
  },
];

const Evaluations = () => {
  const [activeTab, setActiveTab] = useState("trilha");
  return (
    <div>
      <TabsContent
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        tabs={["trilha"]}
        itemClasses={{ trilha: "ml-4 px-10 py-3" }}
      />
      <div className="flex flex-col p-6 gap-6">
        <EvaluationForm
          criteria={evaluationCriteria}
          topic="Postura"
          variant="final-evaluation"
        />
        <EvaluationForm
          criteria={evaluationCriteria}
          topic="Postura"
          variant="final-evaluation"
        />
      </div>
    </div>
  );
};

export default Evaluations;
