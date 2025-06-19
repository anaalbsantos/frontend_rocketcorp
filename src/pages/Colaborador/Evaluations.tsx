import EvaluationForm from "@/components/evaluation/EvaluationForm";

const evaluationCriteria = [
  {
    id: "1",
    title: "Colaboração e Trabalho em Equipe",
  },
  {
    id: "2",
    title: "Comunicação Eficaz",
  },
  {
    id: "3",
    title: "Iniciativa e Proatividade",
  },
  {
    id: "4",
    title: "Resiliência e Adaptabilidade",
  },
];

const Evaluations = () => {
  return (
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
  );
};

export default Evaluations;
