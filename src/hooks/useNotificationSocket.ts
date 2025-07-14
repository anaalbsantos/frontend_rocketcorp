import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/contexts/UserContext";
import { useNotificationStore } from "@/stores/useNotificationStore";
import toast from "react-hot-toast";

const SOCKET_URL = "http://localhost:3000/notifications";

export const useNotificationSocket = () => {
  const { userId, token } = useUser();
  const { addNotification, fetchNotifications } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log(
      "[Socket] Verificando conexão. userId:",
      userId,
      "token:",
      token
    );

    if (!userId || !token) {
      console.log("[Socket] Não conectado: userId ou token ausente.");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Conectado com sucesso");
    });

    socket.on("notification", (notification) => {
      console.log("[Socket] Notificação recebida:", notification);
      addNotification(notification);
      toast(notification.title, { icon: "🔔" });
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Desconectado do servidor");
    });

    return () => {
      console.log("[Socket] Limpando socket");
      socket.disconnect();
    };
  }, [userId, token]);
};
