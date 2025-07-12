import { useEffect, useRef, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreVertical } from "lucide-react";

const NotificationsPage = () => {
  const { userId, role } = useUser();
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
    unreadCount,
  } = useNotificationStore();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (userId) fetchNotifications(userId);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleToggleRead = (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;
    notif.read ? markAsUnread(id) : markAsRead(id);
    setOpenMenuId(null);
  };

  const titleByRole = {
    colaborador: "Notificações",
    gestor: "Notificações",
    rh: "Gestão de Notificações",
  } as const;

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          {titleByRole[role as "colaborador" | "gestor" | "rh"] ??
            "Notificações"}
          {unreadCount > 0 && (
            <span className="text-brand font-medium">({unreadCount})</span>
          )}
        </h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-brand hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-text-muted">Nenhuma notificação por enquanto.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="border border-border rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="mt-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full transition ${
                        n.read ? "opacity-0" : "bg-red-600"
                      }`}
                      aria-label="Status de leitura"
                      role="status"
                    />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-text-primary">{n.title}</p>
                    <p className="text-sm text-text-muted">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(n.createdAt), "d 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                <div className="relative" ref={menuRef}>
                  <MoreVertical
                    className="w-5 h-5 text-text-muted cursor-pointer"
                    onClick={() => toggleMenu(n.id)}
                  />
                  {openMenuId === n.id && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-border rounded-md shadow-md z-10 animate-fade-in">
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        onClick={() => handleToggleRead(n.id)}
                      >
                        {n.read ? "Marcar como não lida" : "Marcar como lida"}
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => setConfirmingId(n.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmingId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-md w-[90%] max-w-sm">
            <h2 className="text-lg font-bold text-text-primary mb-2">
              Excluir notificação
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Tem certeza de que deseja excluir esta notificação?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmingId(null)}
                className="px-4 py-1 text-sm rounded-md border border-border hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removeNotification(confirmingId);
                  setConfirmingId(null);
                  setOpenMenuId(null);
                }}
                className="px-4 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
