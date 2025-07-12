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
  fetchNotifications: (userId: string) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: (userId: string) => {
    // MOCK: substitua por chamada real ao backend
    const now = new Date();
    const mockData: Notification[] = [
      {
        id: "1",
        title: "Novo ciclo iniciado",
        message: "O ciclo 2025.2 começou hoje. Prepare-se para a avaliação.",
        read: false,
        createdAt: now.toISOString(),
      },
      {
        id: "2",
        title: "Meta concluída",
        message: "Sua meta 'Automatizar relatórios' foi concluída com sucesso!",
        read: false,
        createdAt: new Date(now.getTime() - 3600 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Lembrete: Avaliação pendente",
        message: "Você ainda não avaliou seu colaborador João.",
        read: true,
        createdAt: new Date(now.getTime() - 86400 * 1000).toISOString(),
      },
    ];

    set({
      notifications: mockData,
      unreadCount: mockData.filter((n) => !n.read).length,
    });
  },

  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
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

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({
      notifications: updated,
      unreadCount: 0,
    });
  },

  removeNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
  },
}));
