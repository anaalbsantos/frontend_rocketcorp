import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export const Layout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role="colaborador" userName="Colaborador 1" />
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};
