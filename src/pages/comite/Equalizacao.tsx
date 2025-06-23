import React, { useState } from "react";
import ScoreInputSection from "@/components/ScoreInputSection";
import SearchInput from "@/components/SearchInput";
import { Filter } from "lucide-react";
import clsx from "clsx";

interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  status: "Pendente" | "Finalizado";
  autoevaluationScore: number;
  managerEvaluationScore: number;
  evaluation360Score: number;
  summaryText: string;
  isEditable: boolean;
  isExpanded: boolean;
  justificativa: string;
}

const EqualizacaoPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    { id: 1, nome: "Ana Clara Silva", cargo: "Product Design", status: "Pendente", autoevaluationScore: 3.5, managerEvaluationScore: 3.8, evaluation360Score: 4.0, summaryText: "Bom desempenho, mas pode melhorar a comunicação.", isEditable: true, isExpanded: false, justificativa: "" },
    { id: 2, nome: "Bruno Oliveira", cargo: "Desenvolvedor Frontend", status: "Finalizado", autoevaluationScore: 4.5, managerEvaluationScore: 4.8, evaluation360Score: 4.6, summaryText: "Entrega consistente e com qualidade.", isEditable: false, isExpanded: false, justificativa: "" },
    { id: 3, nome: "Carla Fernandes", cargo: "Analista de Dados", status: "Pendente", autoevaluationScore: 4.0, managerEvaluationScore: 3.9, evaluation360Score: 4.1, summaryText: "Boa análise, mas precisa agilizar prazos.", isEditable: true, isExpanded: false, justificativa: "" },
    { id: 4, nome: "Daniel Souza", cargo: "Gerente de Projetos", status: "Finalizado", autoevaluationScore: 4.8, managerEvaluationScore: 4.9, evaluation360Score: 5.0, summaryText: "Liderança exemplar e foco nos resultados.", isEditable: false, isExpanded: false, justificativa: "" },
    { id: 5, nome: "Elisa Martins", cargo: "UX Designer", status: "Pendente", autoevaluationScore: 3.7, managerEvaluationScore: 3.6, evaluation360Score: 3.8, summaryText: "Criatividade e empatia no design, mas precisa melhorar documentação.", isEditable: true, isExpanded: false, justificativa: "" },
    { id: 6, nome: "Fábio Lima", cargo: "Engenheiro de Software", status: "Finalizado", autoevaluationScore: 4.3, managerEvaluationScore: 4.5, evaluation360Score: 4.4, summaryText: "Código limpo e boa performance nas entregas.", isEditable: false, isExpanded: false, justificativa: "" },
    { id: 7, nome: "Gabriela Santos", cargo: "Marketing Digital", status: "Pendente", autoevaluationScore: 3.9, managerEvaluationScore: 3.7, evaluation360Score: 3.6, summaryText: "Resultados consistentes, foco em métricas.", isEditable: true, isExpanded: false, justificativa: "" },
    { id: 8, nome: "Henrique Rocha", cargo: "QA Tester", status: "Finalizado", autoevaluationScore: 4.1, managerEvaluationScore: 4.2, evaluation360Score: 4.3, summaryText: "Atenção aos detalhes e ótimo trabalho em testes.", isEditable: false, isExpanded: false, justificativa: "" },
    { id: 9, nome: "Isabela Costa", cargo: "Analista Financeiro", status: "Pendente", autoevaluationScore: 3.8, managerEvaluationScore: 3.9, evaluation360Score: 3.7, summaryText: "Precisa agilizar a análise e entrega dos relatórios.", isEditable: true, isExpanded: false, justificativa: "" },
    { id: 10, nome: "João Pedro Almeida", cargo: "Suporte Técnico", status: "Finalizado", autoevaluationScore: 4.6, managerEvaluationScore: 4.7, evaluation360Score: 4.8, summaryText: "Atendimento rápido e eficiente.", isEditable: false, isExpanded: false, justificativa: "" },
  ]);

  const toggleExpand = (id: number) =>
    setColaboradores(old => old.map(c => c.id === id ? { ...c, isExpanded: !c.isExpanded } : c));
  const updateJustificativa = (id: number, texto: string) =>
    setColaboradores(old => old.map(c => c.id === id ? { ...c, justificativa: texto } : c));
  const handleEditResult = (id: number) => alert(`Editar resultado clicado! Colaborador ${id}`);
  const handleDownloadReport = (id: number) => alert(`Download do relatório clicado! Colaborador ${id}`);
  const handleConcluir = (id: number) => alert(`Botão Concluir clicado! Colaborador ${id}`);

  const getInitials = (nome: string) => {
    const parts = nome.trim().split(" ");
    return parts.length === 1 ? parts[0][0].toUpperCase() : parts[0][0].toUpperCase() + (parts[1]?.[0]?.toUpperCase() || "");
  };

  const colaboradoresFiltrados = colaboradores.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mb-6 bg-white w-full py-6 px-4 md:px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-normal text-gray-900">Equalizações</h1>
      </div>
      <div className="px-4 md:px-8 flex flex-col sm:flex-row gap-4 max-w-[1700px] mx-auto w-full">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por colaboradores" className="w-full" />
        <button className="h-10 px-4 py-2 rounded-md bg-[#08605f] text-white hover:bg-[#064a49] focus:outline-none focus:ring-2 focus:ring-[#08605f] focus:ring-opacity-50 self-start sm:self-auto" aria-label="Filtros">
          <Filter size={20} />
        </button>
      </div>
      <div className="p-4 md:p-8 pt-4 w-full mx-auto">
        {colaboradoresFiltrados.map(colab => (
          <div key={colab.id} className="mb-2 border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start md:items-center p-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">{getInitials(colab.nome)}</div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="min-w-[10rem] flex flex-col justify-center">
                    <p className="font-semibold text-gray-800 text-center md:text-left">{colab.nome}</p>
                    <p className="text-sm text-gray-500 text-center md:text-left">{colab.cargo}</p>
                  </div>
                  <span className={clsx("text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg leading-none", {
                    "bg-[#FEEC6580] text-score-regular": colab.status === "Pendente",
                    "bg-[#BEE7CF] text-score-great": colab.status === "Finalizado",
                  })} style={{ minWidth: "4.5rem", textAlign: "center" }}>{colab.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center C1200:justify-start gap-2 md:gap-4 w-full md:w-auto items-center">
                {[colab.autoevaluationScore, colab.evaluation360Score, colab.managerEvaluationScore].map((nota, i) => (
                  <div key={i} className="flex items-center gap-3 mb-4">
                    <span className="text-gray-500 text-sm w-24">{["Autoavaliação", "Avaliação 360", "Nota gestor"][i]}</span>
                    <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-0.5 rounded w-10 text-center">{nota.toFixed(1)}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-500 text-sm w-24">Nota final</span>
                  <span className="font-bold text-sm px-2 py-0.5 rounded w-10 text-center text-white" style={{ backgroundColor: colab.status === "Finalizado" ? "#24A19F" : "#999999" }}>
                    {colab.status === "Finalizado" ? ((colab.autoevaluationScore + colab.managerEvaluationScore + colab.evaluation360Score) / 3).toFixed(1) : "-"}
                  </span>
                </div>
                <div className="w-full C1200:w-auto flex justify-center C1200:justify-start C1200:mt-0">
                  <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => toggleExpand(colab.id)} aria-label={colab.isExpanded ? "Recolher detalhes" : "Expandir detalhes"}>
                    <svg className={clsx("w-5 h-5 text-gray-500 transition-transform duration-200", { "rotate-180": colab.isExpanded })} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {colab.isExpanded && (
              <ScoreInputSection
                autoevaluationScore={colab.autoevaluationScore}
                managerEvaluationScore={colab.managerEvaluationScore}
                evaluation360Score={colab.evaluation360Score}
                summaryText={colab.summaryText}
                isEditable={colab.isEditable}
                status={colab.status}
                isVisible={colab.isExpanded}
                onJustificationChange={texto => updateJustificativa(colab.id, texto)}
                onConcluir={() => handleConcluir(colab.id)}
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
