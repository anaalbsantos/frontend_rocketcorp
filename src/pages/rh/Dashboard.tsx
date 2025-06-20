import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import DashboardStatCard from "@/components/DashboardStatCard";
import { Lightbulb, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Colaborador = { id: number; name: string; role: "Product Owner" | "Desenvolvedor" | "Designer" | "Analista de QA"; status: "Finalizado" | "Pendente" };

const agrupamentoPorRole = (data: Colaborador[]) => {
  const result: Record<string, number> = {};
  data.forEach((colab) => { if (colab.status === "Finalizado") result[colab.role] = (result[colab.role] ?? 0) + 1; });
  return result;
};

const gerarDadosGrafico = (data: Colaborador[]) => {
  const grupos = agrupamentoPorRole(data);
  const roles: Colaborador["role"][] = ["Product Owner", "Desenvolvedor", "Designer", "Analista de QA"];
  return roles.map((role) => ({ name: role, value: grupos[role] ?? 0 }));
};

const chartConfig = {
  value: { label: "Colaboradores Finalizados", color: "#08605f" },
  "Product Owner": { label: "Product Owner", color: "#1f77b4" },
  Desenvolvedor: { label: "Desenvolvedor", color: "#ff7f0e" },
  Designer: { label: "Designer", color: "#2ca02c" },
  "Analista de QA": { label: "Analista de QA", color: "#d62728" },
} satisfies ChartConfig;

const Dashboard = () => {
  const [collaboratorsData, setCollaboratorsData] = useState<Colaborador[]>([]);
  const [filtroRole, setFiltroRole] = useState<string>("Todos os setores");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setCollaboratorsData([
        { id: 1, name: "Alice Silva", role: "Product Owner", status: "Finalizado" },
        { id: 2, name: "Bruno Costa", role: "Desenvolvedor", status: "Pendente" },
        { id: 3, name: "Carlos Souza", role: "Desenvolvedor", status: "Finalizado" },
        { id: 4, name: "Daniela Rocha", role: "Analista de QA", status: "Finalizado" },
        { id: 5, name: "Eduardo Lima", role: "Desenvolvedor", status: "Finalizado" },
        { id: 6, name: "Fernanda Alves", role: "Product Owner", status: "Pendente" },
        { id: 7, name: "Gabriel Martins", role: "Designer", status: "Finalizado" },
        { id: 8, name: "Helena Dias", role: "Analista de QA", status: "Finalizado" },
        { id: 9, name: "Igor Nunes", role: "Desenvolvedor", status: "Pendente" },
        { id: 10, name: "Juliana Prado", role: "Product Owner", status: "Finalizado" },
        { id: 11, name: "Karla Medeiros", role: "Designer", status: "Pendente" },
        { id: 12, name: "Leonardo Barbosa", role: "Analista de QA", status: "Finalizado" },
        { id: 13, name: "Mariana Castro", role: "Desenvolvedor", status: "Finalizado" },
        { id: 14, name: "Nicolas Torres", role: "Product Owner", status: "Pendente" },
        { id: 15, name: "Olivia Fernandes", role: "Designer", status: "Finalizado" },
        { id: 16, name: "Paulo Ribeiro", role: "Analista de QA", status: "Pendente" },
        { id: 17, name: "Quintino Santos", role: "Desenvolvedor", status: "Finalizado" },
        { id: 18, name: "Rafaela Lima", role: "Product Owner", status: "Finalizado" },
        { id: 19, name: "Sandro Oliveira", role: "Designer", status: "Pendente" },
        { id: 20, name: "Tatiana Souza", role: "Analista de QA", status: "Finalizado" },
      ]);
    };
    fetchData();
  }, []);

  const dataFechamento = new Date(2025, 7, 30); dataFechamento.setHours(0, 0, 0, 0);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const diffMs = dataFechamento.getTime() - hoje.getTime();
  const diasRestantes = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

  const dadosFiltrados = filtroRole === "Todos os setores" ? collaboratorsData : collaboratorsData.filter((c) => c.role === filtroRole);
  const preenchimentoData = gerarDadosGrafico(dadosFiltrados);
  const totalColaboradores = collaboratorsData.length;
  const totalFinalizados = collaboratorsData.filter((c) => c.status === "Finalizado").length;
  const percentualPreenchimento = totalColaboradores ? Math.round((totalFinalizados / totalColaboradores) * 100) : 0;
  const totalPendentes = totalColaboradores - totalFinalizados;

  const maxValue = Math.max(...preenchimentoData.map((d) => d.value), 30);
  const maxTick = Math.ceil(maxValue / 5) * 5;
  const ticks = [];
  for (let i = 0; i <= maxTick; i += 5) ticks.push(i);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Olá, <span className="font-light">RH</span></h1>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">CN</div>
      </div>

      <div className="grid grid-cols-1 xl1300:grid-cols-3 gap-6 mb-6">
        <DashboardStatCard type="preenchimento" title="Preenchimento de avaliação" description={`${percentualPreenchimento}% dos colaboradores já fecharam suas avaliações`} progress={percentualPreenchimento} bgColor="bg-white" />
        <DashboardStatCard type="pendingReviews" title="Avaliações pendentes" description={`${totalPendentes} colaboradores ainda não fecharam sua avaliação`} value={totalPendentes} icon={<Lightbulb size={40} color="red" />} bgColor="bg-white" />
        <DashboardStatCard type="prazo" title="Fechamento de ciclo" description={`Faltam ${diasRestantes} dias para o fechamento do ciclo, no dia ${dataFechamento.toLocaleDateString("pt-BR")}`} prazoDias={diasRestantes} icon={<CalendarDays size={60} color="rgb(22 163 74)" />} bgColor="bg-white" />
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col min-w-[431px] basis-[623px] flex-1" style={{ height: 483 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Colaboradores</h2>
            <button type="button" className="text-[#08605f] text-sm bg-transparent p-0" onClick={() => navigate("/app/colaboradores")}>Ver mais</button>
          </div>
          <div className="space-y-4 overflow-y-auto flex-grow min-h-0" style={{ paddingRight: 12, backgroundColor: "white", scrollbarWidth: "thin", scrollbarColor: "#a0aec0 white", height: "calc(100% - 50px)" }}>
            {collaboratorsData.map((colab) => (
              <div key={colab.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {colab.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div><p className="font-medium text-gray-800">{colab.name}</p><p className="text-sm text-gray-500">{colab.role}</p></div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colab.status === "Finalizado" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>{colab.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg flex flex-col min-w-[481px] basis-[900px] flex-1 shadow-md" style={{ height: 483, width: "100%" }}>
          <div className="flex flex-row justify-between items-center mb-3">
            <p className="font-bold">Preenchimento</p>
            <select className="border border-gray-300 rounded-md p-1 text-sm bg-white text-black" value={filtroRole} onChange={(e) => setFiltroRole(e.target.value)}>
              <option>Todos os setores</option><option>Product Owner</option><option>Desenvolvedor</option><option>Designer</option><option>Analista de QA</option>
            </select>
          </div>
          <div className="flex-grow min-h-0" style={{ height: "100%", width: "100%" }}>
            <ChartContainer config={chartConfig} style={{ height: "100%", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={preenchimentoData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }} barCategoryGap={30} barGap={5}>
                  <CartesianGrid stroke="#CCCCCC" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} interval={0} tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value} style={{ fontSize: 12 }} />
                  <YAxis domain={[0, maxTick]} ticks={ticks} tick={{ fontSize: 12 }} width={40} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {preenchimentoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || "#08605f"} cursor="pointer" />
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
