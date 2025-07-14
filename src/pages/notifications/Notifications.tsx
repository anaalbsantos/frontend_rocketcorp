import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import TabsContent from "@/components/TabContent";
import { NotificationForm } from "@/components/notification/NotificationForm";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationSettingsList } from "@/components/notification/NotificationSettingsList";

export default function NotificationsPage() {
  const { role, userId } = useUser();
  const [activeTab, setActiveTab] = useState("histórico");
  const { notifications, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (userId) {
      console.log("🔍 Buscando notificações para userId:", userId);
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  const tabs = role === "rh" ? ["configurações", "criação"] : ["histórico"];

  return (
    <TabsContent
      tabs={tabs}
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      contentByTab={{
        configurações: role === "rh" ? <NotificationSettingsList /> : null,
        criação: role === "rh" ? <NotificationForm /> : null,
        histórico: (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Histórico de Notificações</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500">Nenhuma notificação recebida.</p>
            ) : (
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
            )}
          </div>
        ),
      }}
    />
  );
}
