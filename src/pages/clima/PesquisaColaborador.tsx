import React, { useState, useEffect, useCallback } from "react";
import { FiX } from "react-icons/fi";
import SearchInput from "@/components/SearchInput";
import toast from "react-hot-toast";

interface PerguntaBackend {
  id: string;
  surveyId: string;
  text: string;
  type: "TEXT" | "NUMBER" | "YESORNO";
}

interface PesquisaBackend {
  id: string;
  cycleId: string;
  title: string;
  description: string;
  createdAt: string;
  endDate: string;
  active: boolean;
  questions: PerguntaBackend[];
}

interface RespostaEnvioBackend {
  surveyId: string;
  userId?: string;
  answers: {
    questionId: string;
    answerText?: string;
    answerScore?: number;
  }[];
}

interface RespostaUsuarioLocal {
  pesquisaId: string;
  respostas: Record<string, string | number>;
  dataEnvio: string;
}

const LOCAL_STORAGE_RESPOSTAS_KEY = "respostas_colaborador_salvas";
const API_BASE_URL = "http://localhost:3000";

const OPCOES_NUMERO = ["1", "2", "3", "4", "5"];
const OPCOES_YESORNO = ["Sim", "Não"];

const formatDateBR = (isoDate: string): string => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return "Data inválida";
  }
};

const getCurrentYearCycleId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const semester = month <= 5 ? 1 : 2;
  return `cycle${year}_${semester}`;
};

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
    {/* Scrollbar do modal principal: w-1.5 (fino) e emerald-700/75 (opacidade) */}
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto
                  [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-700/75 [&::-webkit-scrollbar-track]:bg-gray-200"
         onClick={(_e) => _e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" aria-label="Fechar modal"><FiX size={24} /></button>
      {/* Título do modal: garantindo quebra de linha */}
      <h3 className="text-xl font-semibold mb-6 text-gray-800 break-words" style={{wordWrap: "break-word"}}>{title}</h3>
      {children}
    </div>
  </div>
);

const fetchWithAuth = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody: { message?: string; error?: string } = await response.json().catch(() => ({ message: response.statusText }));
    let errorMessage = `Erro: ${response.status}`;
    if (errorBody && typeof errorBody.message === 'string') errorMessage = errorBody.message;
    else if (errorBody && typeof errorBody.error === 'string') errorMessage = errorBody.error;

    if (response.status === 401 || response.status === 403) toast.error("Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.");
    throw new Error(`Erro ${response.status}: ${errorMessage}`);
  }
  return response.json();
};

const postRespostasToBackend = async (data: RespostaEnvioBackend): Promise<{ message: string }> => {
  const url = `${API_BASE_URL}/survey/response`;
  return fetchWithAuth<{ message: string }>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
};

