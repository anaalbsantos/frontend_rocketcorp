import React, { useState, useEffect, useCallback } from "react";
import { FiPlusCircle, FiX, FiTrash2, FiCpu, FiPlayCircle } from "react-icons/fi";
import SearchInput from "@/components/SearchInput";

interface Pergunta {
  id: string;
  titulo: string;
  tipoResposta: "TEXT" | "NUMBER" | "YESORNO";
}

type PesquisaStatus = "Programada" | "Em andamento" | "Finalizada";

interface Pesquisa {
  id: string;
  cycleId?: string;
  title: string;
  description: string;
  status: PesquisaStatus;
  endDate: string;
  questions: Pergunta[];
  createdAt: string;
  respostasEsperadas: number;
  hasStarted?: boolean;
}

interface SurveyInsight {
  surveyTitle: string;
  resumo: string;
}

const BASE_URL = "http://localhost:3000";

const formatDateBR = (isoDate: string) => new Date(isoDate).toLocaleDateString("pt-BR");

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-[#e2e8f0]" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" aria-label="Fechar modal"><FiX size={24} /></button>
      <h3 className="text-xl font-semibold mb-6 text-gray-800">{title}</h3>
      {children}
    </div>
  </div>
);

interface QuestionEditorProps {
  questions: Pergunta[];
  onUpdateQuestion: (id: string, field: keyof Pergunta, value: string) => void;
  onRemoveQuestion: (id: string) => void;
  onAddQuestion: () => void;
  isEditable: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ questions, onUpdateQuestion, onRemoveQuestion, onAddQuestion, isEditable }) => (
  <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-[#e2e8f0]">
    {questions.map((q, i) => (
      <div key={q.id} className="border border-gray-300 rounded p-4 relative bg-white">
        {isEditable && (
          <button type="button" onClick={() => onRemoveQuestion(q.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label={`Remover pergunta ${i + 1}`}>
            <FiTrash2 />
          </button>
        )}
        <div className="mb-2">
          <label htmlFor={`pergunta-titulo-${q.id}`} className="block mb-1 text-sm font-medium text-gray-700">Pergunta {i + 1} - Título</label>
          <input id={`pergunta-titulo-${q.id}`} type="text" value={q.titulo} onChange={e => onUpdateQuestion(q.id, "titulo", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" disabled={!isEditable} />
        </div>
        <div className="mb-2">
          <label htmlFor={`pergunta-tipo-${q.id}`} className="block mb-1 text-sm font-medium text-gray-700">Tipo de Resposta</label>
          <select id={`pergunta-tipo-${q.id}`} value={q.tipoResposta} onChange={e => onUpdateQuestion(q.id, "tipoResposta", e.target.value as "TEXT" | "NUMBER" | "YESORNO")} className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" disabled={!isEditable}>
            <option value="TEXT">Texto</option>
            <option value="YESORNO">Sim ou Não</option>
            <option value="NUMBER">Escala (Número)</option>
          </select>
        </div>
      </div>
    ))}
    {isEditable && (
      <button type="button" onClick={onAddQuestion} className="flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-800 font-semibold">
        <FiPlusCircle /> Adicionar pergunta
      </button>
    )}
  </div>
);

type UserRole = "rh" | "gestor" | "colaborador" | "comite";
interface PesquisaClimaProps {
  role: UserRole;
}

const PesquisaClima: React.FC<PesquisaClimaProps> = ({ role }) => {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [modalDashboard, setModalDashboard] = useState<Pesquisa | null>(null);
  const [modalFormOpen, setModalFormOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPesquisa, setCurrentPesquisa] = useState<Partial<Pesquisa>>({
    title: "", description: "", endDate: "", questions: [], status: "Programada", respostasEsperadas: 0, cycleId: "default_cycle", createdAt: new Date().toISOString(), hasStarted: false,
  });
  const [formStep, setFormStep] = useState<"info" | "perguntas">("info");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | PesquisaStatus>("Todos");
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyInsight, setSurveyInsight] = useState<SurveyInsight | null>(null);

  const canManage = role === "rh";

  const fetchWithAuth = useCallback(async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado. Faça login novamente.");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options?.headers || {}) };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      // Cast 'errorData' to 'unknown' first, then check its type
      const errorData: unknown = await response.json();
      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof (errorData as { message: string }).message === 'string') {
        throw new Error((errorData as { message: string }).message);
      }
      throw new Error("Erro na requisição.");
    }
    return response;
  }, []);

  const fetchPesquisas = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/survey`);
      // Cast 'data' to 'unknown' first, then to the expected type 'Pesquisa[]'
      const data: unknown = await response.json();

      // Basic runtime type check for 'data'
      if (!Array.isArray(data)) {
          throw new Error("Dados de pesquisa inválidos recebidos do servidor.");
      }

      const formattedData: Pesquisa[] = (data as any[]).map((item: any) => { // Still needs 'any' here for mapping arbitrary backend data
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const endDate = new Date(item.endDate); endDate.setHours(23, 59, 59, 999);
        let status: PesquisaStatus;
        const hasStartedFlag = item.hasStarted || false;

        if (endDate < today) {
          status = "Finalizada";
        } else if (hasStartedFlag) {
          status = "Em andamento";
        } else {
          status = "Programada";
        }

        return {
          id: item.id, cycleId: item.cycleId, title: item.title, description: item.description,
          createdAt: item.createdAt, endDate: item.endDate,
          questions: item.questions.map((q: any) => ({ id: q.id, titulo: q.text, tipoResposta: q.type })),
          status: status, respostasEsperadas: item.questions.length * 10, hasStarted: hasStartedFlag,
        } as Pesquisa; // Explicitly cast to Pesquisa
      });

      const hasFinalizedMock = formattedData.some(p => p.id === "mock-finalizada-001");
      if (!hasFinalizedMock) {
        formattedData.unshift({
          id: "mock-finalizada-001", cycleId: "cycle2024_mock", title: "Pesquisa de Clima - FINALIZADA (Mock)",
          description: "Esta é uma pesquisa finalizada para demonstração. Ela mostra a análise de IA.",
          createdAt: "2024-01-01T10:00:00.000Z", endDate: "2024-03-31T23:59:59.000Z",
          questions: [{ id: "q1-mock", titulo: "Ambiente de trabalho é bom?", tipoResposta: "YESORNO" }, { id: "q2-mock", titulo: "Qual a nota para liderança?", tipoResposta: "NUMBER" }],
          status: "Finalizada", respostasEsperadas: 50, hasStarted: true,
        });
      }

      setPesquisas(formattedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: unknown) { // Use 'unknown' for caught errors
      setError((err instanceof Error) ? err.message : "Falha ao carregar pesquisas.");
      console.error("Erro ao buscar pesquisas:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchPesquisas();
  }, [fetchPesquisas]);

  const fetchSurveyInsight = useCallback(async (surveyId: string) => {
    setSurveyInsight(null);
    if (surveyId === "mock-finalizada-001") {
      setSurveyInsight({
        surveyTitle: "Pesquisa de Clima - FINALIZADA (Mock)",
        resumo: `A análise revelou que 85% dos respondentes (43 respondentes) consideram o ambiente de trabalho positivo. A nota média para liderança foi de 4.2/5, indicando boa percepção geral. Áreas para melhoria incluem comunicação interna, onde 30% sugeriram mais transparência.`,
      });
      return;
    }
    try {
      const response = await fetchWithAuth(`${BASE_URL}/genai/generate-insight/${surveyId}`);
      const data: unknown = await response.json();
      if (typeof data === 'object' && data !== null && 'surveyTitle' in data && 'resumo' in data) {
          setSurveyInsight(data as SurveyInsight);
      } else {
          throw new Error("Formato de insight de pesquisa inválido.");
      }
    } catch (err: unknown) {
      setError((err instanceof Error) ? err.message : "Falha ao carregar insights da pesquisa.");
      console.error("Erro ao buscar insights:", err);
    }
  }, [fetchWithAuth]);

  const mensagemPrazo = useCallback((isoDate: string, status: PesquisaStatus) => {
    if (!isoDate) return "";
    return status === "Finalizada" ? "Pesquisa encerrada" : status === "Programada" ? `A iniciar. Data final: ${formatDateBR(isoDate)}` : `Encerramento em ${formatDateBR(isoDate)}`;
  }, []);

  const handleUpdateCurrentPesquisa = useCallback(<K extends keyof Partial<Pesquisa>>(field: K, value: Partial<Pesquisa>[K]) => {
    setCurrentPesquisa(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdatePergunta = useCallback((id: string, field: keyof Pergunta, value: string) =>
    setCurrentPesquisa(prev => ({ ...prev, questions: (prev.questions || []).map(q => q.id === id ? { ...q, [field]: value } : q) })), []
  );

  const handleRemovePergunta = useCallback((id: string) =>
    setCurrentPesquisa(prev => ({ ...prev, questions: (prev.questions || []).filter(q => q.id !== id) })), []
  );

  const handleAddPergunta = useCallback(() =>
    setCurrentPesquisa(prev => ({ ...prev, questions: [...(prev.questions || []), { id: String(Date.now()) + Math.random(), titulo: "", tipoResposta: "TEXT" }] })), []
  );

  const openCreateModal = useCallback(() => {
    if (!canManage) return;
    setCurrentPesquisa({ title: "", description: "", endDate: "", questions: [], status: "Programada", respostasEsperadas: 0, cycleId: "default_cycle", createdAt: new Date().toISOString(), hasStarted: false });
    setIsEditing(false); setFormStep("info"); setModalFormOpen(true);
  }, [canManage]);

  const openEditModal = useCallback((p: Pesquisa) => {
    if (!canManage || p.status !== "Programada") return;
    setCurrentPesquisa({ id: p.id, title: p.title, description: p.description, endDate: p.endDate, questions: p.questions, status: p.status, respostasEsperadas: p.respostasEsperadas, cycleId: p.cycleId, createdAt: p.createdAt, hasStarted: p.hasStarted });
    setIsEditing(true); setFormStep("info"); setModalFormOpen(true);
  }, [canManage]);

  const handleFormSubmit = useCallback(async () => {
    if (!canManage) return;
    if (!currentPesquisa.title || !currentPesquisa.endDate || !currentPesquisa.respostasEsperadas) {
      alert("Título, data final e preenchimentos esperados são obrigatórios."); return;
    }

    setLoading(true); setError(null);
    try {
      const payload = {
        cycleId: currentPesquisa.cycleId || "default_cycle", title: currentPesquisa.title, description: currentPesquisa.description || "",
        endDate: new Date(currentPesquisa.endDate + "T23:59:59.000Z").toISOString(),
        questions: (currentPesquisa.questions || []).map(q => ({ text: q.titulo, type: q.tipoResposta })),
        hasStarted: currentPesquisa.hasStarted || false
      };

      if (isEditing && currentPesquisa.id) {
        setPesquisas(prev => prev.map(p => p.id === currentPesquisa.id ? { ...p, ...currentPesquisa, hasStarted: p.hasStarted } as Pesquisa : p));
        alert("Pesquisa editada com sucesso! (Edição simulada no frontend)");
      } else {
        await fetchWithAuth(`${BASE_URL}/survey`, { method: "POST", body: JSON.stringify(payload) });
        alert("Pesquisa criada com sucesso!");
      }
      setModalFormOpen(false); fetchPesquisas();
    } catch (err: unknown) {
      setError((err instanceof Error) ? err.message : "Falha ao salvar pesquisa."); alert(`Erro ao salvar pesquisa: ${(err instanceof Error) ? err.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }, [currentPesquisa, isEditing, canManage, fetchWithAuth, fetchPesquisas, pesquisas]);

  const excluirPesquisa = useCallback(async (id: string) => {
    if (!canManage) return;
    const pesquisa = pesquisas.find(p => p.id === id);
    if (!pesquisa || pesquisa.status !== "Programada") {
      alert("Apenas pesquisas com status 'Programada' podem ser excluídas."); return;
    }
    if (!window.confirm(`Tem certeza que deseja excluir a pesquisa "${pesquisa.title}"?`)) return;

    setLoading(true); setError(null);
    try {
      await fetchWithAuth(`${BASE_URL}/survey/${id}`, { method: "DELETE" });
      alert(`Pesquisa "${pesquisa.title}" excluída com sucesso!`);
      fetchPesquisas();
      if (modalFormOpen && currentPesquisa.id === id) setModalFormOpen(false);
    } catch (err: unknown) {
      setError((err instanceof Error) ? err.message : "Falha ao excluir pesquisa."); alert(`Erro ao excluir pesquisa: ${(err instanceof Error) ? err.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }, [pesquisas, modalFormOpen, currentPesquisa, canManage, fetchWithAuth, fetchPesquisas]);

  const iniciarPesquisa = useCallback(async (id: string) => {
    if (!canManage) return;
    const pesquisa = pesquisas.find(p => p.id === id);
    if (!pesquisa || pesquisa.status !== "Programada") {
      alert("Apenas pesquisas com status 'Programada' podem ser iniciadas."); return;
    }
    if (!window.confirm(`Tem certeza que deseja INICIAR a pesquisa "${pesquisa.title}"? Após iniciada, ela não poderá ser editada ou excluída.`)) return;

    setLoading(true); setError(null);
    try {
      setPesquisas(prev => prev.map(p => p.id === id ? { ...p, status: "Em andamento", hasStarted: true } : p));
      alert(`Pesquisa "${pesquisa.title}" iniciada com sucesso!`);
      fetchPesquisas();
    } catch (err: unknown) {
      setError((err instanceof Error) ? err.message : "Falha ao iniciar pesquisa."); alert(`Erro ao iniciar pesquisa: ${(err instanceof Error) ? err.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }, [canManage, fetchPesquisas, pesquisas]);

  const filteredPesquisas = pesquisas.filter(p => {
    const matchesStatus = filtroStatus === "Todos" || p.status === filtroStatus;
    const matchesSearch = busca.trim() === "" || p.title.toLowerCase().includes(busca.toLowerCase()) || p.description.toLowerCase().includes(busca.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getSimulatedResponses = useCallback((expected: number, surveyStatus: PesquisaStatus) => {
    if (surveyStatus === "Finalizada") {
      if (modalDashboard?.id === "mock-finalizada-001" && surveyInsight?.resumo) {
         const match = surveyInsight.resumo.match(/(\d+)\s+respondente/i);
         if (match && match[1]) return parseInt(match[1], 10);
      }
      return Math.min(expected, Math.floor(expected * (0.8 + Math.random() * 0.2)));
    } else if (surveyStatus === "Em andamento") {
      return Math.floor(expected * (0.1 + Math.random() * 0.4));
    }
    return 0;
  }, [modalDashboard, surveyInsight]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
        <h1 className="text-2xl font-semibold text-gray-800">Pesquisa de Clima</h1>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar pesquisas..." filterOptions={["Todos", "Programada", "Em andamento", "Finalizada"]} initialFilter="Todos" onFilterChange={f => setFiltroStatus(f as "Todos" | PesquisaStatus)} className="flex-grow min-w-0" />
      </div>

      <div className="px-4 md:px-8 py-6 max-w-[1700px] mx-auto w-full">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Minhas pesquisas</h2>
              {canManage && (
                <button type="button" onClick={openCreateModal} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded phone:px-2 phone:py-0.5">
                  <span className="phone:hidden flex items-center gap-2"><FiPlusCircle /> Nova pesquisa</span>
                  <span className="hidden phone:inline text-lg font-bold">+</span>
                </button>
              )}
            </div>

            {loading && <p className="text-gray-600">Carregando pesquisas...</p>}
            {error && <p className="text-red-500">Erro: {error}</p>}
            {!loading && !error && filteredPesquisas.length === 0 && (
              <p className="text-gray-500">Nenhuma pesquisa encontrada.</p>
            )}

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl1600:grid-cols-3">
              {!loading && !error && filteredPesquisas.map(p => {
                const currentResponses = getSimulatedResponses(p.respostasEsperadas, p.status);
                const isProgrammable = p.status === "Programada";
                const isFinalized = p.status === "Finalizada";

                return (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative cursor-pointer hover:ring-2 hover:ring-emerald-600">
                    <div onClick={() => { setModalDashboard(p); if (isFinalized) fetchSurveyInsight(p.id); else setSurveyInsight(null); }}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.title}</h3>
                      <p className="text-gray-600 mb-2 text-sm truncate max-h-16 overflow-hidden" title={p.description}>{p.description}</p>
                      <p className="text-sm text-gray-600 mb-3">Status: {p.status}</p>
                      <div className="flex flex-col xl1600:flex-row justify-between items-start xl1600:items-center text-sm text-gray-500 mb-3 gap-1">
                        {isProgrammable ? (
                          <span>Preenchimentos Esperados: {p.respostasEsperadas}</span>
                        ) : (
                          <span>Respostas: {currentResponses}/{p.respostasEsperadas}</span>
                        )}
                        <span>{mensagemPrazo(p.endDate, p.status)}</span>
                      </div>
                    </div>

                    {canManage && (
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {isProgrammable && (
                          <button onClick={e => { e.stopPropagation(); iniciarPesquisa(p.id); }} className="text-emerald-600 hover:text-emerald-800 p-1 rounded transition" title="Iniciar Pesquisa" aria-label="Iniciar Pesquisa">
                            <FiPlayCircle size={20} />
                          </button>
                        )}

                        <div className="relative">
                          <button onClick={e => { e.stopPropagation(); setMenuAberto(prev => (prev === p.id ? null : p.id)); }} className="text-gray-500 hover:text-gray-800 p-1 rounded transition" title="Mais ações" aria-haspopup="true" aria-expanded={menuAberto === p.id}>
                            &#x22EE;
                          </button>

                          {menuAberto === p.id && (
                            <div onClick={e => e.stopPropagation()} className="absolute top-8 right-0 bg-white border border-gray-200 shadow-md rounded z-20 w-32">
                              <button onClick={() => { openEditModal(p); setMenuAberto(null); }} className={`w-full px-4 py-2 text-sm text-left ${isProgrammable ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'}`} disabled={!isProgrammable}>
                                Editar
                              </button>
                              <button onClick={() => { excluirPesquisa(p.id); setMenuAberto(null); }} className={`w-full px-4 py-2 text-sm text-left ${isProgrammable ? 'hover:bg-gray-100 text-red-600' : 'text-gray-400 cursor-not-allowed'}`} disabled={!isProgrammable}>
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {canManage && !loading && (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 text-gray-400 text-sm cursor-pointer" onClick={openCreateModal}>
                  Nova pesquisa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalDashboard && (
        <Modal title={modalDashboard.title} onClose={() => setModalDashboard(null)}>
          <div className="mb-6 text-gray-700">
            <h4 className="font-semibold mb-2">Descrição da Pesquisa</h4>
            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4">
              <p className="text-gray-600 break-words max-h-28 overflow-y-auto">{modalDashboard.description}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4">
              <p className="text-sm text-gray-500">Data de Conclusão: {formatDateBR(modalDashboard.endDate)}</p>
              {modalDashboard.status !== "Programada" && (
                <p className="text-sm text-gray-500">Preenchimentos Esperados: {modalDashboard.respostasEsperadas}</p>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4 max-h-[300px] overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-4">Perguntas</h4>
              <div className="space-y-4">
                {modalDashboard.questions && modalDashboard.questions.length > 0 ? (
                  modalDashboard.questions.map((pergunta, index) => (
                    <div key={pergunta.id} className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300">
                      <strong>Pergunta {index + 1}:</strong>
                      <p className="text-gray-600 mt-2">{pergunta.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">Tipo de Resposta: {pergunta.tipoResposta === "TEXT" ? "Texto" : pergunta.tipoResposta === "YESORNO" ? "Sim ou Não" : "Escala (Número)"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma pergunta cadastrada.</p>
                )}
              </div>
            </div>

            {(modalDashboard.status === "Em andamento" || modalDashboard.status === "Finalizada") && (
              <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4 mt-6">
                <h4 className="font-semibold text-gray-800 flex justify-between items-center">
                  <span>Preenchimento da Pesquisa</span>
                  <span className="text-lg font-bold text-gray-800">
                    {modalDashboard.respostasEsperadas > 0 ? `${Math.round((getSimulatedResponses(modalDashboard.respostasEsperadas, modalDashboard.status) / modalDashboard.respostasEsperadas) * 100)}%` : "0%"}
                  </span>
                </h4>
                <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2">
                  <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${modalDashboard.respostasEsperadas > 0 ? (getSimulatedResponses(modalDashboard.respostasEsperadas, modalDashboard.status) / modalDashboard.respostasEsperadas) * 100 : 0}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">*As respostas atuais são uma estimativa ou simulação.</p>
              </div>
            )}

            {modalDashboard.status === "Finalizada" && (
              <>
                <h4 className="font-semibold mt-6 mb-2 flex items-center gap-2 text-gray-800">
                  <FiCpu size={20} /> Resumo da Análise de Sentimento
                </h4>
                <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50 min-h-[60px]">
                  {surveyInsight ? (
                    <div dangerouslySetInnerHTML={{ __html: surveyInsight.resumo.replace(/\n/g, '<br />') }} />
                  ) : (
                    <p className="text-gray-500">Carregando análise de sentimento...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {modalFormOpen && (
        <Modal title={isEditing ? "Editar Pesquisa" : `Nova Pesquisa - Passo ${formStep === "info" ? "1" : "2"}`} onClose={() => setModalFormOpen(false)}>
          {formStep === "info" && (
            <form onSubmit={e => { e.preventDefault(); if (!currentPesquisa.title || !currentPesquisa.endDate || !currentPesquisa.respostasEsperadas) { alert("Preencha pelo menos título, data final e preenchimentos esperados."); return; } setFormStep("perguntas"); }} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="title">Título</label>
                <input id="title" type="text" value={currentPesquisa.title || ""} onChange={e => handleUpdateCurrentPesquisa("title", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required autoFocus disabled={!canManage} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="description">Descrição</label>
                <textarea id="description" rows={3} value={currentPesquisa.description || ""} onChange={e => handleUpdateCurrentPesquisa("description", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" disabled={!canManage} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="endDate">Data Final</label>
                <input id="endDate" type="date" value={currentPesquisa.endDate ? currentPesquisa.endDate.split('T')[0] : ""} onChange={e => handleUpdateCurrentPesquisa("endDate", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required disabled={!canManage} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="respostasEsperadas">Preenchimentos Esperados</label>
                <input id="respostasEsperadas" type="number" value={currentPesquisa.respostasEsperadas || 0} onChange={e => handleUpdateCurrentPesquisa("respostasEsperadas", parseInt(e.target.value, 10))} className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required min="0" disabled={!canManage} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalFormOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700" disabled={!canManage}>Próximo</button>
              </div>
            </form>
          )}

          {formStep === "perguntas" && (
            <div className="space-y-4">
              <QuestionEditor questions={currentPesquisa.questions || []} onUpdateQuestion={handleUpdatePergunta} onRemoveQuestion={handleRemovePergunta} onAddQuestion={handleAddPergunta} isEditable={canManage} />
              <div className="flex justify-between gap-3 mt-6">
                <button type="button" onClick={() => setFormStep("info")} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Anterior</button>
                <button type="button" onClick={handleFormSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700" disabled={!canManage}>
                  {isEditing ? "Salvar Edição" : "Criar Pesquisa"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PesquisaClima;