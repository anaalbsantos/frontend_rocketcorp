import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import DashboardStatCard from "@/components/DashboardStatCard";
import { Lightbulb, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScorePerCycle {
  cycleId: string;
  selfScore: number | null;
  leaderScore: number | null;
  finalScore: number | null;
}

interface UsuarioAPI {
  id: string;
  name: string;
  role: "COLABORADOR" | "LIDER" | string;
  positionId: string | null;
  position?: {
    name: string;
  };
  scorePerCycle: ScorePerCycle[];
}

type ColaboradorRole =
  | "Software Engineer"
  | "QA Engineer"
  | "Product Designer"
  | "UX Researcher"
  | string;

interface Colaborador {
  id: number;
  name: string;
  role: ColaboradorRole;
  status: "Finalizado" | "Pendente";
}

const cargosFiltrados = [
  "Software Engineer",
  "QA Engineer",
  "Product Designer",
  "UX Researcher",
];

const filtroCargos = ["Todos os cargos", ...cargosFiltrados];

const abreviacoesCargos: Record<string, string> = {
  "Todos os cargos": "Todos",
  "Software Engineer": "Soft Eng",
  "QA Engineer": "QA",
  "Product Designer": "Prod Des",
  "UX Researcher": "UX Res",
};

const agrupamentoPorCargo = (data: Colaborador[]) => {
  const result: Record<string, number> = {};
  data.forEach((colab) => {
    if (colab.status === "Finalizado" && cargosFiltrados.includes(colab.role)) {
      result[colab.role] = (result[colab.role] ?? 0) + 1;
    }
  });
  return result;
};

const gerarDadosGrafico = (data: Colaborador[]) => {
  const grupos = agrupamentoPorCargo(data);
  return cargosFiltrados.map((cargo) => ({ name: cargo, value: grupos[cargo] ?? 0 }));
};

const chartConfig = {
  value: { label: "Colaboradores Finalizados", color: "#08605f" },
  "Software Engineer": { label: "Software Engineer", color: "#ff7f0e" },
  "QA Engineer": { label: "QA Engineer", color: "#1f77b4" },
  "Product Designer": { label: "Product Designer", color: "#d62728" },
  "UX Researcher": { label: "UX Researcher", color: "#9467bd" },
} satisfies ChartConfig;

interface TickProps {
  x: number;
  y: number;
  payload: {
    value: string;
  };
}

const TickDiagonal = ({ x, y, payload }: TickProps) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={16}
      textAnchor="end"
      fill="#666"
      transform="rotate(-45)"
      style={{ fontSize: 12 }}
    >
      {payload.value}
    </text>
  </g>
);