const PesquisaColaborador: React.FC = () => {
  const [pesquisas, setPesquisas] = useState<PesquisaBackend[]>([]);
  const [respostasSalvas, setRespostasSalvas] = useLocalStorage<RespostaUsuarioLocal[]>(LOCAL_STORAGE_RESPOSTAS_KEY, []);

  const [busca, setBusca] = useState("");
  const [modalResponder, setModalResponder] = useState<PesquisaBackend | null>(null);
  const [respostasAtuais, setRespostasAtuais] = useState<Record<string, string | number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYearCycleId, setCurrentYearCycleId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isPesquisaAtiva = useCallback((endDate: string): boolean => {
    const today = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return today <= end;
  }, []);

  const extractUserIdFromToken = useCallback((): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decodedPayload: { id?: string; sub?: string } = JSON.parse(atob(token.split('.')[1]));
      return decodedPayload.id || decodedPayload.sub || null;
    } catch { return null; }
  }, []);

  const loadPesquisas = useCallback(async () => {
    const cycleIdToFetch = getCurrentYearCycleId();
    setCurrentYearCycleId(cycleIdToFetch);

    setIsLoading(true); setError(null);
    try {
      const data = await fetchWithAuth<PesquisaBackend | PesquisaBackend[]>(`${API_BASE_URL}/survey/${cycleIdToFetch}/findNewestSurveys`);
      const fetchedPesquisas = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);
      const activePesquisas = fetchedPesquisas.filter(p => p.active === true && isPesquisaAtiva(p.endDate));
      setPesquisas(activePesquisas);
    } catch (err) {
      const msg = (err instanceof Error) ? err.message : "Erro desconhecido ao carregar pesquisas.";
      setError(`Falha ao carregar pesquisas: ${msg}`);
      toast.error(`Erro ao carregar pesquisas: ${msg}.`);
    } finally {
      setIsLoading(false);
    }
  }, [isPesquisaAtiva, fetchWithAuth]);

  useEffect(() => {
    setCurrentUserId(extractUserIdFromToken());
    loadPesquisas();
  }, [loadPesquisas, extractUserIdFromToken]);

  const pesquisasExibidas = pesquisas.filter((p) => {
    const buscaOk = busca.trim() === "" || p.title.toLowerCase().includes(busca.toLowerCase()) || p.description.toLowerCase().includes(busca.toLowerCase());
    return buscaOk;
  });

  const handleRespostaChange = (perguntaId: string, valor: string | number) => {
    setRespostasAtuais((old) => ({ ...old, [perguntaId]: valor }));
  };

  const enviarRespostas = async () => {
    if (!modalResponder) return;

    const perguntasNaoRespondidas = modalResponder.questions.filter((p) => !respostasAtuais[p.id]);
    if (perguntasNaoRespondidas.length > 0) { toast.error("Por favor, responda todas as perguntas antes de enviar."); return; }

    const answersFormattedForBackend = Object.entries(respostasAtuais).map(([questionId, answer]) => {
      const question = modalResponder.questions.find(q => q.id === questionId);
      return question?.type === "NUMBER" ? { questionId, answerScore: Number(answer) } : { questionId, answerText: String(answer) };
    });

    const payload: RespostaEnvioBackend = { surveyId: modalResponder.id, userId: currentUserId || undefined, answers: answersFormattedForBackend };

    toast((t) => (
      <div>
        <p>Você tem certeza que deseja enviar suas respostas? Não será possível editar depois.</p>
        <div className="flex justify-end mt-4">
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await postRespostasToBackend(payload);
              const novaRespostaLocal: RespostaUsuarioLocal = { pesquisaId: modalResponder.id, respostas: respostasAtuais, dataEnvio: new Date().toISOString() };
              setRespostasSalvas((prev) => {
                const existingIndex = prev.findIndex(r => r.pesquisaId === novaRespostaLocal.pesquisaId);
                if (existingIndex > -1) { const updated = [...prev]; updated[existingIndex] = novaRespostaLocal; return updated; }
                return [...prev, novaRespostaLocal];
              });
              toast.success("Respostas enviadas com sucesso! Obrigado pela participação.");
              setRespostasAtuais({});
              setModalResponder(null);
              loadPesquisas();
            } catch (err) {
              let errorMessage = "Erro desconhecido ao enviar respostas.";
              if (err instanceof Error) errorMessage = err.message;
              else if (typeof err === 'string') errorMessage = err;
              toast.error(`Falha ao enviar respostas: ${errorMessage}`);
            }
          }} className="bg-emerald-600 text-white px-4 py-2 rounded mr-2 hover:bg-emerald-700">Enviar</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    ), { duration: 0 });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
          <h1 className="text-2xl font-semibold text-gray-800">Pesquisas de Clima</h1>
        </div>

        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar pesquisas..." className="flex-grow min-w-0" />
        </div>

        <div className="px-4 md:px-8 py-6 max-w-[1700px] mx-auto w-full space-y-12">
          {isLoading && <p className="text-center text-gray-600">Carregando pesquisas para o ciclo {currentYearCycleId || 'atual'}...</p>}
          {!isLoading && error && <p className="text-center text-red-600">Erro: {error}</p>}

          {!isLoading && !error && pesquisasExibidas.length === 0 && (
            <p className="text-center text-gray-600">Nenhuma pesquisa ativa</p>
          )}

          {!isLoading && !error && pesquisasExibidas.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesquisas ativas</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pesquisasExibidas.map((p) => {
                  const hasResponded = respostasSalvas.some(r => r.pesquisaId === p.id);
                  return (
                    <div
                      key={p.id}
                      className={`border border-gray-200 rounded-lg p-4 bg-white shadow-sm ${hasResponded ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-emerald-600'}`}
                      onClick={() => {
                        if (hasResponded) {
                          toast("Você já enviou uma resposta para esta pesquisa.", {
                          icon: "✅"
                          });
                          return;
                        }
                        const existingResponse = respostasSalvas.find(r => r.pesquisaId === p.id);
                        setRespostasAtuais(existingResponse ? existingResponse.respostas : {});
                        setModalResponder(p);
                      }}
                      role="button"
                      tabIndex={hasResponded ? -1 : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !hasResponded) {
                          const existingResponse = respostasSalvas.find(r => r.pesquisaId === p.id);
                          setRespostasAtuais(existingResponse ? existingResponse.respostas : {});
                          setModalResponder(p);
                        }
                      }}
                      aria-label={hasResponded ? `Pesquisa ${p.title} (já respondida)` : `Responder pesquisa ${p.title}`}
                    >
                      {/* Limitação do título do card */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1 overflow-hidden text-ellipsis break-words" title={p.title}>{p.title}</h3>
                      {/* Limitação da descrição do card */}
                      <p className="text-gray-600 mb-2 text-sm line-clamp-2 overflow-hidden text-ellipsis break-words" title={p.description}>{p.description}</p>
                      <p className="text-sm text-gray-600 mb-3">Status: Em andamento</p>
                      <p className="text-sm text-gray-500">{`Prazo: ${formatDateBR(p.endDate)}`}</p>
                      {hasResponded && (
                        <p className="text-sm text-emerald-600 font-medium mt-2">
                          Resposta enviada
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {modalResponder && (
          <Modal
            title={modalResponder.title}
            onClose={() => { setModalResponder(null); setRespostasAtuais({}); }}
          >
            <div className="mb-6">
              {/* Scroll da descrição no modal: w-1.5 (fino) e emerald-700/75 (opacidade) */}
              <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4 max-h-28 overflow-y-auto
                            [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-700/75 [&::-webkit-scrollbar-track]:bg-gray-200">
                <p className="text-gray-700 break-words break-all">{modalResponder.description}</p>
              </div>
              <p className="text-sm text-gray-500">Prazo para responder: <strong>{formatDateBR(modalResponder.endDate)}</strong></p>
            </div>

            {modalResponder.questions.length === 0 && (<p className="text-sm text-gray-500">Sem perguntas cadastradas nesta pesquisa.</p>)}

            {/* Scroll para a lista de perguntas no modal: w-1.5 (fino) e emerald-700/75 (opacidade) */}
            <form onSubmit={(e) => { e.preventDefault(); enviarRespostas(); }} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2
                                                                                     [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-700/75 [&::-webkit-scrollbar-track]:bg-gray-200">
              {modalResponder.questions.map((p) => (
                <div key={p.id} className="border border-gray-300 rounded p-4 bg-white">
                  {/* Limitação para o título da pergunta no modal */}
                  <strong className="block mb-1 text-gray-800 line-clamp-2 overflow-hidden text-ellipsis break-words" title={p.text}>{p.text}</strong>

                  {p.type === "TEXT" && (
                    <textarea
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600
                                 resize-none h-28" // <-- Redimensionamento desativado e altura fixa (h-28)
                      value={respostasAtuais[p.id] || ""}
                      onChange={(e) => handleRespostaChange(p.id, e.target.value)}
                      placeholder="Digite sua resposta..."
                    />
                  )}

                  {p.type === "NUMBER" && (
                    <select
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      value={respostasAtuais[p.id] || ""}
                      onChange={(e) => handleRespostaChange(p.id, parseInt(e.target.value))}
                    >
                      <option value="" disabled>Selecione uma nota (1-5)</option>
                      {OPCOES_NUMERO.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  )}

                  {p.type === "YESORNO" && (
                    <select
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      value={respostasAtuais[p.id] || ""}
                      onChange={(e) => handleRespostaChange(p.id, e.target.value)}
                    >
                      <option value="" disabled>Seleccione</option>
                      {OPCOES_YESORNO.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setModalResponder(null); setRespostasAtuais({}); }} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white">
                  <span className="hidden phone:inline">Enviar</span>
                  <span className="inline phone:hidden">Enviar respostas</span>
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
};

export default PesquisaColaborador;