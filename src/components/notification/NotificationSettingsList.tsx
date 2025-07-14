import { useEffect, useState } from "react";
import api from "@/api/api";
import { NotificationForm } from "./NotificationForm";
import { Pencil, Trash, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface NotificationSetting {
  notificationType: string;
  priority: string;
  frequency: string;
  weekDay?: string;
  scheduledTime?: string;
  reminderDays?: number;
  customMessage?: string;
  userFilters: {
    roles: string[];
    teams: string[];
    includeUsers: string[];
  };
}

const typeLabels: Record<string, string> = {
  EVALUATION_DUE: "Lembrete de Avaliações Pendentes",
  GOAL_DEADLINE_APPROACHING: "Prazo de Metas se Aproximando",
  SURVEY_AVAILABLE: "Nova Pesquisa Disponível",
  CYCLE_ENDING: "Fim do Ciclo de Avaliação",
  MENTORSHIP_EVALUATION: "Avaliação de Mentoria",
};

const frequencyLabels: Record<string, string> = {
  DAILY: "Diariamente",
  WEEKLY: "Semanalmente",
  MONTHLY: "Mensalmente",
};

export const NotificationSettingsList = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [selectedSetting, setSelectedSetting] =
    useState<NotificationSetting | null>(null);
  const [cycleId, setCycleId] = useState<string>("");
  const [toDelete, setToDelete] = useState<NotificationSetting | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    api.get("/users").then((res) => {
      setCycleId(res.data.ciclo_atual_ou_ultimo?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!cycleId) return;
    api.get(`/notification-settings/cycles/${cycleId}`).then((res) => {
      setSettings(res.data);
    });
  }, [cycleId]);

  const formatWeekday = (day?: string) => {
    const days: Record<string, string> = {
      MONDAY: "segunda-feira",
      TUESDAY: "terça-feira",
      WEDNESDAY: "quarta-feira",
      THURSDAY: "quinta-feira",
      FRIDAY: "sexta-feira",
    };
    return days[day || ""] || day;
  };

  return (
    <div className="space-y-6">
      {!selectedSetting ? (
        <div>
          <ul className="grid gap-4">
            {settings
              .filter((s) => s.notificationType !== "SYSTEM_ANNOUNCEMENT")
              .map((setting) => (
                <li
                  key={setting.notificationType}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedSetting(setting)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {typeLabels[setting.notificationType] ||
                        setting.notificationType}
                    </p>

                    <p className="text-xs text-gray-500">
                      {setting.frequency === "WEEKLY"
                        ? `Toda ${formatWeekday(setting.weekDay)}`
                        : frequencyLabels[setting.frequency] ||
                          setting.frequency}
                      {" às "}
                      {setting.scheduledTime}
                    </p>

                    {setting.reminderDays !== undefined && (
                      <p className="text-xs text-gray-500">
                        Notificação enviada a partir de {setting.reminderDays}{" "}
                        dia
                        {setting.reminderDays > 1 ? "s" : ""} antes do evento
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSetting(setting);
                      }}
                    >
                      <Pencil
                        size={16}
                        className="text-emerald-600 hover:text-emerald-700"
                      />
                    </button>

                    <button
                      title="Excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        setToDelete(setting);
                      }}
                    >
                      <Trash
                        size={16}
                        className="text-red-600 hover:text-red-800"
                      />
                    </button>
                  </div>
                </li>
              ))}
          </ul>

          {toDelete && (
            <ConfirmDialog
              title="Excluir notificação?"
              description="Tem certeza que deseja excluir esta notificação agendada? Esta ação não pode ser desfeita."
              onCancel={() => setToDelete(null)}
              onConfirm={async () => {
                try {
                  await api.delete(
                    `/notification-settings/cycles/${cycleId}/${toDelete.notificationType}`
                  );
                  setSettings((prev) =>
                    prev.filter(
                      (s) => s.notificationType !== toDelete.notificationType
                    )
                  );
                  setToDelete(null);
                } catch {
                  alert("Erro ao excluir notificação");
                }
              }}
            />
          )}
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setConfirmClose(true)}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600"
            title="Fechar"
          >
            <X size={20} />
          </button>

          <NotificationForm
            key={selectedSetting.notificationType}
            initialValues={selectedSetting}
            isEdit
            onSuccess={() => setSelectedSetting(null)}
          />

          {confirmClose && (
            <ConfirmDialog
              title="Descartar alterações?"
              description="Suas alterações não serão salvas. Deseja realmente sair da edição?"
              onCancel={() => setConfirmClose(false)}
              onConfirm={() => {
                setConfirmClose(false);
                setSelectedSetting(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
