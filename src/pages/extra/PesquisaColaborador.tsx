import React, { useState, useEffect, useCallback } from "react";
import { FiX } from "react-icons/fi";
import SearchInput from "@/components/SearchInput";
import toast from "react-hot-toast";

// --- Interfaces (Sem Alterações) ---
interface PerguntaBackend {
  id: string;
  surveyId: string;
  text: string;
  type: "TEXT" | "NUMBER" | "YESORNO";
}

interface PesquisaBackend {
  id: string;
  cycleId: string; // Mantido para clareza, mas não usado para filtro de requisição
  title: string;
  description: string;
  createdAt: string;
  endDate: string;
  active: boolean; // Campo 'active'
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

// --- Constantes (Sem Alterações) ---
const LOCAL_STORAGE_RESPOSTAS_KEY = "respostas_colaborador_salvas";
const API_BASE_URL = "http://localhost:3000";

const OPCOES_NUMERO = ["1", "2", "3", "4", "5"];
const OPCOES_YESORNO = ["Sim", "Não"];

// --- Funções Auxiliares (Sem Alterações) ---
const formatDateBR = (isoDate: string): string => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR", { timeZone: 'America/Sao_Paulo' });
  } catch (e: unknown) {
    console.error("Erro ao formatar data:", e);
    return "Data inválida";
  }
};

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error: unknown) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error: unknown) {
      console.error(`Erro ao escrever no localStorage key "${key}":`, error);
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
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
    aria-modal="true"
    role="dialog"
  >
    <div
      className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-700 [&::-webkit-scrollbar-track]:bg-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        aria-label="Fechar modal"
      >
        <FiX size={24} />
      </button>
      <h3 className="text-xl font-semibold mb-6 text-gray-800">{title}</h3>
      {children}
    </div>
  </div>
);

