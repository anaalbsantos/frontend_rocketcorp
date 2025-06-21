import { useEffect, useState } from "react";
import EvaluationForm from "@/components/evaluation/EvaluationForm";
import TabsContent from "@/components/TabContent";

interface EvaluationCriteria {
  topic: string;
  criteria: { id: string; title: string }[];
}

const Evaluations = () => {
  const [activeTab, setActiveTab] = useState("autoavaliação");
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [formsFilled, setFormsFilled] = useState<boolean[]>([]);
  const [variant, setVariant] = useState<"autoevaluation" | "final-evaluation">(
    "autoevaluation"
  );

  const handleFormFilledChange = (index: number, filled: boolean) => {
    setFormsFilled((prev) => {
      if (prev[index] === filled) return prev;
      const updated = [...prev];
      updated[index] = filled;
      return updated;
    });
  };

  const allFormsFilled = formsFilled.every(Boolean);

  useEffect(() => {
    // simulação de busca de critérios de avaliação
    async function fetchEvaluationCriteria() {
      try {
        const evaluationCriteria = [
          {
            topic: "Postura",
            criteria: [
              { id: "1", title: "Sentimento de Dono" },
              { id: "2", title: "Resiliência nas adversidades" },
              { id: "3", title: "Organização no trabalho" },
              { id: "4", title: "Capacidade de aprender" },
              { id: "5", title: `Ser "team player"` },
            ],
          },
          {
            topic: "Execução",
            criteria: [
              { id: "1", title: "Entregar com qualidade" },
              { id: "2", title: "Atender aos prazos" },
              { id: "3", title: "Fazer mais com menos" },
              { id: "4", title: "Pensar fora da caixa" },
            ],
          },
          {
            topic: "Gente e Gestão",
            criteria: [
              { id: "1", title: "Gente" },
              { id: "2", title: "Resultados" },
              { id: "3", title: "Evolução da Rocket Group" },
            ],
          },
        ];
        setCriteria(evaluationCriteria);
        setVariant("autoevaluation");
        setFormsFilled((prev) =>
          prev.length === evaluationCriteria.length
            ? prev
            : Array(evaluationCriteria.length).fill(false)
        );
      } catch {
        console.error("Erro ao buscar critérios de avaliação");
      }
    }
    fetchEvaluationCriteria();
  }, []);

  return (
    <div>
      <div className="bg-white flex flex-col justify-between  border-b border-gray-200 shadow-sm">
        <div className="flex justify-between p-6">
          <h3 className="font-bold">Ciclo 2025.1</h3>

          {variant === "autoevaluation" && (
            <button
              className="text-sm text-white bg-brand disabled:bg-brand/50"
              type="submit"
              disabled={!allFormsFilled}
            >
              Concluir e enviar
            </button>
          )}
        </div>
        <TabsContent
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabs={["autoavaliação", "avaliação 360", "mentoring", "referências"]}
        />
      </div>

      {activeTab === "autoavaliação" && (
        <div className="flex flex-col p-6 gap-6">
          {criteria.map((evaluation, index) => (
            <EvaluationForm
              key={evaluation.topic}
              topic={evaluation.topic}
              criteria={evaluation.criteria}
              variant={variant}
              onAllFilledChange={(filled) =>
                handleFormFilledChange(index, filled)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Evaluations;
