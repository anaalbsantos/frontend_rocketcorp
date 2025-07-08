import React, { useState, useEffect, useCallback } from "react";
import { FiPlusCircle, FiX, FiTrash2, FiCpu } from "react-icons/fi";
import SearchInput from "@/components/SearchInput";

interface Pergunta { id: string; titulo: string; }
interface Pesquisa {
  id: string; titulo: string; descricao: string; status: "Em andamento" | "Finalizada";
  respostasAtuais: number; respostasEsperadas: number; data: string; perguntas: Pergunta[];
}

const LOCAL_STORAGE_KEY = "pesquisas_clima";
const CACHE_EXPIRATION = 15 * 60 * 1000;

const formatDateBR = (isoDate: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString("pt-BR");
};

interface ModalProps { onClose: () => void; children: React.ReactNode; title: string; }
const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-[#e2e8f0]" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" aria-label="Fechar modal"><FiX size={24} /></button>
      <h3 className="text-xl font-semibold mb-6 text-gray-800">{title}</h3>
      {children}
    </div>
  </div>
);

interface QuestionEditorProps {
  questions: Pergunta[]; onUpdateQuestion: (id: string, field: keyof Pergunta, value: string) => void;
  onRemoveQuestion: (id: string) => void; onAddQuestion: () => void; isEditable: boolean;
}


