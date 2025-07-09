import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Pencil, Goal, TrashIcon, Check } from "lucide-react";
import { DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";

interface GoalAction {
  description: string;
  deadline: string;
  completed: boolean;
}

interface GoalData {
  title: string;
  description: string;
  actions: GoalAction[];
}

interface GoalFunctions {
  onEditGoal: () => void;
  onDeleteGoal?: () => void;
}

const GoalCard = ({
  title,
  description,
  actions,
  onEditGoal,
  onDeleteGoal,
}: GoalData & GoalFunctions) => {
  const progress = Math.round(
    (actions.filter((a) => a.completed).length / actions.length) * 100
  );
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-5">
      <div className="flex justify-between gap-4">
        <div className="flex items-start gap-4">
          <Goal className="mt-1" />
          <div className="flex flex-col">
            <h2 className="gap-2 text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div>
          <button
            className="text-text-primary hover:underline text-xs px-2 py-1 rounded"
            title="Editar"
            onClick={onEditGoal}
          >
            <Pencil size={20} />
          </button>
          <button
            className="text-red-600 hover:underline text-xs px-2 py-1 rounded"
            title="Apagar"
            onClick={onDeleteGoal}
          >
            <TrashIcon size={20} />
          </button>
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
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left font-semibold">
                  Planos de Ação
                </th>
                <th className="px-3 py-2 text-left font-semibold">Prazo</th>
                <th className="px-3 py-2 text-center font-semibold">
                  Concluída
                </th>
                <th className="px-3 py-2 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{a.description}</td>
                  <td className="px-3 py-2">{a.deadline}</td>
                  <td className="px-3 py-2 text-center">
                    <label className="inline-flex items-center cursor-pointer group">
                      <button
                        type="button"
                        className={
                          `w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 p-0 !important ` +
                          (a.completed
                            ? "bg-brand border-brand"
                            : "bg-white border-gray-300 group-hover:border-brand")
                        }
                        aria-pressed={a.completed}
                        title={
                          a.completed ? "Concluída" : "Marcar como concluída"
                        }
                        // onClick={() => }
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
                  <td className="px-3 py-2 text-center flex gap-2 justify-center">
                    <button
                      className="text-text-primary hover:underline text-xs px-2 py-1 rounded"
                      title="Editar"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:underline text-xs px-2 py-1 rounded"
                      title="Apagar"
                    >
                      <TrashIcon size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-gray-600 text-xs hover:bg-muted">
                Novo Plano de Ação
              </button>
            </DialogTrigger>
            <DialogContent>
              <form className="flex flex-col gap-3">
                <DialogHeader>
                  <DialogTitle>Adicionar Plano de Ação</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do novo plano de ação.
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full flex flex-col gap-1">
                  <p>Título</p>
                  <input
                    maxLength={100}
                    className="bg-white border rounded-md h-10 p-2 font-normal focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Digite seu plano de ação"
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <p>Prazo</p>
                  <input
                    maxLength={250}
                    className="bg-white border rounded-md h-10 p-2 font-normal focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Digite uma descrição"
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
