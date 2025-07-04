import { useEffect, useState } from "react";
import api from "@/api/api";
import ManagerEvaluationForm from "@/components/evaluation/ManagerEvaluationForm";

interface Props {
  userId: string;
  cycle: {
    cycleId: string;
    name: string;
    startDate: string;
    reviewDate: string;
    endDate: string;
  };
  alreadyEvaluated: boolean;
}

interface GroupedCriterion {
  id: string;
  title: string;
  topic: string;
  autoScore: number;
  autoJustification: string;
}

interface AutoEvaluationResponse {
  cycleId: string;
  answers: {
    criterionId: string;
    score: number;
    justification: string;
    criterion: {
      id: string;
      title: string;
      description: string;
      type: string;
    };
  }[];
}

const ManagerEvaluationTab = ({ userId, cycle }: Props) => {
  const [groupedCriteria, setGroupedCriteria] = useState<
    Record<string, GroupedCriterion[]>
  >({});
  const [filledTopics, setFilledTopics] = useState<Record<string, boolean>>({});
  const [managerAnswers, setManagerAnswers] = useState<
    Record<string, { score: number; justification: string }>
  >({});

  useEffect(() => {
    const fetchAutoEvaluation = async () => {
      try {
        const res = await api.get(`/users/${userId}/findAutoavaliation`);
        const evaluations: AutoEvaluationResponse[] = res.data;
        const current = evaluations.find((e) => e.cycleId === cycle.cycleId);

        if (!current) return;

        const grouped: Record<string, GroupedCriterion[]> = {};
        const filled: Record<string, boolean> = {};

        current.answers.forEach(({ criterion, score, justification }) => {
          const topic = criterion.type;
          if (!grouped[topic]) grouped[topic] = [];
          grouped[topic].push({
            id: criterion.id,
            title: criterion.title,
            topic,
            autoScore: score ?? 0,
            autoJustification: justification ?? "",
          });
          filled[topic] = false;
        });

        setGroupedCriteria(grouped);
        setFilledTopics(filled);
      } catch (err) {
        console.error("Erro ao buscar autoavaliação", err);
      }
    };

    fetchAutoEvaluation();
  }, [userId, cycle.cycleId]);

  const handleFilledChange = (topic: string, isFilled: boolean) => {
    setFilledTopics((prev) => {
      if (prev[topic] === isFilled) return prev;
      return { ...prev, [topic]: isFilled };
    });
  };

  const handleManagerAnswerChange = (
    criterionId: string,
    score: number,
    justification: string
  ) => {
    setManagerAnswers((prev) => {
      const current = prev[criterionId];
      if (
        current?.score === score &&
        current?.justification === justification
      ) {
        return prev;
      }
      return {
        ...prev,
        [criterionId]: { score, justification },
      };
    });
  };

  const handleSubmitEvaluation = async () => {
    const answers = Object.entries(managerAnswers)
      .filter(
        ([_, { score, justification }]) =>
          typeof score === "number" &&
          !isNaN(score) &&
          justification.trim().length > 0
      )
      .map(([criterionId, { score, justification }]) => ({
        criterionId,
        score,
        justification,
      }));

    if (!userId || !cycle?.cycleId || answers.length === 0) {
      alert("Preencha todos os campos obrigatórios antes de enviar.");
      return;
    }

    const payload = {
      subordinadoId: userId,
      cycleId: cycle.cycleId,
      answers,
      completed: true,
    };

    console.log("Enviando avaliação:", payload);
    console.log(
      "Payload detalhado:",
      JSON.stringify(
        {
          subordinadoId: userId,
          cycleId: cycle.cycleId,
          answers,
          completed: true,
        },
        null,
        2
      )
    );
    try {
      await api.post("/avaliacao/gestor/avaliar-subordinado", payload);
      alert("Avaliação enviada com sucesso.");
    } catch (err: any) {
      console.error("Erro ao enviar avaliação", err);
      console.error("Resposta detalhada:", err.response?.data);
      alert(
        "Erro ao enviar avaliação. Verifique os campos ou tente novamente."
      );
    }
  };

  const canSubmit = Object.values(filledTopics).every(Boolean);
  const topics = Object.entries(groupedCriteria);

  return (
    <div className="flex flex-col gap-6 p-6">
      {topics.map(([topic, criteria]) => (
        <ManagerEvaluationForm
          key={topic}
          topic={topic}
          criteria={criteria}
          onAllFilledChange={(filled) => handleFilledChange(topic, filled)}
          onManagerAnswerChange={handleManagerAnswerChange}
        />
      ))}
      <button
        disabled={!canSubmit}
        onClick={handleSubmitEvaluation}
        className={`ml-auto text-sm px-4 py-2 rounded transition self-end ${
          canSubmit
            ? "bg-brand text-white hover:bg-brand/90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Concluir e enviar
      </button>
    </div>
  );
};

export default ManagerEvaluationTab;
