import { Progress } from "@/components/ui/progress";
import { Pencil, Goal, TrashIcon } from "lucide-react";

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

const GoalCard = ({ title, description, actions }: GoalData) => {
  const progress = Math.round(
    (actions.filter((a) => a.completed).length / actions.length) * 100
  );
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <Goal className="mt-1" />
        <div className="flex flex-col">
          <h2 className="gap-2 text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <h3 className="text-sm font-medium">{progress}%</h3>
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
                      <input
                        type="checkbox"
                        // checked={acao.status === "concluida"}
                        readOnly
                        className="sr-only peer"
                      />
                      <span
                        className={
                          `w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ` +
                          (a.completed
                            ? "bg-brand border-brand"
                            : "bg-white border-gray-300 group-hover:border-brand")
                        }
                      >
                        {a.completed && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
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
          <button className="text-gray-600 text-xs hover:bg-muted">
            Novo Plano de Ação
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