const QuestionEditor: React.FC<QuestionEditorProps> = ({ questions, onUpdateQuestion, onRemoveQuestion, onAddQuestion, isEditable, }) => (
  <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-[#e2e8f0]">
    {questions.map((q, i) => (
      <div key={q.id} className="border border-gray-300 rounded p-4 relative bg-white">
        {isEditable && (
          <button type="button" onClick={() => onRemoveQuestion(q.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label={`Remover pergunta ${i + 1}`}><FiTrash2 /></button>
        )}
        <div className="mb-2">
          <label htmlFor={`pergunta-titulo-${q.id}`} className="block mb-1 text-sm font-medium text-gray-700">Pergunta {i + 1} - Título</label>
          <input id={`pergunta-titulo-${q.id}`} type="text" value={q.titulo} onChange={(e) => onUpdateQuestion(q.id, "titulo", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" disabled={!isEditable}
          />
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
interface PesquisaClimaProps { role: UserRole; }

const PesquisaClima: React.FC<PesquisaClimaProps> = ({ role }) => {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [modalDashboard, setModalDashboard] = useState<Pesquisa | null>(null);
  const [modalCriarEtapa, setModalCriarEtapa] = useState<"info" | "perguntas" | null>(null);
  const [modalEdicao, setModalEdicao] = useState<Pesquisa | null>(null);
  const [novaPesquisa, setNovaPesquisa] = useState<Partial<Pesquisa>>({
    titulo: "", descricao: "", data: "", perguntas: [], status: "Em andamento", respostasAtuais: 0, respostasEsperadas: 0,
  });
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Em andamento" | "Finalizada">("Todos");
  const [menuAberto, setMenuAberto] = useState<string | null>(null);


  const canEdit = role === "rh";

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const { timestamp, data } = JSON.parse(raw);
        if (Date.now() - timestamp < CACHE_EXPIRATION) { setPesquisas(data); return; }
      } catch (e) { console.error("Falha ao analisar dados do localStorage:", e); }
    }
    setPesquisas([
      { id: "1", titulo: "Clima - Julho/2025", descricao: "Pesquisa mensal sobre o clima organizacional da empresa. Aborda temas como satisfação, ambiente de trabalho e oportunidades de crescimento.", status: "Em andamento", respostasAtuais: 45, respostasEsperadas: 60, perguntas: [{ id: "q1", titulo: "Você se sente valorizado(a) na empresa?" }, { id: "q2", titulo: "Qual o seu nível de satisfação com o ambiente de trabalho?" }], data: "2025-07-30" },
      { id: "2", titulo: "Onboarding Novos Colaboradores", descricao: "Feedback dos novos colaboradores sobre o processo de integração, desde a documentação até o treinamento inicial.", status: "Finalizada", respostasAtuais: 20, respostasEsperadas: 20, perguntas: [{ id: "q3", titulo: "O processo de onboarding atendeu suas expectativas?" }, { id: "q4", titulo: "Você recebeu suporte adequado nos primeiros dias?" }], data: "2025-06-01" },
      { id: "3", titulo: "Avaliação de Desempenho - Q2/2025", descricao: "Pesquisa para coletar feedback sobre o desempenho dos colaboradores no segundo trimestre.", status: "Em andamento", respostasAtuais: 10, respostasEsperadas: 50, perguntas: [{ id: "q5", titulo: "Você se sente desafiado(a) por suas tarefas atuais?" }, { id: "q6", titulo: "Quão satisfeito(a) você está com seu plano de desenvolvimento?" }], data: "2025-08-15" },
      { id: "4", titulo: "Pesquisa de Saúde e Bem-Estar", descricao: "Avaliação das iniciativas de bem-estar e saúde mental oferecidas pela empresa.", status: "Finalizada", respostasAtuais: 75, respostasEsperadas: 75, perguntas: [{ id: "q7", titulo: "As ações de bem-estar da empresa contribuem para sua qualidade de vida?" }, { id: "q8", titulo: "Você se sente à vontade para discutir questões de saúde mental no trabalho?" }], data: "2025-05-20" },
    ]);
  }, []);

  useEffect(() => {
    if (pesquisas.length > 0) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ timestamp: Date.now(), data: pesquisas }));
  }, [pesquisas]);

  const mensagemPrazo = useCallback((dataISO: string) => {
    if (!dataISO) return "";
    const hoje = new Date();
    const prazo = new Date(dataISO + 'T23:59:59');
    return prazo < hoje ? "Pesquisa encerrada" : `Encerramento em ${formatDateBR(dataISO)}`;
  }, []);

  const handleUpdateNovaPesquisa = useCallback(<K extends keyof Partial<Pesquisa>>(field: K, value: Partial<Pesquisa>[K]) => {
    setNovaPesquisa((prev) => ({ ...prev, [field]: value }));
  }, []);
  const handleUpdatePergunta = useCallback((id: string, field: keyof Pergunta, value: string) => setNovaPesquisa((prev) => ({ ...prev, perguntas: (prev.perguntas || []).map((q) => (q.id === id ? { ...q, [field]: value } : q)), })), []);
  const handleRemovePergunta = useCallback((id: string) => setNovaPesquisa((prev) => ({ ...prev, perguntas: (prev.perguntas || []).filter((q) => q.id !== id), })), []);
  const handleAddPergunta = useCallback(() => setNovaPesquisa((prev) => ({ ...prev, perguntas: [...(prev.perguntas || []), { id: String(Date.now()) + Math.random(), titulo: "" }], })), []);

  const criarNovaPesquisa = useCallback(() => {
    if (!canEdit) return;
    setNovaPesquisa({ titulo: "", descricao: "", data: "", perguntas: [], status: "Em andamento", respostasAtuais: 0, respostasEsperadas: 0, });
    setModalCriarEtapa("info");
  }, [canEdit]);

  const irParaPerguntas = useCallback(() => {
    if (!novaPesquisa.titulo || !novaPesquisa.data || !novaPesquisa.respostasEsperadas) { alert("Preencha pelo menos título, data e preenchimentos esperados."); return; }
    setModalCriarEtapa("perguntas");
  }, [novaPesquisa.titulo, novaPesquisa.data, novaPesquisa.respostasEsperadas]);

  const salvarNovaPesquisa = useCallback(() => {
    if (!canEdit) return;
    if (!novaPesquisa.titulo || !novaPesquisa.data || !novaPesquisa.respostasEsperadas) { alert("Título, data e preenchimentos esperados são obrigatórios."); return; }
    setPesquisas((prev) => [{ id: String(Date.now()), ...novaPesquisa, status: "Em andamento", respostasAtuais: 0, respostasEsperadas: Number(novaPesquisa.respostasEsperadas) } as Pesquisa, ...prev]);
    setModalCriarEtapa(null);
  }, [novaPesquisa, canEdit]);

  const abrirModalEdicao = useCallback((p: Pesquisa) => {
    if (!canEdit) return;
    setModalEdicao(p);
    setNovaPesquisa({ ...p });
  }, [canEdit]);

  const salvarEdicao = useCallback(() => {
    if (!canEdit) return;
    if (!modalEdicao || !novaPesquisa.titulo || !novaPesquisa.data || !novaPesquisa.respostasEsperadas) { alert("Título, data e preenchimentos esperados são obrigatórios."); return; }
    setPesquisas((prev) => prev.map((x) => (x.id === modalEdicao.id ? { ...x, ...novaPesquisa, respostasEsperadas: Number(novaPesquisa.respostasEsperadas) } as Pesquisa : x)));
    setModalEdicao(null);
  }, [modalEdicao, novaPesquisa, canEdit]);

  const excluirPesquisa = useCallback((id: string) => {
    if (!canEdit) return;
    const pesquisa = pesquisas.find((p) => p.id === id);
    if (!pesquisa) return;
    if (!window.confirm(`Tem certeza que deseja excluir a pesquisa "${pesquisa.titulo}"?`)) return;
    setPesquisas((prev) => prev.filter((x) => x.id !== id));
    if (modalEdicao && modalEdicao.id === id) setModalEdicao(null);
  }, [pesquisas, modalEdicao, canEdit]);

  const pesquisasFiltradas = pesquisas.filter((p) => {
    const matchesStatus = filtroStatus === "Todos" || p.status === filtroStatus;
    const matchesSearch = busca.trim() === "" || p.titulo.toLowerCase().includes(busca.toLowerCase()) || p.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
        <h1 className="text-2xl font-semibold text-gray-800">Pesquisa de Clima</h1>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar pesquisas..." filterOptions={["Todos", "Em andamento", "Finalizada"]} initialFilter="Todos" onFilterChange={(f) => setFiltroStatus(f as "Todos" | "Em andamento" | "Finalizada")} className="flex-grow min-w-0" />
      </div>

      <div className="px-4 md:px-8 py-6 max-w-[1700px] mx-auto w-full">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Minhas pesquisas</h2>
              {canEdit && (
                <button
                  type="button"
                  onClick={criarNovaPesquisa}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded phone:px-2 phone:py-0.5"
                >
                  <span className="phone:hidden flex items-center gap-2">
                    <FiPlusCircle /> Nova pesquisa
                  </span>
                  <span className="hidden phone:inline text-lg font-bold">+</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl1600:grid-cols-3">
              {pesquisasFiltradas.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative cursor-pointer hover:ring-2 hover:ring-emerald-600">
                  <div onClick={() => setModalDashboard(p)}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.titulo}</h3>
                    <p className="text-gray-600 mb-2 text-sm truncate max-h-16 overflow-hidden" title={p.descricao}>{p.descricao}</p>
                    <p className="text-sm text-gray-600 mb-3">Status: {p.status}</p>
                  <div className="flex flex-col xl1600:flex-row justify-between items-start xl1600:items-center text-sm text-gray-500 mb-3 gap-1">
                    <span>Respostas: {p.respostasAtuais}/{p.respostasEsperadas}</span>
                    <span>{mensagemPrazo(p.data)}</span>
                  </div>
                </div>

                  {canEdit && (
                    <div className="absolute top-3 right-3 flex items-center">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAberto((prev) => (prev === p.id ? null : p.id));
                          }}
                          className="text-gray-500 hover:text-gray-800 p-1 rounded transition"
                          title="Mais ações"
                          aria-haspopup="true"
                          aria-expanded={menuAberto === p.id}
                        >
                          &#x22EE;
                        </button>

                        {menuAberto === p.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-8 right-0 bg-white border border-gray-200 shadow-md rounded z-20 w-32"
                          >
                            <button
                              onClick={() => {
                                abrirModalEdicao(p);
                                setMenuAberto(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-gray-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                excluirPesquisa(p.id);
                                setMenuAberto(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-red-600"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {canEdit && (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 text-gray-400 text-sm cursor-pointer" onClick={criarNovaPesquisa}>
                  Nova pesquisa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalDashboard && (
        <Modal title={modalDashboard.titulo} onClose={() => setModalDashboard(null)}>
          <div className="mb-6 text-gray-700">
            <h4 className="font-semibold mb-2">Descrição da Pesquisa</h4>
            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4">
              <p className="text-gray-600 break-words max-h-28 overflow-y-auto">{modalDashboard.descricao}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4">
              <p className="text-sm text-gray-500">Data de Conclusão: {formatDateBR(modalDashboard.data)}</p>
              <p className="text-sm text-gray-500">Preenchimentos Esperados: {modalDashboard.respostasEsperadas}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4 max-h-[300px] overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-4">Perguntas</h4>
              <div className="space-y-4">
                {modalDashboard.perguntas && modalDashboard.perguntas.length > 0 ? (
                  modalDashboard.perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300">
                      <strong>Pergunta {index + 1}:</strong>
                      <p className="text-gray-600 mt-2">{pergunta.titulo}</p>
                    </div>
                  ))
                ) : (<p className="text-gray-500">Nenhuma pergunta cadastrada.</p>)}
              </div>
            </div>

            {modalDashboard.status === "Finalizada" && (
              <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4 mt-6">
                <h4 className="font-semibold text-gray-800 flex justify-between items-center">
                  <span>Preenchimento da Pesquisa</span>
                  <span className="text-lg font-bold text-gray-800">
                    {modalDashboard.respostasEsperadas > 0 ? `${Math.round((modalDashboard.respostasAtuais / modalDashboard.respostasEsperadas) * 100)}%` : "0%"}
                  </span>
                </h4>

                <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2">
                  <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${modalDashboard.respostasEsperadas > 0 ? (modalDashboard.respostasAtuais / modalDashboard.respostasEsperadas) * 100 : 0}%`, }} />
                </div>
              </div>
            )}

            {modalDashboard.status === "Finalizada" && (
              <>
                <h4 className="font-semibold mt-6 mb-2 flex items-center gap-2 text-gray-800"><FiCpu size={20} /> Resumo da Análise de Sentimento</h4>
                <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50 min-h-[60px]">
                  <div className="flex gap-4 md800:flex-col">
                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded shadow w-1/3 md800:w-full"><span className="text-green-600 font-bold text-3xl">65%</span><span className="text-gray-600 text-sm">Sentimento Positivo</span></div>
                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded shadow w-1/3 md800:w-full"><span className="text-yellow-600 font-bold text-3xl">20%</span><span className="text-gray-600 text-sm">Neutro</span></div>
                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded shadow w-1/3 md800:w-full"><span className="text-red-600 font-bold text-3xl">15%</span><span className="text-gray-600 text-sm">Sentimento Negativo</span></div>
                  </div>

                  <h5 className="mt-4 font-semibold">Pontos Fortes:</h5>
                  <ul className="list-disc ml-6">
                    <li><strong>Engajamento:</strong> 65% dos colaboradores demonstraram um sentimento positivo em relação ao ambiente de trabalho. Isso se deve ao bom relacionamento entre as equipes, clareza nas metas e oportunidades de crescimento.</li>
                    <li><strong>Liderança:</strong> A liderança foi mencionada de forma positiva em 50% das respostas. Os líderes são considerados claros e objetivos, contribuindo para um ambiente mais transparente.</li>
                  </ul>

                  <h5 className="mt-4 font-semibold">Áreas para Melhoria:</h5>
                  <ul className="list-disc ml-6">
                    <li><strong>Reconhecimento:</strong> 15% dos colaboradores indicaram que se sentem pouco reconhecidos. Este ponto é um dos mais críticos e sugere que as iniciativas de valorização precisam ser ampliadas.</li>
                    <li><strong>Sobrecarregados de Trabalho:</strong> 10% dos colaboradores mencionaram um aumento na carga de trabalho, apontando isso como uma fonte de estresse e queda no desempenho.</li>
                    <li><strong>Comunicação entre departamentos:</strong> Alguns colaboradores mencionaram que a comunicação entre setores poderia ser mais fluida, principalmente quando há mudanças nas metas ou processos.</li>
                  </ul>

                  <h5 className="mt-4 font-semibold">Recomendações:</h5>
                  <ul className="list-disc ml-6">
                    <li><strong>Investir em Bem-estar:</strong> É importante considerar programas que ajudem a reduzir a sobrecarga de trabalho e melhorem o equilíbrio entre vida profissional e pessoal.</li>
                    <li><strong>Aprimorar o Reconhecimento:</strong> Implantar mais ações de reconhecimento, seja através de feedbacks mais frequentes ou bonificações, pode ajudar a aumentar a motivação.</li>
                    <li><strong>Fomentar a Comunicação:</strong> Melhorar os processos de comunicação entre departamentos, garantindo que todos estejam alinhados e informados sobre mudanças e expectativas.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {modalCriarEtapa && (
        <Modal title={`Nova Pesquisa - Passo ${modalCriarEtapa === "info" ? "1" : "2"}`} onClose={() => setModalCriarEtapa(null)}>
          {modalCriarEtapa === "info" && (
            <form onSubmit={(e) => { e.preventDefault(); irParaPerguntas(); }} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="titulo">Título</label>
                <input id="titulo" type="text" value={novaPesquisa.titulo || ""} onChange={(e) => handleUpdateNovaPesquisa("titulo", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required autoFocus disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="descricao">Descrição</label>
                <textarea id="descricao" rows={3} value={novaPesquisa.descricao || ""} onChange={(e) => handleUpdateNovaPesquisa("descricao", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="respostasEsperadas">Preenchimentos Esperados</label>
                <input id="respostasEsperadas" type="number" value={novaPesquisa.respostasEsperadas || ""}
                  onChange={(e) => handleUpdateNovaPesquisa("respostasEsperadas", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="data">Prazo (data)</label>
                <input id="data" type="date" value={novaPesquisa.data || ""} onChange={(e) => handleUpdateNovaPesquisa("data", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required disabled={!canEdit}
                />
              </div>
              <div className="flex justify-between gap-2">
                <button type="button" className="w-1/2 py-2 rounded-lg bg-gray-500 text-white font-semibold" onClick={() => setModalCriarEtapa(null)} disabled={!canEdit}>Cancelar</button>
                <button type="submit" className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white font-semibold" disabled={!canEdit}>Próximo</button>
              </div>
            </form>
          )}

          {modalCriarEtapa === "perguntas" && (
            <>
              <QuestionEditor questions={novaPesquisa.perguntas || []} onAddQuestion={handleAddPergunta} onRemoveQuestion={handleRemovePergunta} onUpdateQuestion={handleUpdatePergunta} isEditable={canEdit} />
              <div className="flex gap-4 mt-6">
                <button type="button" className="w-1/2 py-2 rounded-lg bg-gray-500 text-white font-semibold" onClick={() => setModalCriarEtapa("info")} disabled={!canEdit}>Voltar</button>
                <button type="button" className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white font-semibold" onClick={salvarNovaPesquisa} disabled={!canEdit}>Salvar Pesquisa</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {modalEdicao && (
        <Modal title="Editar Pesquisa" onClose={() => setModalEdicao(null)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="titulo">Título</label>
              <input id="titulo" type="text" value={novaPesquisa.titulo || ""} onChange={(e) => handleUpdateNovaPesquisa("titulo", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="descricao">Descrição</label>
              <textarea id="descricao" rows={3} value={novaPesquisa.descricao || ""} onChange={(e) => handleUpdateNovaPesquisa("descricao", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="respostasEsperadas">Preenchimentos Esperados</label>
              <input id="respostasEsperadas" type="number" value={novaPesquisa.respostasEsperadas || ""}
                onChange={(e) => handleUpdateNovaPesquisa("respostasEsperadas", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="data">Prazo (data)</label>
              <input id="data" type="date" value={novaPesquisa.data || ""} onChange={(e) => handleUpdateNovaPesquisa("data", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" required disabled={!canEdit}
              />
            </div>
            <h4 className="font-semibold mt-6 mb-2 text-gray-800">Perguntas</h4>
            <QuestionEditor questions={novaPesquisa.perguntas || []} onAddQuestion={handleAddPergunta} onRemoveQuestion={handleRemovePergunta} onUpdateQuestion={handleUpdatePergunta} isEditable={canEdit} />
            <div className="flex gap-4 mt-6">
              <button type="button" className="w-1/2 py-2 rounded-lg bg-gray-500 text-white font-semibold" onClick={() => setModalEdicao(null)} disabled={!canEdit}>Cancelar</button>
              <button type="button" className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white font-semibold" onClick={salvarEdicao} disabled={!canEdit}>Salvar alterações</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PesquisaClima;