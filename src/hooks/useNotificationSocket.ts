import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/stores/useNotificationStore";

export function useNotificationSocket(token?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxAttempts = 5;

  const { addNotification, fetchUnreadCount } = useNotificationStore.getState();

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:3000/notifications", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Conectado ao servidor de notificações");
      reconnectAttempts.current = 0;
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Desconectado:", reason);
      setIsConnected(false);

      if (
        reason !== "io client disconnect" &&
        reconnectAttempts.current < maxAttempts
      ) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000
        );
        reconnectAttempts.current++;
        console.log(
          `[Socket] Tentando reconectar... (${reconnectAttempts.current})`
        );

        setTimeout(() => {
          socket.connect();
        }, delay);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Erro de conexão:", err.message);
    });

    socket.on("notification", (notification) => {
      console.log("[Socket] Nova notificação recebida:", notification);
      addNotification(notification);
      fetchUnreadCount();
    });

    return () => {
      socket.disconnect();
      setIsConnected(false);
    };
  }, [token]);

  return { isConnected };
}
