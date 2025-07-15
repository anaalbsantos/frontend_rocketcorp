import React, { useState, useEffect } from "react";
import ScoreInputSection from "@/components/ScoreInputSection";
import SearchInput from "@/components/SearchInput";
import clsx from "clsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "@/components/Loader"; 

interface PeerScore {
  value: number;
}

interface ScorePerCycle {
  cycleId: string;
  selfScore?: number | null;
  leaderScore?: number | null;
  finalScore?: number | null;
  feedback?: string | null;
  id: string;
  peerScores?: PeerScore[];
}

interface Usuario {
  id: string;
  name: string;
  role: string;
  positionId?: string;
  position?: {
    name: string;
  };
  scorePerCycle: ScorePerCycle[];
}

interface CicloAtual {
  id: string;
  name: string;
  startDate?: string;
  reviewDate?: string;
  endDate?: string;
}

interface APIResponse {
  usuarios: Usuario[];
  cicloAtual?: CicloAtual;
  ciclo_atual_ou_ultimo?: CicloAtual;
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
  backupNotaFinal?: number | null;
  backupJustificativa?: string;
}

const EqualizacaoPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Pendente" | "Finalizado" | "Todos">("Todos");
  const [cicloAtualNome, setCicloAtualNome] = useState<string | null>(null);
  const [isInReviewPeriod, setIsInReviewPeriod] = useState(false);
  const [carregandoIA, setCarregandoIA] = useState(true); 

  useEffect(() => {
    async function fetchColaboradores() {
      try {
        setCarregandoIA(true); 
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");
        const response = await fetch("http://localhost:3000/users", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Erro ao carregar colaboradores. Código: ${response.status}`);
        const data: APIResponse = await response.json();

        const ciclo = data.cicloAtual || data.ciclo_atual_ou_ultimo || null;
        const nomeCiclo = ciclo?.name || null;
        setCicloAtualNome(nomeCiclo);

        const now = new Date();
        let inReview = false;
        if (ciclo?.reviewDate && ciclo?.endDate) {
          const reviewDate = new Date(ciclo.reviewDate);
          const endDate = new Date(ciclo.endDate);
          inReview = now >= reviewDate && now <= endDate;
        }
        setIsInReviewPeriod(inReview);

        const insightsResponse = await fetch(`http://localhost:3000/genai/equalizacao/insights/cycle/${ciclo?.id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!insightsResponse.ok) throw new Error("Erro ao carregar insights.");

        const insightsData = await insightsResponse.json();

        const colaboradoresFormatados: Colaborador[] = data.usuarios
          .filter((u) => u.role === "COLABORADOR")
          .map((u) => {
            const scoreAtual = u.scorePerCycle[0];
            const todasNotas360: number[] = u.scorePerCycle.flatMap((cycle) =>
              cycle.peerScores?.map((score) => score.value) || []
            );
            const evaluation360Score = todasNotas360.length
              ? Number(
                  (todasNotas360.reduce((acc, val) => acc + val, 0) / todasNotas360.length).toFixed(1)
                )
              : null;

            const insight = insightsData.find((insight: { evaluatedId: string }) => insight.evaluatedId === u.id);

            return {
              id: u.id,
              nome: u.name,
              cargo: u.position?.name || u.role || "Desconhecido",
              status: scoreAtual?.finalScore != null ? "Finalizado" : "Pendente",
              autoevaluationScore: scoreAtual?.selfScore ?? null,
              managerEvaluationScore: scoreAtual?.leaderScore ?? null,
              evaluation360Score,
              summaryText: insight?.summary || "", 
              isEditable: inReview,
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
        setErro(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setCarregandoIA(false); 
      }
    }

    fetchColaboradores();
  }, []);

  if (carregandoIA) {
    return <Loader />;
  }

  const toggleExpand = (id: string) =>
    setColaboradores((old) => old.map((c) => (c.id === id ? { ...c, isExpanded: !c.isExpanded } : c)));

  const handleEditResult = (id: string) => {
    if (!isInReviewPeriod) return;
    setColaboradores((old) =>
      old.map((c) =>
        c.id === id ? { ...c, backupNotaFinal: c.notaFinal, backupJustificativa: c.justificativa, status: "Pendente" } : c
      )
    );
  };

  const handleCancelEdit = (id: string) =>
    setColaboradores((old) =>
      old.map((c) =>
        c.id === id
          ? {
              ...c,
              notaFinal: c.backupNotaFinal ?? c.notaFinal,
              justificativa: c.backupJustificativa ?? c.justificativa,
              status: c.backupNotaFinal != null ? "Finalizado" : "Pendente",
            }
          : c
      )
    );

  const updateJustificativa = (id: string, texto: string) =>
    setColaboradores((old) => old.map((c) => (c.id === id ? { ...c, justificativa: texto } : c)));

  const handleConcluir = async (id: string, notaEstrelas: number) => {
    if (!isInReviewPeriod) return alert("Fora do período permitido para edição.");
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador || !colaborador.scoreCycleId) return alert("Dados insuficientes para salvar.");
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token não encontrado. Faça login novamente.");
      const response = await fetch(`http://localhost:3000/score-cycle/${colaborador.scoreCycleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ finalScore: notaEstrelas, feedback: colaborador.justificativa }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao salvar nota final:", response.status, errorText);
        return alert("Erro ao salvar nota final.");
      }
      setColaboradores((old) =>
      old.map((c) =>
        c.id === id
          ? {
              ...c,
              notaFinal: notaEstrelas,
              justificativa: colaborador.justificativa, 
              status: "Finalizado",
              backupNotaFinal: undefined,
              backupJustificativa: undefined,
            }
          : c
      )
    );
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!isInReviewPeriod) return alert("Fora do período permitido para edição.");
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador || !colaborador.scoreCycleId) return alert("Dados insuficientes para excluir.");
    if (colaborador.notaFinal === null) return alert("Não há nota final para excluir.");
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Token não encontrado. Faça login novamente.");
      const response = await fetch(`http://localhost:3000/score-cycle/${colaborador.scoreCycleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ finalScore: null, feedback: "" }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao excluir nota final:", response.status, errorText);
        return alert("Erro ao excluir nota final.");
      }
      setColaboradores((old) =>
        old.map((c) =>
          c.id === id ? { ...c, notaFinal: null, justificativa: "", status: "Pendente", backupNotaFinal: undefined, backupJustificativa: undefined } : c
        )
      );
    } catch (error) {
      console.error("Erro na requisição de exclusão:", error);
      alert("Erro ao comunicar com o servidor.");
    }
  };

  const handleDownloadReport = (id: string) => {
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador) return alert("Colaborador não encontrado.");
    const dadosExcel = [
      ["Ciclo", "Nome", "Cargo", "Status", "Autoavaliação", "Avaliação 360", "Nota Gestor", "Resumo", "Nota Final", "Justificativa"],
      [
        cicloAtualNome ?? "-",
        colaborador.nome,
        colaborador.cargo,
        colaborador.status,
        colaborador.autoevaluationScore ?? "-",
        colaborador.evaluation360Score !== null ? colaborador.evaluation360Score.toFixed(1) : "-",
        colaborador.managerEvaluationScore ?? "-",
        colaborador.summaryText ?? "",
        colaborador.notaFinal ?? "-",
        colaborador.justificativa,
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(dadosExcel);
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_ref = XLSX.utils.encode_cell({ c: C, r: 0 });
      if (!ws[cell_ref]) continue;
      ws[cell_ref].s = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };
    }
    ws["!cols"] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 50 },
      { wch: 10 },
      { wch: 50 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${colaborador.nome}_relatorio.xlsx`);
  };

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
      <div className="p-4 md:p-8 pt-4 w-full mx-auto max-w-[1700px]">
        {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}
        {colaboradoresFiltrados.map((colab) => (
          <div key={colab.id} className="mb-2 border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start md:items-center p-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {colab.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 min-w-[10rem]">
                  <div className="flex flex-col justify-center min-w-[10rem]">
                    <p className="font-semibold text-gray-800 text-center md:text-left">{colab.nome}</p>
                    <p className="text-sm text-gray-500 text-center md:text-left">{colab.cargo}</p>
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] sm:text-[14px] font-bold px-2 py-1.5 rounded-lg leading-none min-w-[4.5rem] text-center",
                      {
                        "bg-[#feec656b] text-red-500": colab.status === "Pendente",
                        "bg-green-100 text-green-800": colab.status === "Finalizado",
                      }
                    )}
                  >
                    {colab.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center C1200:justify-start gap-2 md:gap-4 w-full md:w-auto items-center">
                {[colab.autoevaluationScore, colab.evaluation360Score, colab.managerEvaluationScore].map((nota, i) => (
                  <div key={i} className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500 text-sm w-24">{["Autoavaliação", "Avaliação 360", "Nota gestor"][i]}</span>
                    <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-0.5 rounded w-10 text-center">
                      {nota !== null && nota !== undefined ? nota.toFixed(1) : "-"}
                    </span>
                  </div>
                ))}
                <div className="flex items-center mb-4">
                  <span className="text-gray-500 text-sm w-24">Nota final</span>
                  <span
                    className="font-bold text-sm px-2 py-0.5 rounded w-10 text-center text-white"
                    style={{ backgroundColor: colab.status === "Finalizado" ? "#08605f" : "#D1D5DB" }}
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
                      className={clsx("w-5 h-5 text-gray-500 transition-transform duration-200", { "rotate-180": colab.isExpanded })}
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
                justification={colab.justificativa}
                notaFinal={colab.notaFinal}
                isEditable={isInReviewPeriod}
                status={colab.status}
                isVisible={colab.isExpanded}
                onJustificationChange={(texto) => updateJustificativa(colab.id, texto)}
                onConcluir={(notaEstrelas: number) => handleConcluir(colab.id, notaEstrelas)}
                onEdit={() => handleEditResult(colab.id)}
                onCancelEdit={() => handleCancelEdit(colab.id)}
                onDownload={() => handleDownloadReport(colab.id)}
                onDelete={() => handleDelete(colab.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EqualizacaoPage;
