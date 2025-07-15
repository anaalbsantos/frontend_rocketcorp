import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/stores/useNotificationStore";
import toast from "react-hot-toast";

export function useNotificationSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnects = 5;
  const { addNotification } = useNotificationStore();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) return;

    const connectSocket = () => {
      const socket = io("http://localhost:3000/notifications", {
        auth: { token },
        transports: ["websocket", "polling"],
        timeout: 10000,
      });

      socket.on("connect", () => {
        console.log("[Socket] Conectado ao servidor de notificações");
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      socket.on("disconnect", (reason) => {
        console.warn("[Socket] Desconectado:", reason);
        setIsConnected(false);
        handleReconnect();
      });

      socket.on("connect_error", (error) => {
        console.error("[Socket] Erro de conexão:", error.message);
        handleReconnect();
      });

      socket.on("notification", (notification) => {
        console.log("[Socket] Notificação recebida:", notification);
        addNotification(notification); // Atualiza a store
        window.dispatchEvent(
          new CustomEvent("newNotification", { detail: notification })
        );

        // Exibe toast
        toast(notification.message, {
          icon: "🔔",
        });
      });

      socketRef.current = socket;
    };

    const handleReconnect = () => {
      if (reconnectAttempts.current >= maxReconnects) return;

      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
      reconnectAttempts.current += 1;

      setTimeout(() => {
        console.log(
          `[Socket] Tentando reconectar... (${reconnectAttempts.current})`
        );
        connectSocket();
      }, delay);
    };

    connectSocket();

    return () => {
      socketRef.current?.disconnect();
      setIsConnected(false);
    };
  }, [token]);

  return { isConnected };
}
