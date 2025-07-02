import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
/* import { useGestorDashboardData } from "@/pages/gestor/hooks/useGestorDashboardData"; */

type Role = "colaborador" | "gestor" | "rh" | "comite";

interface LayoutProps {
  role: Role;
  userName: string;
  onLogout: () => void;
}

export const Layout = ({ role, userName, onLogout }: LayoutProps) => {
  /* const gestorData = useGestorDashboardData();
  const cycleStatus = role === "gestor" ? gestorData.cycleStatus : null; */

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        role={role}
        userName={userName}
        onLogout={onLogout}
        /*         cycleStatus={cycleStatus} */
      />
      <main className="flex-1 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
