import { useEffect, useState } from "react";
import GoalCard from "@/components/GoalCard";
import api from "@/api/api";
import { useUser } from "@/contexts/UserContext";
import { type FieldValues, type SubmitHandler } from "react-hook-form";
import GoalModal from "@/components/GoalModal";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import InsightBox from "@/components/InsightBox";

interface GoalAction {
  id: string;
  description: string;
  deadline: string;
  completed: boolean;
}

interface GoalData {
  id: string;
  title: string;
  description: string;
  actions: GoalAction[];
}

interface FormData extends FieldValues {
  title: string;
  description: string;
}

const Goals = () => {
  const { userId } = useUser();
  const [goals, setGoals] = useState<(GoalData & { rec: string })[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  const [track, setTrack] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data } = await api.get(`/goal/${userId}`);
        const goalsWithRecs = await Promise.all(
          data.map(async (goal: GoalData) => {
            try {
              const recom = await api.get(
                `/genai/goal-recommendations/${userId}/goal/${goal.id}`
              );
              return {
                ...goal,
                rec:
                  recom.data.recomendacoes[0]?.recomendacoes ||
                  "Nenhuma recomendação disponível",
              };
            } catch {
              return {
                ...goal,
                rec: "Nenhuma recomendação disponível",
              };
            }
          })
        );
        setGoals(goalsWithRecs);
      } catch {
        console.error("Erro ao buscar objetivos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [userId]);

  useEffect(() => {
    const fetchUserTrack = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/findUserTracking`);
        setTrack(data.position.track);
      } catch (error) {
        console.error("Erro ao buscar track do usuário:", error);
      }
    };

    fetchUserTrack();
  }, [userId]);

  const handleNewGoal: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      if (selectedGoal) {
        // Editar objetivo existente
        const response = await api.patch(`/goal/${selectedGoal.id}`, {
          title: data.title,
          description: data.description,
        });
        setGoals((prevGoals) =>
          prevGoals.map((g) =>
            g.id === selectedGoal.id ? { ...g, ...response.data } : g
          )
        );
      } else {
        // Novo objetivo
        const response = await api.post(`/goal`, {
          title: data.title,
          description: data.description,
          type: "PDI",
        });
        setGoals((prevGoals) => [...prevGoals, response.data]);
      }
      setOpen(false);
      setSelectedGoal(null);

      toast.success("Objetivo salvo com sucesso!");
    } catch (e) {
      toast.error(
        "Erro ao salvar objetivo: " +
          (e instanceof Error ? e.message : "Erro desconhecido")
      );
    } finally {
      setOpen(false);
      setSelectedGoal(null);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.delete(`/goal/${goalId}`);
      setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));

      toast.success("Objetivo deletado com sucesso!");
    } catch (error) {
      toast.error(
        "Erro ao deletar objetivo: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    }
  };

  const updateGoalActions = (goalId: string, newActions: GoalAction[]) => {
    setGoals((prevGoals) =>
      prevGoals.map((g) =>
        g.id === goalId ? { ...g, actions: newActions } : g
      )
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <h3 className="font-bold">Objetivos</h3>
      </div>
      <div className="flex flex-col p-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
          <h3 className="font-bold">
            Acompanhamento {track === "FINANCEIRO" ? "de OKRs" : "do PDI"}
          </h3>
          <GoalModal
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setSelectedGoal(null);
            }}
            onSubmit={handleNewGoal}
            initialValues={
              selectedGoal
                ? {
                    title: selectedGoal.title,
                    description: selectedGoal.description,
                  }
                : undefined
            }
          />
        </div>
        {goals.map((g) => (
          <div key={g.id} className="flex flex-col gap-4">
            <GoalCard
              id={g.id}
              title={g.title}
              description={g.description}
              actions={g.actions || []}
              track={track}
              onEditGoal={() => {
                setSelectedGoal(g);
                setOpen(true);
              }}
              onDeleteGoal={() => handleDeleteGoal(g.id)}
              onActionsUpdated={updateGoalActions}
            />
            <div className="bg-white p-5 rounded-xl shadow-md">
              <h3 className="font-bold mb-2">Recomendações</h3>
              <InsightBox>{g.rec}</InsightBox>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;
