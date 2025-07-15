import { useEffect, useState } from "react";
import api from "@/api/api";
import toast from "react-hot-toast";
import { MultiSelect } from "@/components/notification/MultiSelect";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NotificationFormProps {
  initialValues?: Partial<{
    notificationType: string;
    priority: string;
    frequency: string;
    weekDay: string;
    scheduledTime: string;
    reminderDays: number;
    customMessage: string;
    userFilters: {
      roles: string[];
      teams: string[];
      includeUsers: string[];
    };
  }>;
  existingTypes?: string[];
  isEdit?: boolean;
  onSuccess?: () => void;
}

interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

const roleLabels: Record<string, string> = {
  COLABORADOR: "Colaboradores",
  LIDER: "Gestores",
};

const allRoles = Object.keys(roleLabels);

const teamLabels: Record<string, string> = {
  "team-frontend": "Time Frontend",
  "team-backend": "Time Backend",
  "team-design": "Time Design",
};

const notificationTypes = [
  { value: "EVALUATION_DUE", label: "Lembrete de Avaliações Pendentes" },
  {
    value: "GOAL_DEADLINE_APPROACHING",
    label: "Prazo de Metas se Aproximando",
  },
  { value: "SURVEY_AVAILABLE", label: "Nova Pesquisa Disponível" },
  { value: "CYCLE_ENDING", label: "Fim do Ciclo de Avaliação" },
];

const frequencies = [
  { value: "DAILY", label: "Diariamente" },
  { value: "WEEKLY", label: "Semanalmente" },
  { value: "MONTHLY", label: "Mensalmente" },
];

const weekdays = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
];

const scheduleOptions: Record<string, string[]> = {
  EVALUATION_DUE: ["08:00"],
  GOAL_DEADLINE_APPROACHING: ["09:00"],
  SURVEY_AVAILABLE: ["10:00"],
  CYCLE_ENDING: ["14:00"],
  MENTORSHIP_EVALUATION: ["16:00"],
};

export const NotificationForm = ({
  initialValues,
  existingTypes = [],
  isEdit = false,
  onSuccess,
}: NotificationFormProps) => {
  const [message, setMessage] = useState(initialValues?.customMessage || "");
  const [notificationType, setNotificationType] = useState(
    initialValues?.notificationType || ""
  );
  const [frequency, setFrequency] = useState(
    initialValues?.frequency || "DAILY"
  );
  const [weekDay, setWeekDay] = useState(initialValues?.weekDay || "MONDAY");
  const [scheduledTime, setScheduledTime] = useState(
    initialValues?.scheduledTime ||
      scheduleOptions[
        initialValues?.notificationType || "EVALUATION_DUE"
      ]?.[0] ||
      "08:00"
  );
  const [reminderDays, setReminderDays] = useState(
    initialValues?.reminderDays || 3
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    initialValues?.userFilters?.roles || []
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    initialValues?.userFilters?.includeUsers || []
  );
  const [selectedTeams, setSelectedTeams] = useState<string[]>(
    initialValues?.userFilters?.teams || []
  );
  const [users, setUsers] = useState<User[]>([]);
  const [cycleId, setCycleId] = useState<string>("");

  useEffect(() => {
    api.get("/users").then((res) => {
      const allowedRoles = ["COLABORADOR", "LIDER"];
      const filtered = res.data.usuarios.filter((u: User) =>
        allowedRoles.includes(u.role)
      );
      setUsers(filtered);
      setCycleId(res.data.ciclo_atual_ou_ultimo?.id);
    });
  }, []);

  const availableTypes = notificationTypes.filter(
    (type) => isEdit || !existingTypes.includes(type.value)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        notificationType,
        enabled: true,
        reminderDays: Number(reminderDays),
        customMessage: message,
        scheduledTime,
        frequency,
        ...(frequency === "WEEKLY" ? { weekDay } : {}),
        priority: "MEDIUM",
        userFilters: {
          roles: selectedRoles,
          teams: selectedTeams,
          includeUsers: selectedUsers,
          excludeUsers: [],
          positions: [],
        },
      };

      if (isEdit) {
        await api.put(
          `/notification-settings/cycles/${cycleId}/${notificationType}`,
          payload
        );
        toast.success("Configuração atualizada com sucesso!");
      } else {
        if (existingTypes.includes(notificationType)) {
          toast.error("Já existe uma notificação desse tipo configurada.");
          return;
        }

        await api.post(`/notification-settings/cycles/${cycleId}`, payload);
        toast.success("Configuração criada com sucesso!");
      }

      onSuccess?.();
      setMessage("");
      setSelectedRoles([]);
      setSelectedUsers([]);
      setSelectedTeams([]);
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      if (
        err.response?.status === 400 &&
        err.response.data?.message?.includes("already exists")
      ) {
        toast.error(
          "Já existe uma notificação desse tipo configurada para este ciclo."
        );
      } else {
        toast.error("Erro ao salvar configuração de notificação");
      }
    }
  };

  if (!isEdit && availableTypes.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-700">
        Todos os tipos de notificação já foram configurados para este ciclo.
        Para editar ou excluir uma notificação, utilize a aba de configurações.
      </div>
    );
  }

  return (
    <div className="max-h-[79vh] overflow-y-auto scrollbar">
      <form onSubmit={handleSubmit} className="space-y-6 w-full p-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {isEdit
            ? `Editando: ${
                notificationTypes.find((t) => t.value === notificationType)
                  ?.label || notificationType
              }`
            : "Agendar Notificação"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem personalizada
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full h-28 resize-none border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
              placeholder="Digite a mensagem que será enviada..."
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de lembrete
              </label>
              <select
                value={notificationType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setNotificationType(newType);
                  const defaultTime = scheduleOptions[newType]?.[0] || "08:00";
                  setScheduledTime(defaultTime);
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
              >
                <option value="" disabled>
                  Selecione um tipo
                </option>
                {notificationTypes.map((type) => {
                  const isDisabled =
                    !isEdit && existingTypes.includes(type.value);
                  return (
                    <option
                      key={type.value}
                      value={type.value}
                      disabled={isDisabled}
                    >
                      {type.label} {isDisabled ? "(já configurado)" : ""}
                    </option>
                  );
                })}
              </select>
              {!isEdit && existingTypes.includes(notificationType) && (
                <p className="mt-1 text-xs text-red-600">
                  Este tipo de notificação já foi configurado para este ciclo.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequência
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
            >
              {frequencies.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {frequency === "WEEKLY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia da semana
              </label>
              <select
                value={weekDay}
                onChange={(e) => setWeekDay(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
              >
                {weekdays.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scheduleOptions[notificationType] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário programado
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
              >
                {scheduleOptions[notificationType].map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dias de antecedência do evento
            </label>
            <input
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
              min={0}
            />
          </div>
        </div>

        <MultiSelect
          label="Cargo"
          options={allRoles.map((r) => ({ value: r, label: roleLabels[r] }))}
          selected={selectedRoles}
          onChange={setSelectedRoles}
        />

        <MultiSelect
          label="Time"
          options={Object.entries(teamLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          selected={selectedTeams}
          onChange={setSelectedTeams}
        />

        <MultiSelect
          label="Usuários específicos"
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          selected={selectedUsers}
          onChange={setSelectedUsers}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              !cycleId ||
              (!isEdit && existingTypes.includes(notificationType)) ||
              (!isEdit && notificationType === "")
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded disabled:opacity-50"
          >
            {isEdit ? "Salvar alterações" : "Salvar configuração"}
          </button>
        </div>
      </form>
    </div>
  );
};
