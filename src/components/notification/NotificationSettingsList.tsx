import { useEffect, useState } from "react";
import api from "@/api/api";
import { NotificationForm } from "./NotificationForm";

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
};

export const NotificationSettingsList = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [selectedSetting, setSelectedSetting] =
    useState<NotificationSetting | null>(null);
  const [cycleId, setCycleId] = useState<string>("");

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

  return (
    <div className="space-y-6">
      {!selectedSetting ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Configurações de Notificação
          </h2>
          <ul className="divide-y divide-gray-200">
            {settings.map((setting) => (
              <li
                key={setting.notificationType}
                className="py-4 flex items-center justify-between hover:bg-gray-50 px-2 rounded cursor-pointer"
                onClick={() => setSelectedSetting(setting)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {typeLabels[setting.notificationType] ||
                      setting.notificationType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {setting.frequency} às {setting.scheduledTime} | Prioridade:{" "}
                    {setting.priority}
                  </p>
                </div>
                <span className="text-blue-600 text-sm">Editar</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <NotificationForm
            key={selectedSetting.notificationType}
            initialValues={selectedSetting}
            isEdit
          />
          <div className="mt-4">
            <button
              onClick={() => setSelectedSetting(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Voltar para lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
