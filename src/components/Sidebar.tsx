import { useState, useEffect } from "react";
import {
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  Users,
  FilePen,
  SlidersHorizontal,
  ChartColumnBig,
  Rocket,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

// Hook pra detectar tela md+
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}

type Role = "colaborador" | "gestor" | "rh" | "comite";

type SidebarSection = {
  label: string;
  path: string;
  icon: React.ElementType;
};

interface SidebarProps {
  role: Role;
  userName: string;
  onLogout: () => void;
  cycleStatus?: "aberto" | "emRevisao" | "finalizado" | null;
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
    { label: "Brutal Facts", path: "/app/brutalfacts", icon: FileText },
  ],
  rh: [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Colaboradores", path: "/app/colaboradores", icon: Users },
    { label: "Critérios de Avaliação", path: "/app/criterios", icon: Settings },
    { label: "Histórico", path: "/app/historico", icon: FilePen },
  ],
  comite: [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Equalização", path: "/app/equalizacao", icon: SlidersHorizontal },
  ],
};

export const Sidebar = ({
  role,
  userName,
  onLogout,
  cycleStatus,
}: SidebarProps) => {
  const isDesktop = useIsDesktop();
  const [isOpen, setIsOpen] = useState(false);
  const allSections = SECTIONS_BY_ROLE[role];

  const sections =
    role === "gestor"
      ? allSections.filter(
          (item) =>
            item.label !== "Brutal Facts" || cycleStatus === "finalizado"
        )
      : allSections;

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/", { replace: true });
  };

  const renderLinks = () => (
    <>
      {sections.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md text-sm font-normal transition
                ${
                  isActive
                    ? "bg-brand-selected text-brand font-semibold visited:text-brand focus:text-brand"
                    : "text-text-muted hover:text-brand"
                }
                no-underline hover:underline`
            }
          >
            <Icon className="w-4 h-6 shrink-0" />

            {item.label}
          </NavLink>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile: cabeçalho com hambúrguer */}
      {!isDesktop && (
        <div className="flex justify-between items-center bg-white px-4 py-3 shadow z-50 md:hidden">
          <div className="flex items-center gap-2 text-xl font-bold text-brand">
            <Rocket size={20} />
            RPE
          </div>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      )}

      {/* Mobile: overlay escuro para fechar menu ao clicar fora */}
      {!isDesktop && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Mobile: menu sanduíche flutuante */}
      {!isDesktop && isOpen && (
  <div className="absolute top-14 right-4 bg-white px-6 py-4 shadow z-50 rounded-md max-w-xs flex flex-col justify-between">
          <div className="space-y-2">{renderLinks()}</div>

          <div className="mt-6 space-y-2 border-t pt-4 flex-shrink-0">
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
        </div>
      )}

      {/* Desktop: sidebar lateral fixa */}
      {isDesktop && (
        <aside
          className="w-[232px] bg-white flex flex-col justify-between min-h-screen px-4 py-8"
          style={{ boxShadow: "5px 0 15px -5px rgba(0, 0, 0, 0.12)", zIndex: 50 }}
        >
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-brand mb-8 ml-2">
              <Rocket size={28} />
              RPE
            </div>
            <nav className="space-y-2">{renderLinks()}</nav>
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
      )}
    </>
  );
};
