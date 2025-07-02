import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/api";

import { Sidebar } from "../components/Sidebar";
type Role = "colaborador" | "gestor" | "rh" | "comite";

interface LayoutProps {
  role: Role;
  userName: string;
  onLogout: () => void;
}

export const Layout = ({ role, userName, onLogout }: LayoutProps) => {
  const [cycleStatus, setCycleStatus] = useState<
    "aberto" | "emRevisao" | "finalizado" | null
  >(null);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const { data } = await api.get("/score-cycle");

        const now = new Date();
        const reviewDate = new Date(data.reviewDate);
        const endDate = new Date(data.endDate);

        const status =
          endDate < now
            ? "finalizado"
            : reviewDate < now
            ? "emRevisao"
            : "aberto";

        setCycleStatus(status);
      } catch (err) {
        console.error("erro ao buscar ciclo para sidebar", err);
        setCycleStatus(null);
      }
    };

    if (role === "gestor" || role === "colaborador") {
      fetchCycle();
    }
  }, [role]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        role={role}
        userName={userName}
        onLogout={onLogout}
        cycleStatus={cycleStatus}
      />

      <main className="flex-1 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
