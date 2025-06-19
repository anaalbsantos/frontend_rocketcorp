import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashboardStatCard from "@/components/DashboardStatCard";
import { Lightbulb, CalendarDays } from "lucide-react";

type Colaborador = {
  id: number;
  name: string;
  role: string;
  status: "Finalizado" | "Pendente";
};

// Dados fixos dos colaboradores
const collaboratorsData: Colaborador[] = [
  { id: 1, name: "Alice Silva", role: "Product Owner", status: "Finalizado" },
  { id: 2, name: "Bruno Costa", role: "Desenvolvedor", status: "Pendente" },
  { id: 3, name: "Carlos Souza", role: "Designer", status: "Finalizado" },
  { id: 4, name: "Daniela Rocha", role: "Analista de QA", status: "Pendente" },
  { id: 5, name: "Eduardo Lima", role: "Desenvolvedor", status: "Finalizado" },
  { id: 6, name: "Fernanda Alves", role: "Product Owner", status: "Pendente" },
  { id: 7, name: "Gabriel Martins", role: "Designer", status: "Finalizado" },
  { id: 8, name: "Helena Dias", role: "Analista de QA", status: "Finalizado" },
];

// Funções utilitárias
const agrupamentoPorRole = (data: Colaborador[]) => {
  const result: Record<string, number> = {};
  data.forEach((colab) => {
    if (colab.status === "Finalizado") {
      result[colab.role] = (result[colab.role] ?? 0) + 1;
    }
  });
  return result;
};

const gerarDadosGrafico = (data: Colaborador[]) => {
  const grupos = agrupamentoPorRole(data);
  const roles = ["Product Owner", "Desenvolvedor", "Designer", "Analista de QA"];
  return roles.map((role) => ({
    name: role,
    value: grupos[role] ?? 0,
  }));
};

const chartConfig = {
  value: {
    label: "Colaboradores Finalizados",
    color: "#08605f",
  },
  "Product Owner": {
    label: "Product Owner",
    color: "#1f77b4",
  },
  Desenvolvedor: {
    label: "Desenvolvedor",
    color: "#ff7f0e",
  },
  Designer: {
    label: "Designer",
    color: "#2ca02c",
  },
  "Analista de QA": {
    label: "Analista de QA",
    color: "#d62728",
  },
} satisfies ChartConfig;

const Dashboard = () => {
  // Estado para data do fechamento do ciclo (string ISO: YYYY-MM-DD)
  const [dataFechamento, setDataFechamento] = useState(() => {
    // Default: 30/08/2025
    return "2025-08-30";
  });

  // Estado para cálculo de dias restantes
  const [diasRestantes, setDiasRestantes] = useState(0);

  // Recalcula dias restantes sempre que dataFechamento mudar
  useEffect(() => {
    const hoje = new Date();
    const fechamento = new Date(dataFechamento);
    const diffMs = fechamento.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    setDiasRestantes(diffDias > 0 ? diffDias : 0);
  }, [dataFechamento]);

  // Calcula dados de preenchimento e pendentes
  const totalColaboradores = collaboratorsData.length;
  const totalFinalizados = collaboratorsData.filter(
    (c) => c.status === "Finalizado"
  ).length;
  const percentualPreenchimento = Math.round(
    (totalFinalizados / totalColaboradores) * 100
  );
  const totalPendentes = totalColaboradores - totalFinalizados;

  const preenchimentoData = gerarDadosGrafico(collaboratorsData);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Olá, RH</h1>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          CN
        </div>
      </div>

      {/* Cards dinâmicos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <DashboardStatCard
          type="preenchimento"
          title="Preenchimento de avaliação"
          description={`${percentualPreenchimento}% dos colaboradores já fecharam suas avaliações`}
          progress={percentualPreenchimento}
        />

        <DashboardStatCard
          type="pendingReviews"
          title="Avaliações pendentes"
          description={`${totalPendentes} colaboradores ainda não fecharam sua avaliação`}
          value={totalPendentes}
          icon={<Lightbulb size={30} color="white" />}
        />

        <DashboardStatCard
          type="prazo"
          title="Fechamento de ciclo"
          description={`Faltam ${diasRestantes} dias para o fechamento do ciclo, no dia ${new Date(dataFechamento).toLocaleDateString()}`}
          prazoDias={diasRestantes}
          icon={<CalendarDays size={40} color="rgb(22 163 74)" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de colaboradores */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Colaboradores</h2>
            <button className="text-blue-600 hover:underline text-sm">Ver mais</button>
          </div>
          <div className="space-y-4 max-h-[420px] overflow-y-auto">
            {collaboratorsData.map((colab) => (
              <div
                key={colab.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
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
                    colab.status === "Finalizado"
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {colab.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de preenchimento */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Preenchimento</h2>
            <select className="border border-gray-300 rounded-md p-1 text-sm">
              <option>Todos os setores</option>
              <option>Product Owner</option>
              <option>Desenvolvedor</option>
              <option>Designer</option>
              <option>Analista de QA</option>
            </select>
          </div>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={preenchimentoData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    chartConfig[value as keyof typeof chartConfig]?.label || value
                  }
                />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar
                  dataKey="value"
                  radius={4}
                  fill={({ payload }) =>
                    chartConfig[payload.name as keyof typeof chartConfig]?.color || "#000"
                  }
                />
              </BarChart>
            </ChartContainer>
          </div>
          {/* Input para alterar data */}
          <div className="mt-4">
            <label className="block mb-1 font-semibold text-gray-700" htmlFor="dataFechamento">
              Alterar data do fechamento do ciclo:
            </label>
            <input
              type="date"
              id="dataFechamento"
              value={dataFechamento}
              onChange={(e) => setDataFechamento(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
              min={new Date().toISOString().split("T")[0]} // não permite datas passadas
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