// --- Funções de Fetch com Autenticação (Sem Alterações) ---
const fetchWithAuth = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => response.statusText);
    let errorMessage = `Erro: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (parseError: unknown) {
      errorMessage = errorBody || errorMessage;
    }
    if (response.status === 401 || response.status === 403) {
      toast.error("Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.");
    }
    let finalError: Error;
    if (errorMessage.includes("Erro: ")) {
      finalError = new Error(errorMessage);
    } else {
      finalError = new Error(`Erro ${response.status}: ${errorMessage}`);
    }
    throw finalError;
  }
  return response.json();
};

// **MODIFICADA:** Agora busca TODAS as pesquisas ativas, sem filtro de cycleId
const fetchAllActivePesquisasFromBackend = async (): Promise<PesquisaBackend[]> => {
  // ATENÇÃO: Este endpoint '/survey/all-active' é uma SUGESTÃO.
  // Você precisará CONFIRMAR com seu backend qual endpoint retorna
  // um ARRAY de TODAS as pesquisas ativas (active: true), sem filtros por cycleId.
  const url = `${API_BASE_URL}/survey/all-active`; 
  
  try {
    // Esperamos um array de PesquisaBackend deste endpoint
    const data = await fetchWithAuth<PesquisaBackend[]>(url);
    // Filtrar no frontend para garantir que apenas as que têm 'active: true'
    // e data de término válida sejam exibidas.
    const now = new Date();
    const filteredData = data.filter(p => {
      const endDate = new Date(p.endDate);
      endDate.setHours(23, 59, 59, 999); // Ajusta para o final do dia
      return p.active === true && now <= endDate;
    });
    return filteredData;
  } catch (error: unknown) {
    let errorMessage = "Erro desconhecido ao buscar pesquisas ativas.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error("Erro ao buscar todas as pesquisas ativas:", error);
    // Se for 404 (Not Found), podemos considerar que não há pesquisas.
    if (errorMessage.includes('404')) {
      return [];
    }
    throw new Error(`Falha ao buscar pesquisas: ${errorMessage}`);
  }
};

const postRespostasToBackend = async (data: RespostaEnvioBackend): Promise<{ message: string }> => {
  const url = `${API_BASE_URL}/survey/response`;
  return fetchWithAuth<{ message: string }>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

// --- Componente PesquisaColaborador ---
const PesquisaColaborador: React.FC = () => {
  const [pesquisas, setPesquisas] = useState<PesquisaBackend[]>([]);
  const [respostasSalvas, setRespostasSalvas] = useLocalStorage<RespostaUsuarioLocal[]>(LOCAL_STORAGE_RESPOSTAS_KEY, []);

  const [busca, setBusca] = useState("");
  const [modalResponder, setModalResponder] = useState<PesquisaBackend | null>(null);
  const [respostasAtuais, setRespostasAtuais] = useState<Record<string, string | number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A função isPesquisaAtiva agora é apenas para validação de data,
  // já que o filtro 'active' é feito na requisição do backend e no filtro inicial.
  // Mantida para clareza, mas seu uso principal será dentro de fetchAllActivePesquisasFromBackend
  // ou em alguma lógica de UI se necessário.
  const isPesquisaAtivaPorData = useCallback((endDate: string): boolean => {
    const today = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return today <= end;
  }, []);

  // O useEffect agora chama a nova função para buscar TODAS as ativas
  useEffect(() => {
    const loadPesquisas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Chamada AGORA para o novo endpoint que traz TODAS as ativas
        const data = await fetchAllActivePesquisasFromBackend();
        setPesquisas(data); // `data` já virá filtrada e com `active: true`
      } catch (err: unknown) {
        let errorMessage = "Erro desconhecido ao carregar pesquisas.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        setError(`Falha ao carregar pesquisas: ${errorMessage}`);
        toast.error(`Erro ao carregar pesquisas: ${errorMessage}.`);
      } finally {
        setIsLoading(false);
      }
    };
    loadPesquisas();
  }, [/* isPesquisaAtivaPorData */]); // A dependência de isPesquisaAtivaPorData não é mais estritamente necessária aqui, pois o filtro já ocorre dentro de fetchAllActivePesquisasFromBackend.

  const pesquisasExibidas = pesquisas.filter((p) => {
    const buscaOk =
      busca.trim() === "" ||
      p.title.toLowerCase().includes(busca.toLowerCase()) ||
      p.description.toLowerCase().includes(busca.toLowerCase());
    return buscaOk;
  });
  
  const handleRespostaChange = (perguntaId: string, valor: string | number) => {
    setRespostasAtuais((old) => ({ ...old, [perguntaId]: valor }));
  };

  const enviarRespostas = async () => {
    if (!modalResponder) return;

    const perguntasNaoRespondidas = modalResponder.questions.filter((p) => !respostasAtuais[p.id]);
    if (perguntasNaoRespondidas.length > 0) {
      toast.error("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    const answersFormattedForBackend = Object.entries(respostasAtuais).map(([questionId, answer]) => {
      const question = modalResponder.questions.find(q => q.id === questionId);
      if (question?.type === "NUMBER") {
        return { questionId, answerScore: Number(answer) };
      }
      return { questionId, answerText: String(answer) };
    });

    // O userCycleId pode ser obtido do token JWT aqui se precisar enviar junto com a resposta
    let userCycleId: string | undefined;
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            if (decodedPayload && typeof decodedPayload.cycleId === 'string') {
                userCycleId = decodedPayload.cycleId;
            }
        } catch (e: unknown) {
            console.error("Erro ao decodificar token JWT para cycleId no envio de respostas:", e);
        }
    }

    const payload: RespostaEnvioBackend = {
      surveyId: modalResponder.id,
      userId: userCycleId, // Exemplo de como você enviaria o cycleId do usuário (ou outro ID do usuário)
      answers: answersFormattedForBackend
    };

    toast(
      (t) => (
        <div>
          <p>Você tem certeza que deseja enviar suas respostas? Não será possível editar depois.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await postRespostasToBackend(payload);

                  const novaRespostaLocal: RespostaUsuarioLocal = {
                    pesquisaId: modalResponder.id,
                    respostas: respostasAtuais,
                    dataEnvio: new Date().toISOString(),
                  };
                  setRespostasSalvas((prev) => {
                    const existingIndex = prev.findIndex(r => r.pesquisaId === novaRespostaLocal.pesquisaId);
                    if (existingIndex > -1) {
                      const updated = [...prev];
                      updated[existingIndex] = novaRespostaLocal;
                      return updated;
                    }
                    return [...prev, novaRespostaLocal];
                  });

                  toast.success("Respostas enviadas com sucesso! Obrigado pela participação.");
                  setRespostasAtuais({});
                  setModalResponder(null);
                  // Opcional: Recarregar as pesquisas para que a respondida desapareça,
                  // se o backend tiver a lógica de "não mostrar pesquisa já respondida".
                  loadPesquisas(); 
                } catch (err: unknown) {
                  let errorMessage = "Erro desconhecido ao enviar respostas.";
                  if (err instanceof Error) {
                    errorMessage = err.message;
                  } else if (typeof err === 'string') {
                    errorMessage = err;
                  }
                  console.error("Erro ao enviar respostas:", err);
                  toast.error(`Falha ao enviar respostas: ${errorMessage}`);
                }
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded mr-2 hover:bg-emerald-700"
            >
              Enviar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { duration: 0 }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
          <h1 className="text-2xl font-semibold text-gray-800">Pesquisas de Clima</h1>
        </div>

        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar pesquisas..."
            className="flex-grow min-w-0"
          />
        </div>

        <div className="px-4 md:px-8 py-6 max-w-[1700px] mx-auto w-full space-y-12">
          {isLoading && <p className="text-center text-gray-600">Carregando pesquisas...</p>}
          {error && <p className="text-center text-red-600">Erro: {error}</p>}
          
          {!isLoading && !error && pesquisasExibidas.length === 0 && (
              <p className="text-center text-gray-600">
                Nenhuma pesquisa ativa encontrada no momento.
              </p>
          )}

          {!isLoading && !error && pesquisasExibidas.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesquisas Disponíveis</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pesquisasExibidas.map((p) => (
                  <div
                    key={p.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-600"
                    onClick={() => {
                      const existingResponse = respostasSalvas.find(r => r.pesquisaId === p.id);
                      setRespostasAtuais(existingResponse ? existingResponse.respostas : {});
                      setModalResponder(p);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const existingResponse = respostasSalvas.find(r => r.pesquisaId === p.id);
                        setRespostasAtuais(existingResponse ? existingResponse.respostas : {});
                        setModalResponder(p);
                      }
                    }}
                    aria-label={`Responder pesquisa ${p.title}`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.title}</h3>
                    <p className="text-gray-600 mb-2 text-sm">{p.description}</p>
                    <p className="text-sm text-gray-600 mb-3">Status: Em andamento</p> 
                    <p className="text-sm text-gray-500">{`Prazo: ${formatDateBR(p.endDate)}`}</p>
                    {/* Opcional: Mostrar o cycleId para depuração, se necessário */}
                    {/* <p className="text-xs text-gray-400">Ciclo: {p.cycleId}</p> */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {modalResponder && (
          <Modal
            title={modalResponder.title}
            onClose={() => {
              setModalResponder(null);
              setRespostasAtuais({});
            }}
          >
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{modalResponder.description}</p>
              <p className="text-sm text-gray-500">
                Prazo para responder: <strong>{formatDateBR(modalResponder.endDate)}</strong>
              </p>
            </div>

            {modalResponder.questions.length === 0 && (
              <p className="text-sm text-gray-500">Sem perguntas cadastradas nesta pesquisa.</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviarRespostas();
              }}
              className="space-y-6 max-h-[60vh] overflow-y-auto pr-2"
            >
              {modalResponder.questions.map((p) => (
                <div key={p.id} className="border border-gray-300 rounded p-4 bg-white">
                  <strong className="block mb-1 text-gray-800">{p.text}</strong>

                  {p.type === "TEXT" && (
                    <textarea
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      value={respostasAtuais[p.id] || ""}
                      onChange={(e) => handleRespostaChange(p.id, e.target.value)}
                      rows={3}
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
                      <option value="" disabled>
                        Selecione uma nota (1-5)
                      </option>
                      {OPCOES_NUMERO.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {p.type === "YESORNO" && (
                    <select
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      value={respostasAtuais[p.id] || ""}
                      onChange={(e) => handleRespostaChange(p.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {OPCOES_YESORNO.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalResponder(null);
                    setRespostasAtuais({});
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                >
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