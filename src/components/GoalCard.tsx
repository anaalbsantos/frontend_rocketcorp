import { Progress } from "@/components/ui/progress";
import {} from "@radix-ui/react-dialog";
import { Pencil, Goal, TrashIcon, Check } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { DatePicker } from "./DatePicker";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import api from "@/api/api";
import toast from "react-hot-toast";
import type { GoalAction, GoalData } from "@/types";
interface GoalActionFormValues {
  description: string;
  deadline: Date | undefined;
  completed?: boolean;
}

interface GoalFunctions {
  track: string;
  viewOnly?: boolean;
  onEditGoal?: () => void;
  onDeleteGoal?: () => void;
  onActionsUpdated?: (goalId: string, newActions: GoalAction[]) => void;
}

const GoalCard = ({
  id,
  title,
  description,
  actions,
  track,
  viewOnly = false,
  onEditGoal,
  onDeleteGoal,
  onActionsUpdated,
}: GoalData & GoalFunctions) => {
  const { register, handleSubmit, control, reset } =
    useForm<GoalActionFormValues>();
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<GoalAction | null>(null);

  const progress = Math.round(
    (actions.filter((a) => a.completed).length / actions.length) * 100
  );

  const handleNewGoalAction: SubmitHandler<GoalActionFormValues> = async (
    data: GoalActionFormValues
  ) => {
    try {
      if (selectedAction) {
        // Editar action existente
        const response = await api.patch(`/goal/${selectedAction.id}/actions`, {
          description: data.description,
          deadline: data.deadline,
        });
        const updatedActions = actions.map((a) =>
          a.id === selectedAction.id ? { ...a, ...response.data } : a
        );
        onActionsUpdated?.(id, updatedActions);
        toast.success("Edição feita com sucesso!");
      } else {
        // Nova action
        const response = await api.post(`/goal/${id}`, {
          description: data.description,
          deadline: data.deadline,
        });
        onActionsUpdated?.(id, [...actions, response.data]);
        toast.success(
          `${
            track === "FINANCEIRO" ? "Resultado-chave" : "Plano de ação"
          } criado com sucesso!`
        );
      }
      setOpen(false);
      setSelectedAction(null);
    } catch {
      console.error("Erro ao salvar");
      toast.error("Erro ao salvar");
    } finally {
      setOpen(false);
      setSelectedAction(null);
    }
  };

  const handleDeleteGoalAction = async (actionId: string) => {
    try {
      await api.delete(`/goal/${actionId}/actions`);
      const updatedActions = actions.filter((a) => a.id !== actionId);
      onActionsUpdated?.(id, updatedActions);
      toast.success(
        `${
          track === "FINANCEIRO" ? "Resultado-chave" : "Plano de ação"
        } apagado com sucesso!`
      );
    } catch {
      console.error("Erro ao apagar.");
      toast.error("Erro ao apagar.");
    }
  };

  const handleToggleCompleted = async (
    actionId: string,
    currentCompleted: boolean
  ) => {
    try {
      await api.patch(`/goal/${actionId}/actions`, {
        completed: !currentCompleted,
      });
      const updatedActions = actions.map((a) =>
        a.id === actionId ? { ...a, completed: !currentCompleted } : a
      );
      onActionsUpdated?.(id, updatedActions);
      toast.success("Status atualizado com sucesso!");
    } catch {
      console.error("Erro ao atualizar status");
      toast.error("Erro ao atualizar status");
    }
  };

  function formatDate(date: string | Date | undefined): string {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  }

  // Reset form quando selectedAction mudar
  useEffect(() => {
    if (selectedAction) {
      reset({
        description: selectedAction.description,
        deadline: new Date(selectedAction.deadline),
      });
    } else {
      reset({ description: "", deadline: undefined });
    }
  }, [selectedAction, reset]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-5">
      <div className="flex justify-between gap-4">
        <div className="flex items-start gap-4">
          <Goal className="mt-1 min-w-5" />
          <div className="flex flex-col">
            <h2 className="gap-2 text-base sm:text-lg font-semibold whitespace-break-spaces">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div>
          {!viewOnly && (
            <>
              <button
                className="text-text-primary hover:underline text-xs px-2 py-1 rounded"
                title="Editar"
                onClick={onEditGoal}
              >
                <Pencil className="w-4 sm:w-5" />
              </button>
              <button
                className="text-red-600 hover:underline text-xs px-2 py-1 rounded"
                title="Apagar"
                onClick={onDeleteGoal}
              >
                <TrashIcon className="w-4 sm:w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <h3 className="text-sm font-medium">{progress || 0}%</h3>
        <Progress
          value={progress}
          className={"h-3 [&>div]:rounded-full [&>div]:bg-brand"}
        />
      </div>

      <div className="space-y-2">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded-xl">
            <thead>
              <tr className="bg-gray-100 text-xs sm:text-sm">
                <th className="px-3 py-2 text-left font-semibold">
                  {track === "FINANCEIRO"
                    ? "Resultados-chave"
                    : "Planos de Ação"}
                </th>
                <th className="px-3 py-2 text-left font-semibold">Prazo</th>
                <th className="px-3 py-2 text-center font-semibold">
                  Concluída
                </th>
                {!viewOnly && (
                  <th className="px-3 py-2 text-center font-semibold">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {actions.map((a, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 text-xs sm:text-sm"
                >
                  <td className="px-3 py-2 break-words">{a.description}</td>
                  <td className="px-3 py-2">{formatDate(a.deadline)}</td>
                  <td className="px-3 py-2 text-center">
                    <label className="inline-flex items-center cursor-pointer group">
                      <button
                        type="button"
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 p-0
                          ${
                            a.completed
                              ? "bg-brand border-brand"
                              : `bg-white border-gray-300 ${
                                  viewOnly ?? "group-hover:border-brand"
                                }`
                          }
                        `}
                        aria-pressed={a.completed}
                        title={
                          a.completed ? "Concluída" : "Marcar como concluída"
                        }
                        onClick={() => handleToggleCompleted(a.id, a.completed)}
                        disabled={viewOnly}
                      >
                        <Check
                          size={16}
                          className={
                            a.completed ? "text-white" : "text-transparent"
                          }
                        />
                      </button>
                    </label>
                  </td>
                  {!viewOnly && (
                    <td className="px-3 py-2 text-center align-middle">
                      <div className="flex gap-1 justify-center">
                        <button
                          className="text-text-primary hover:underline text-xs px-2 py-1 rounded"
                          title="Editar"
                          onClick={() => {
                            setSelectedAction(a);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="w-4 sm:w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:underline text-xs px-2 py-1 rounded"
                          title="Apagar"
                          onClick={() => handleDeleteGoalAction(a.id)}
                        >
                          <TrashIcon className="w-4 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setSelectedAction(null);
            }}
          >
            <DialogTrigger asChild>
              {!viewOnly && (
                <button className="text-gray-600 text-xs hover:bg-muted p-2">
                  Novo{" "}
                  {track === "FINANCEIRO" ? "Resultado-chave" : "Plano de Ação"}
                </button>
              )}
            </DialogTrigger>
            <DialogContent>
              <form
                className="flex flex-col gap-3"
                onSubmit={handleSubmit(handleNewGoalAction)}
              >
                <DialogHeader>
                  <DialogTitle>
                    Adicionar{" "}
                    {track === "FINANCEIRO"
                      ? "Resultado-chave"
                      : "Plano de ação"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do novo{" "}
                    {track === "FINANCEIRO"
                      ? "resultado-chave"
                      : "plano de ação"}
                    .
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full flex flex-col gap-1">
                  <p>Título</p>
                  <input
                    {...register("description", { required: true })}
                    maxLength={100}
                    className="bg-white border rounded-md h-10 p-2 font-normal focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder={`Digite o título do ${
                      track === "FINANCEIRO"
                        ? "resultado-chave"
                        : "plano de ação"
                    }`}
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <p>Prazo</p>
                  <Controller
                    name="deadline"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <DialogFooter>
                  <button
                    type="submit"
                    className="bg-brand text-white px-4 py-2 rounded-md"
                  >
                    Salvar
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
