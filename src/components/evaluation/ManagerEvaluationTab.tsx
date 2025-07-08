import { useEffect, useState } from "react";
import api from "@/api/api";
import ManagerEvaluationForm from "@/components/evaluation/ManagerEvaluationForm";
import toast from "react-hot-toast";
import { useManagerEvaluationStore } from "@/stores/useManagerEvaluationStore";

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
  autoScore: number | null;
  autoJustification: string;
}

interface RawCriterion {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface AutoEvaluatedCriterion {
  criterion: RawCriterion;
  score: number | null;
  justification: string;
}

function isAutoEvaluatedCriterion(
  item: RawCriterion | AutoEvaluatedCriterion
): item is AutoEvaluatedCriterion {
  return (item as AutoEvaluatedCriterion).criterion !== undefined;
}

const ManagerEvaluationTab = ({ userId, cycle, alreadyEvaluated }: Props) => {
  const [groupedCriteria, setGroupedCriteria] = useState<
    Record<string, GroupedCriterion[]>
  >({});
  const [rawCriteria, setRawCriteria] = useState<
    Array<RawCriterion | AutoEvaluatedCriterion>
  >([]);

  const { getResponsesByUser, setResponse, clearResponsesByUser } =
    useManagerEvaluationStore();

  const responses = getResponsesByUser(userId);

  useEffect(() => {
    const fetchAutoEvaluation = async () => {
      try {
        const res = await api.get(`/users/${userId}/findAutoavaliation`);
        const data = res.data;

        let criteria: Array<RawCriterion | AutoEvaluatedCriterion> = [];

        if (Array.isArray(data) && data.length > 0 && data[0].answers) {
          criteria = data[0].answers;
        } else if (Array.isArray(data.assignedCriteria)) {
          criteria = data.assignedCriteria;
        } else {
          return;
        }

        const grouped: Record<string, GroupedCriterion[]> = {};

        criteria.forEach((item) => {
          const criterion = isAutoEvaluatedCriterion(item)
            ? item.criterion
            : item;
          const topic = criterion.type;

          if (!grouped[topic]) grouped[topic] = [];

          grouped[topic].push({
            id: criterion.id,
            title: criterion.title,
            topic,
            autoScore: isAutoEvaluatedCriterion(item)
              ? item.score ?? null
              : null,
            autoJustification: isAutoEvaluatedCriterion(item)
              ? item.justification ?? ""
              : "",
          });
        });

        setGroupedCriteria(grouped);
        setRawCriteria(criteria);
      } catch (err) {
        console.error("Erro ao buscar autoavaliação", err);
      }
    };

    fetchAutoEvaluation();
  }, [userId, cycle.cycleId]);

  useEffect(() => {
    rawCriteria.forEach((item) => {
      const criterion = isAutoEvaluatedCriterion(item) ? item.criterion : item;
      const id = criterion.id;
      const existing = getResponsesByUser(userId)[id];
      if (!existing) {
        setResponse(userId, id, {
          score: null,
          justification: "",
          filled: false,
        });
      }
    });
  }, [rawCriteria]);

  const canSubmit = Object.values(responses).every((r) => r.filled);

  const handleSubmitEvaluation = async () => {
    const answers = Object.entries(responses)
      .filter(([, v]) => v.filled)
      .map(([criterionId, { score, justification }]) => ({
        criterionId,
        score,
        justification,
      }));

    if (!userId || !cycle.cycleId || answers.length === 0) {
      toast.error("Preencha todos os campos obrigatórios antes de enviar.");
      return;
    }

    const payload = {
      subordinadoId: userId,
      cycleId: cycle.cycleId,
      answers,
      completed: true,
    };

    try {
      await toast.promise(
        api.post("/avaliacao/gestor/avaliar-subordinado", payload),
        {
          loading: "Enviando avaliação...",
          success: "Avaliação enviada com sucesso!",
          error: "Erro ao enviar a avaliação. Verifique os campos.",
        }
      );
      clearResponsesByUser(userId);
    } catch (err: unknown) {
      console.error("Erro ao enviar avaliação:", err);
    }
  };

  const topics = Object.entries(groupedCriteria);

  return (
    <div className="flex flex-col gap-6 p-6">
      {alreadyEvaluated ? (
        <div className="text-sm text-gray-600 bg-gray-50 p-6 rounded-md border border-gray-200">
          Este colaborador já foi avaliado por você neste ciclo.
        </div>
      ) : (
        <>
          {topics.map(([topic, criteria]) => (
            <ManagerEvaluationForm
              key={topic}
              topic={topic}
              criteria={criteria}
              responses={responses}
              userId={userId}
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
        </>
      )}
    </div>
  );
};

export default ManagerEvaluationTab;
