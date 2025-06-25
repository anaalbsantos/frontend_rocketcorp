import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

type Role = "colaborador" | "gestor" | "rh" | "comite";

interface LayoutProps {
  role: Role;
  userName: string;
  onLogout: () => void;
}

export const Layout = ({ role, userName, onLogout }: LayoutProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar role={role} userName={userName} onLogout={onLogout} />
      <main className="flex-1 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
