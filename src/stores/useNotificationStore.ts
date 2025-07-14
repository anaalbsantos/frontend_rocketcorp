import api from "@/api/api";
import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notification: Notification) => void; // 🔹 nova função
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await api.get(`/notifications`, {
        params: { unreadOnly: false, limit: 50, offset: 0 },
      });
      const data = res.data as Notification[];
      console.log("📬 Notificações recebidas:", res.data);
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.read).length,
      });
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.post(`/notifications/mark-as-read/${id}`);
      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      });
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  },

  markAsUnread: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: false } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
  },

  markAllAsRead: async () => {
    try {
      await api.post(`/notifications/mark-all-as-read`);
      const updated = get().notifications.map((n) => ({ ...n, read: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  },

  removeNotification: async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      const updated = get().notifications.filter((n) => n.id !== id);
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      });
    } catch (error) {
      console.error("Erro ao remover notificação:", error);
    }
  },

  addNotification: (notification) => {
    const current = get().notifications;
    const updated = [notification, ...current];
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
  },
}));
