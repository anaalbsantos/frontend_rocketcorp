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
  isEdit?: boolean;
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
];

const priorities = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
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

export const NotificationForm = ({
  initialValues,
  isEdit = false,
}: NotificationFormProps) => {
  const [message, setMessage] = useState(initialValues?.customMessage || "");
  const [notificationType, setNotificationType] = useState(
    initialValues?.notificationType || "EVALUATION_DUE"
  );
  const [priority, setPriority] = useState(initialValues?.priority || "MEDIUM");
  const [frequency, setFrequency] = useState(
    initialValues?.frequency || "DAILY"
  );
  const [weekDay, setWeekDay] = useState(initialValues?.weekDay || "MONDAY");
  const [scheduledTime, setScheduledTime] = useState(
    initialValues?.scheduledTime || "08:00"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        notificationType,
        enabled: true,
        reminderDays,
        customMessage: message,
        scheduledTime,
        frequency,
        weekDay,
        priority,
        userFilters: {
          roles: selectedRoles,
          teams: selectedTeams,
          includeUsers: selectedUsers,
        },
      };

      if (isEdit) {
        await api.put(
          `/notification-settings/cycles/${cycleId}/${notificationType}`,
          payload
        );
        toast.success("Configuração atualizada com sucesso!");
      } else {
        await api.post(`/notification-settings/cycles/${cycleId}`, payload);
        toast.success("Configuração criada com sucesso!");
      }

      setMessage("");
      setSelectedRoles([]);
      setSelectedUsers([]);
      setSelectedTeams([]);
    } catch {
      toast.error("Erro ao salvar configuração de notificação");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl bg-white p-6 border rounded-md shadow-sm"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        {isEdit
          ? "Editar Configuração de Notificação"
          : "Nova Configuração de Notificação"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem personalizada
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
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
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridade
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequência
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
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
              className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
            >
              {weekdays.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horário programado
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dias de antecedência
          </label>
          <input
            type="number"
            value={reminderDays}
            onChange={(e) => setReminderDays(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
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
          disabled={!cycleId}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {isEdit ? "Salvar alterações" : "Salvar configuração"}
        </button>
      </div>
    </form>
  );
};
