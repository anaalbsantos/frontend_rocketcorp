import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import TabsContent from "@/components/TabContent";
import { NotificationForm } from "@/components/notification/NotificationForm";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationSettingsList } from "@/components/notification/NotificationSettingsList";
import api from "@/api/api";

export default function NotificationsPage() {
  const { role, userId } = useUser();
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(
    role === "rh" ? "notificações" : "histórico"
  );

  const {
    notifications,
    fetchNotifications,
    fetchNotificationSettings,
    notificationSettings,
  } = useNotificationStore();

  useEffect(() => {
    const loadCycleAndSettings = async () => {
      try {
        const res = await api.get("/users");
        const id =
          res.data.cicloAtual?.id || res.data.ciclo_atual_ou_ultimo?.id;
        if (!id) {
          console.warn("Ciclo não encontrado");
          return;
        }
        setCycleId(id);
        fetchNotificationSettings(id);
      } catch (err) {
        console.error("Erro ao buscar ciclo e configurações", err);
      }
    };

    if (userId) {
      fetchNotifications();
      loadCycleAndSettings();
    }
  }, [userId, fetchNotifications, fetchNotificationSettings]);

  const tabs = role === "rh" ? ["notificações", "agendar"] : ["histórico"];

  const contentByTab = {
    notificações: <NotificationSettingsList />,
    agendar: (
      <NotificationForm
        existingTypes={notificationSettings.map(
          (s: { notificationType: string }) => s.notificationType
        )}
        onSuccess={() => setActiveTab("notificações")}
      />
    ),
    histórico: (
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">Nenhuma notificação recebida.</p>
        ) : (
          <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto bg-white p-4 space-y-1 text-sm shadow-sm scrollbar">
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li key={n.id} className="py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">Notificações</h2>
        </div>
        <div className="px-6">
          <TabsContent
            tabs={tabs}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            itemClasses={{
              notificações: "text-sm font-semibold px-6 py-3",
              agendar: "text-sm font-semibold px-6 py-3",
              histórico: "text-sm font-semibold px-6 py-3",
            }}
            className="border-b border-gray-200 px-6"
          />
        </div>
      </div>

      <div className="p-6">
        {contentByTab[activeTab as keyof typeof contentByTab]}
      </div>
    </div>
  );
}
