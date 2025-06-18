import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

interface LayoutProps {
  role: "colaborador" | "gestor" | "rh" | "comite";
  userName: string;
}

export const Layout = ({ role, userName }: LayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role={role} userName={userName} />
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};
