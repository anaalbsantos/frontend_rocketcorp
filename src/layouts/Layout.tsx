import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/api";
import {
  LogOut,
  User,
  Menu,
  X,
  Rocket,
  LayoutDashboard,
  Settings,
  Users,
  FilePen,
  SlidersHorizontal,
  ChartColumnBig,
  FileText,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";

type Role = "colaborador" | "gestor" | "rh" | "comite";

type SidebarSection = {
  label: string;
  path: string;
  icon: React.ElementType;
};

interface LayoutProps {
  role: Role;
  userName: string;
  onLogout: () => void;
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

// Hook simples pra saber se está em tela >= md
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}

export const Layout = ({ role, userName, onLogout }: LayoutProps) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Define seções com base na role e status
  const baseSections = SECTIONS_BY_ROLE[role];
  const sections =
    role === "gestor"
      ? baseSections.filter(
          (item) =>
            item.label !== "Brutal Facts" || cycleStatus === "finalizado"
        )
      : baseSections;

  const handleLogout = () => {
    onLogout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Top bar só no mobile */}
      {!isDesktop && (
        <>
          <div className="flex justify-between items-center bg-white px-4 py-3 shadow z-50 md:hidden">
            <div className="flex items-center gap-2 text-xl font-bold text-brand">
              <Rocket size={20} />
              RPE
            </div>
            <button onClick={() => setIsMenuOpen((prev) => !prev)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Overlay escuro para fechar menu ao clicar fora */}
          {isMenuOpen && (
            <div
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
          )}

          {/* Menu sanduíche (posição absoluta com tamanho natural e largura limitada) */}
          {isMenuOpen && (
  <div className="absolute top-14 right-4 bg-white px-6 py-4 shadow z-50 rounded-md max-w-xs flex flex-col justify-between">
              <div className="space-y-2">
                {sections.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal transition
                      ${
                        isActive
                          ? "bg-brand-selected text-brand font-semibold"
                          : "text-text-muted hover:text-brand"
                      }
                      no-underline hover:underline`
                    }
                  >
                    <Icon size={24} />
                    {label}
                  </NavLink>
                ))}
              </div>

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
        </>
      )}

      {/* Corpo com sidebar + conteúdo */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar só no desktop */}
        {isDesktop && (
          <Sidebar
            role={role}
            userName={userName}
            onLogout={onLogout}
            cycleStatus={cycleStatus}
          />
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
