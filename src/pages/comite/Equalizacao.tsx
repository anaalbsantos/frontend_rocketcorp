// imports
import React, { useState, useEffect } from "react";
import ScoreInputSection from "@/components/ScoreInputSection";
import SearchInput from "@/components/SearchInput";
import clsx from "clsx";

interface ScorePerCycle {
  cycleId: string;
  selfScore?: number | null;
  leaderScore?: number | null;
  finalScore?: number | null;
  feedback?: string | null;
  id: string;
}
interface Usuario {
  id: string;
  name: string;
  role: string;
  positionId?: string;
  scorePerCycle: ScorePerCycle[];
}
interface CicloAtual {
  id: string;
}
interface APIResponse {
  usuarios: Usuario[];
  cicloAtual?: CicloAtual;
}
interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  status: "Pendente" | "Finalizado";
  autoevaluationScore: number | null;
  managerEvaluationScore: number | null;
  evaluation360Score: number | null;
  summaryText: string;
  isEditable: boolean;
  isExpanded: boolean;
  justificativa: string;
  notaFinal: number | null;
  scoreCycleId: string | null;
}

const EqualizacaoPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Pendente" | "Finalizado" | "Todos">("Todos");

  useEffect(() => {
    async function fetchColaboradores() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const response = await fetch("http://localhost:3000/users", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Erro ao carregar colaboradores. Código: ${response.status}`);

        const data: APIResponse = await response.json();
        const cicloAtualId = data.cicloAtual?.id;

        const colaboradoresFormatados: Colaborador[] = data.usuarios
          .filter((u) => u.role === "COLABORADOR")
          .map((u) => {
            const scoreAtual = u.scorePerCycle.find((s) => s.cycleId === cicloAtualId);
            return {
              id: u.id,
              nome: u.name,
              cargo: u.positionId || "Desconhecido",
              status: scoreAtual?.finalScore != null ? "Finalizado" : "Pendente",
              autoevaluationScore: scoreAtual?.selfScore ?? null,
              managerEvaluationScore: scoreAtual?.leaderScore ?? null,
              evaluation360Score: 0,
              summaryText: scoreAtual?.feedback ?? "",
              isEditable: scoreAtual?.finalScore == null,
              isExpanded: false,
              justificativa: scoreAtual?.feedback ?? "",
              notaFinal: scoreAtual?.finalScore ?? null,
              scoreCycleId: scoreAtual?.id ?? null,
            };
          });

        setColaboradores(colaboradoresFormatados);
        setErro("");
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
        if (error instanceof Error) setErro(error.message);
        else setErro("Erro desconhecido");
      }
    }
    fetchColaboradores();
  }, []);

  const toggleExpand = (id: string) =>
    setColaboradores((old) => old.map((c) => (c.id === id ? { ...c, isExpanded: !c.isExpanded } : c)));

  // Função que salva justificativa no backend
  const salvarJustificativa = async (id: string, texto: string) => {
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador || !colaborador.scoreCycleId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token não encontrado. Faça login novamente.");

      const response = await fetch(`http://localhost:3000/score-cycle/${colaborador.scoreCycleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feedback: texto }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao salvar justificativa:", response.status, errorText);
        return alert("Erro ao salvar justificativa.");
      }

      // Atualiza localmente após sucesso
      setColaboradores((old) =>
        old.map((c) => (c.id === id ? { ...c, justificativa: texto, summaryText: texto } : c))
      );
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  // Atualiza justificativa local e no backend
  const updateJustificativa = (id: string, texto: string) => {
    // Atualiza localmente
    setColaboradores((old) =>
      old.map((c) => (c.id === id ? { ...c, justificativa: texto, summaryText: texto } : c))
    );

    // Salva no backend
    salvarJustificativa(id, texto);
  };

  const handleConcluir = async (id: string, notaEstrelas: number) => {
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador || !colaborador.scoreCycleId) return alert("Dados insuficientes para salvar.");

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token não encontrado. Faça login novamente.");

      const response = await fetch(`http://localhost:3000/score-cycle/${colaborador.scoreCycleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // Envie a nota decimal (meia estrela ou estrela inteira)
        body: JSON.stringify({ finalScore: notaEstrelas }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao salvar nota final:", response.status, errorText);
        return alert("Erro ao salvar nota final.");
      }

      setColaboradores((old) =>
        old.map((c) =>
          c.id === id ? { ...c, notaFinal: notaEstrelas, status: "Finalizado", isEditable: false } : c
        )
      );
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  const handleEditResult = async (id: string) => {
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador || !colaborador.scoreCycleId) return alert("Dados insuficientes para editar.");

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token não encontrado. Faça login novamente.");

      const response = await fetch(`http://localhost:3000/score-cycle/${colaborador.scoreCycleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ finalScore: null }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao resetar nota:", response.status, errorText);
        return alert("Erro ao resetar nota.");
      }

      setColaboradores((old) =>
        old.map((c) => (c.id === id ? { ...c, status: "Pendente", isEditable: true, notaFinal: null } : c))
      );
    } catch (error) {
      console.error("Erro ao enviar PATCH de edição:", error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  const handleDownloadReport = (id: string) => alert(`Download do relatório do colaborador ${id}`);

  const colaboradoresFiltrados = colaboradores
    .filter((c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => (filtroStatus === "Todos" ? true : c.status === filtroStatus));

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mb-6 bg-white w-full py-6 px-4 md:px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-normal text-gray-900">Equalizações</h1>
      </div>

      <div className="px-4 md:px-8 flex flex-col sm:flex-row gap-4 max-w-[1700px] mx-auto w-full">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por colaboradores"
          className="w-full"
          filterOptions={["Todos", "Pendente", "Finalizado"]}
          initialFilter="Todos"
          onFilterChange={(filtro) => setFiltroStatus(filtro as "Todos" | "Pendente" | "Finalizado")}
        />
      </div>

      <div className="p-4 md:p-8 pt-4 w-full mx-auto">
        {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}
        {colaboradoresFiltrados.map((colab) => (
          <div key={colab.id} className="mb-2 border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start md:items-center p-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {colab.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="min-w-[10rem] flex flex-col justify-center">
                    <p className="font-semibold text-gray-800 text-center md:text-left">{colab.nome}</p>
                    <p className="text-sm text-gray-500 text-center md:text-left">{colab.cargo}</p>
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] sm:text-[14px] font-bold px-2 py-1.5 rounded-lg leading-none",
                      {
                        "bg-[#feec656b] text-red-500": colab.status === "Pendente",
                        "bg-green-100 text-green-800": colab.status === "Finalizado",
                      }
                    )}
                    style={{ minWidth: "4.5rem", textAlign: "center" }}
                  >
                    {colab.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center C1200:justify-start gap-2 md:gap-4 w-full md:w-auto items-center">
                {[colab.autoevaluationScore ?? 0, colab.evaluation360Score ?? 0, colab.managerEvaluationScore ?? 0].map((nota, i) => (
                  <div key={i} className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500 text-sm w-24">
                      {["Autoavaliação", "Avaliação 360", "Nota gestor"][i]}
                    </span>
                    <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
                      {nota.toFixed(1)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center mb-4">
                  <span className="text-gray-500 text-sm w-24">Nota final</span>
                  <span
                    className="font-bold text-sm px-2 py-0.5 rounded w-10 text-center text-white"
                    style={{ backgroundColor: colab.status === "Finalizado" ? "#24A19F" : "#999999" }}
                  >
                    {colab.status === "Finalizado" && colab.notaFinal !== null ? colab.notaFinal.toFixed(1) : "-"}
                  </span>
                </div>
                <div className="w-full C1200:w-auto flex justify-center C1200:justify-start C1200:mt-0">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={() => toggleExpand(colab.id)}
                    aria-label={colab.isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                  >
                    <svg
                      className={clsx("w-5 h-5 text-gray-500 transition-transform duration-200", {
                        "rotate-180": colab.isExpanded,
                      })}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {colab.isExpanded && (
              <ScoreInputSection
                autoevaluationScore={colab.autoevaluationScore ?? 0}
                managerEvaluationScore={colab.managerEvaluationScore ?? 0}
                evaluation360Score={colab.evaluation360Score ?? 0}
                summaryText={colab.summaryText}
                notaFinal={colab.notaFinal}
                isEditable={colab.isEditable}
                status={colab.status}
                isVisible={colab.isExpanded}
                onJustificationChange={(texto) => updateJustificativa(colab.id, texto)}
                onConcluir={(notaEstrelas: number) => handleConcluir(colab.id, notaEstrelas)}
                onEdit={() => handleEditResult(colab.id)}
                onDownload={() => handleDownloadReport(colab.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EqualizacaoPage;
