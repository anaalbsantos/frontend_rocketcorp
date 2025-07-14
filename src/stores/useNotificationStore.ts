import { create } from "zustand";
import api from "@/api/api";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
  priority: string;
  metadata: Record<string, unknown>;
}
interface NotificationSetting {
  id: string;
  cycleId: string;
  notificationType: string;
  enabled: boolean;
  reminderDays: number;
  customMessage: string;
  scheduledTime: string;
  frequency: string;
  weekDay?: string;
  priority: string;
  userFilters: {
    roles: string[];
    teams: string[];
    includeUsers: string[];
    excludeUsers?: string[];
    positions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  notificationSettings: NotificationSetting[];
  fetchNotifications: () => void;
  fetchNotificationSettings: (cycleId: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [] as Notification[],
  notificationSettings: [] as NotificationSetting[],

  fetchNotifications: async () => {
    try {
      const res = await api.get("/notifications");
      set({ notifications: res.data });
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    }
  },

  fetchNotificationSettings: async (cycleId: string) => {
    try {
      const res = await api.get(`/notification-settings/cycles/${cycleId}`);
      set({ notificationSettings: res.data });
    } catch (err) {
      console.error("Erro ao buscar configurações de notificação:", err);
    }
  },
}));
