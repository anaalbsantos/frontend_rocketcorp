import { LogOut, User } from "lucide-react";
import {
  LayoutDashboard,
  Settings,
  Users,
  FilePen,
  SlidersHorizontal,
  ChartColumnBig,
  Rocket,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

type Role = "colaborador" | "gestor" | "rh" | "comite";

type SidebarSection = {
  label: string;
  path: string;
  icon: React.ElementType;
};

interface SidebarProps {
  role: Role;
  userName: string;
}

const SECTIONS_BY_ROLE: Record<Role, SidebarSection[]> = {
  colaborador: [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Avaliação de Ciclo", path: "/app/avaliacao", icon: FilePen },
    { label: "Evolução", path: "/app/evolucao", icon: ChartColumnBig },
  ],
  gestor: [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Colaboradores", path: "/app/colaboradores", icon: Users },
  ],
  rh: [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Colaboradores", path: "/app/colaboradores", icon: Users },
    { label: "Critérios de Avaliação", path: "/app/criterios", icon: Settings },
  ],
  comite: [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Equalização", path: "/app/equalizacao", icon: SlidersHorizontal },
  ],
};

export const Sidebar = ({ role, userName }: SidebarProps) => {
  const sections = SECTIONS_BY_ROLE[role];
  const navigate = useNavigate();

  const handleLogout = () => {
    // futuramente limpar localStorage, cookies etc
    navigate("/");
  };

  return (
    <aside
      className="w-[232px] bg-white flex flex-col justify-between min-h-screen px-6 py-8"
      style={{ boxShadow: "5px 0 15px -5px rgba(0, 0, 0, 0.12)", zIndex: 50 }}
    >
      <div>
        <div className="flex items-center gap-2 text-xl font-bold text-brand mb-8">
          <Rocket size={20} />
          RPE
        </div>

        <nav className="space-y-2">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal transition
                    ${
                      isActive
                        ? "bg-brand-selected text-brand font-semibold visited:text-brand focus:text-brand"
                        : "text-text-muted hover:text-brand"
                    }
                    no-underline hover:underline`
                }
              >
                <Icon size={24} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 text-text-muted">
          <User size={18} />
          <span className="text-sm">{userName}</span>
        </div>

        <div
          onClick={handleLogout}
          className="flex items-center gap-2 py-2 rounded-md text-sm font-bold text-brand cursor-pointer hover:underline"
        >
          <LogOut size={24} />
          Logout
        </div>
      </div>
    </aside>
  );
};