const Dashboard = () => {
  const [collaboratorsData, setCollaboratorsData] = useState<Colaborador[]>([]);
  const [filtroCargo, setFiltroCargo] = useState<string>("Todos os cargos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cicloFechamento, setCicloFechamento] = useState<Date | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth <= 550);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchCollaborators() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");
        const response = await fetch("http://localhost:3000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao buscar colaboradores.");
        const data = (await response.json()) as {
          ciclo_atual_ou_ultimo?: {
            id: string;
            name: string;
            startDate: string;
            endDate: string;
          };
          usuarios: UsuarioAPI[];
        };
        if (data.ciclo_atual_ou_ultimo?.endDate) {
          setCicloFechamento(new Date(data.ciclo_atual_ou_ultimo.endDate));
        }
        const colaboradoresFiltrados: Colaborador[] = data.usuarios
          .filter((u) => u.role === "COLABORADOR")
          .map((u) => {
            const scoreAtual = u.scorePerCycle.length > 0 ? u.scorePerCycle[0] : null;
            const status =
              scoreAtual && scoreAtual.finalScore != null ? "Finalizado" : "Pendente";
            const posicao = u.position?.name ?? "Padrão";
            if (posicao.toLowerCase().includes("gestor")) {
              return null;
            }
            const role = cargosFiltrados.includes(posicao) ? posicao : posicao;
            return {
              id: Number(u.id.replace(/\D/g, "")) || Math.random(),
              name: u.name,
              role,
              status,
            };
          })
          .filter(Boolean) as Colaborador[];
        setCollaboratorsData(colaboradoresFiltrados);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchCollaborators();
  }, []);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataFechamento = cicloFechamento ?? new Date(2025, 7, 30);
  dataFechamento.setHours(0, 0, 0, 0);

  const diffMs = dataFechamento.getTime() - hoje.getTime();
  const diasRestantes = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

  const cicloFinalizado = hoje > dataFechamento;

  const descricaoPrazo = cicloFinalizado
    ? `O ciclo foi fechado em ${dataFechamento.toLocaleDateString("pt-BR")}`
    : `Faltam ${diasRestantes} dias para o fechamento do ciclo, no dia ${dataFechamento.toLocaleDateString(
        "pt-BR"
      )}`;

  const dadosFiltrados =
    filtroCargo === "Todos os cargos"
      ? collaboratorsData
      : collaboratorsData.filter((c) => c.role === filtroCargo);

  const preenchimentoData = gerarDadosGrafico(dadosFiltrados);

  const totalColaboradores = collaboratorsData.length;
  const totalFinalizados = collaboratorsData.filter((c) => c.status === "Finalizado").length;
  const percentualPreenchimento = totalColaboradores
    ? Math.round((totalFinalizados / totalColaboradores) * 100)
    : 0;
  const totalPendentes = totalColaboradores - totalFinalizados;

  const maxValue = Math.max(...preenchimentoData.map((d) => d.value), 30);
  const maxTick = Math.ceil(maxValue / 5) * 5;
  const ticks = [];
  for (let i = 0; i <= maxTick; i += 5) ticks.push(i);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Olá, <span className="font-light">RH</span>
        </h1>
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
          CN
        </div>
      </div>

      <div className="grid grid-cols-1 xl1300:grid-cols-3 gap-6 mb-6">
        <DashboardStatCard
          type="preenchimento"
          title="Preenchimento de avaliação"
          description={`${percentualPreenchimento}% dos colaboradores já fecharam suas avaliações`}
          progress={percentualPreenchimento}
          bgColor="bg-white"
        />
        <DashboardStatCard
          type="pendingReviews"
          title="Avaliações pendentes"
          description={`${totalPendentes} colaboradores ainda não fecharam sua avaliação`}
          value={totalPendentes}
          icon={<Lightbulb size={40} color="red" />}
          bgColor="bg-white"
        />
        <DashboardStatCard
          type="prazo"
          title="Fechamento de ciclo"
          description={descricaoPrazo}
          prazoDias={diasRestantes}
          icon={<CalendarDays size={60} color="rgb(22 163 74)" />}
          bgColor="bg-white"
        />
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        <div
          className="bg-white p-6 rounded-lg shadow-md flex flex-col flex-1 max-w-full min-w-0 md:min-w-[431px] md:basis-[623px]"
          style={{ height: 483 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Colaboradores</h2>
            <button
              type="button"
              className="text-[#08605f] text-sm bg-transparent p-0"
              onClick={() => navigate("/app/colaboradores")}
            >
              Ver mais
            </button>
          </div>
          <div
            className="space-y-4 overflow-y-auto flex-grow min-h-0"
            style={{
              paddingRight: 12,
              backgroundColor: "white",
              scrollbarWidth: "thin",
              scrollbarColor: "#a0aec0 white",
              height: "calc(100% - 50px)",
            }}
          >
            {loading && (
              <p className="text-center text-gray-600">Carregando colaboradores...</p>
            )}
            {error && <p className="text-center text-red-600">{error}</p>}
            {!loading && !error && collaboratorsData.length === 0 && (
              <p className="text-center text-gray-600 mt-10">Nenhum colaborador encontrado.</p>
            )}
            {!loading &&
              !error &&
              collaboratorsData.map((colab) => {
                const isFinalizado = colab.status === "Finalizado";
                const corStatusBg = isFinalizado ? "bg-green-500" : "bg-yellow-400";
                const simboloStatus = isFinalizado ? "✅" : "❗";
                return (
                  <div
                    key={colab.id}
                    className={`
                      relative flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50
                      phone:pr-8
                      phone:after:content-[''] phone:after:absolute phone:after:top-0 phone:after:right-0 phone:after:h-full phone:after:w-2
                      phone:after:rounded-tr-lg phone:after:rounded-br-lg
                      phone:after:${corStatusBg}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                        {colab.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{colab.name}</p>
                        <p className="text-sm text-gray-500">{colab.role}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isFinalizado
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      } phone:hidden`}
                    >
                      {colab.status}
                    </span>
                    <span
                      className={`hidden phone:flex items-center justify-center text-white font-bold rounded-full absolute right-2`}
                      style={{
                        backgroundColor: isFinalizado ? "#22c55e" : "#facc15",
                        width: 30,
                        height: 30,
                        fontSize: isFinalizado ? 20 : 18,
                        lineHeight: "20px",
                      }}
                    >
                      {simboloStatus}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <div
          className="bg-white p-5 rounded-lg flex flex-col flex-1 shadow-md"
          style={{ height: isSmallScreen ? 530 : 483, width: "100%" }}
        >
          <div className="flex flex-row justify-between items-center mb-3">
            <p className="font-bold">Preenchimento</p>
            <select
              className="border border-gray-300 rounded-md p-1 text-sm bg-white text-black"
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value)}
            >
              {filtroCargos.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {isSmallScreen ? abreviacoesCargos[cargo] ?? cargo : cargo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow min-h-0" style={{ height: "100%", width: "100%" }}>
            <ChartContainer config={chartConfig} style={{ height: "100%", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={preenchimentoData}
                  margin={{ top: 10, right: 10, left: 10, bottom: isSmallScreen ? 60 : 30 }}
                  barCategoryGap={30}
                  barGap={5}
                >
                  <CartesianGrid stroke="#CCCCCC" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={0}
                    tickFormatter={(value) =>
                      chartConfig[value as keyof typeof chartConfig]?.label || value
                    }
                    style={{ fontSize: 12 }}
                    tick={isSmallScreen ? TickDiagonal : undefined}
                  />
                  <YAxis
                    domain={[0, Math.ceil(Math.max(...preenchimentoData.map((d) => d.value), 30) / 5) * 5]}
                    ticks={Array.from(
                      { length: Math.ceil(Math.max(...preenchimentoData.map((d) => d.value), 30) / 5) + 1 },
                      (_, i) => i * 5
                    )}
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {preenchimentoData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || "#08605f"}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
