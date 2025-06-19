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
    <div className="p-6">
      <EvaluationForm criteria={evaluationCriteria} topic="Postura" />
    </div>
  );
};

export default Evaluations;
