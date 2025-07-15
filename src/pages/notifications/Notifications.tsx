import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import TabsContent from "@/components/TabContent";
import { NotificationForm } from "@/components/notification/NotificationForm";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationSettingsList } from "@/components/notification/NotificationSettingsList";
import api from "@/api/api";
import toast from "react-hot-toast";
import { NotificationCard } from "@/components/notification/NotificationCard";

export default function NotificationsPage() {
  const { role, userId } = useUser();
  const [activeTab, setActiveTab] = useState(
    role === "rh" ? "notificações" : "histórico"
  );

  const {
    notifications,
    fetchNotifications,
    fetchNotificationSettings,
    notificationSettings,
    fetchUnreadCount,
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
        fetchNotificationSettings(id);
      } catch (err) {
        console.error("Erro ao buscar ciclo e configurações", err);
      }
    };

    if (userId) {
      fetchNotifications();
      if (role === "rh") loadCycleAndSettings();
    }
  }, [userId, fetchNotifications, fetchNotificationSettings, role]);

  const tabs = role === "rh" ? ["notificações", "agendar"] : ["histórico"];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white flex flex-col justify-between border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-normal text-gray-800">Notificações</h1>
        </div>

        <TabsContent
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabs={tabs}
          itemClasses={Object.fromEntries(
            tabs.map((tab) => [tab, "text-sm font-semibold px-6 py-3"])
          )}
          className="overflow-x-scroll sm:overflow-x-auto sm:scrollbar whitespace-nowrap"
        />
      </div>

      {activeTab === "notificações" && role === "rh" && (
        <div className="flex-1 p-6">
          <NotificationSettingsList />
        </div>
      )}

      {activeTab === "agendar" && role === "rh" && (
        <div className="flex-1 p-6">
          <NotificationForm
            existingTypes={notificationSettings.map((s) => s.notificationType)}
            onSuccess={() => setActiveTab("notificações")}
          />
        </div>
      )}

      {activeTab === "histórico" && role !== "rh" && (
        <div className="flex-1 p-6 overflow-y-auto scrollbar">
          {notifications.length === 0 ? (
            <p className="text-gray-500">Nenhuma notificação recebida.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  className="text-sm text-emerald-600 hover:underline"
                  onClick={async () => {
                    try {
                      await api.post("/notifications/mark-all-as-read");
                      fetchNotifications();
                      fetchUnreadCount();
                    } catch {
                      toast.error("Erro ao marcar notificações como lidas");
                    }
                  }}
                >
                  Marcar todas como lidas
                </button>
              </div>

              {notifications
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((n) => (
                  <NotificationCard
                    key={n.id}
                    id={n.id}
                    message={n.message}
                    createdAt={n.createdAt}
                    read={n.read}
                    type={n.type}
                    onClick={async () => {
                      if (!n.read) {
                        try {
                          await api.post(`/notifications/mark-as-read/${n.id}`);
                          fetchNotifications();
                          fetchUnreadCount();
                        } catch {
                          toast.error("Erro ao marcar notificação como lida");
                        }
                      }
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
