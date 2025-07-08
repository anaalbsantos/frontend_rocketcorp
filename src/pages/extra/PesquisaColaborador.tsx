import React, { useState, useEffect, useCallback } from "react";
import { FiX } from "react-icons/fi";
import SearchInput from "@/components/SearchInput"; // Mantenha este caminho ou ajuste conforme seu projeto
import toast, { Toaster } from "react-hot-toast";

// --- Novas/Atualizadas Interfaces ---
// A interface Pergunta precisa refletir o que o backend envia
interface PerguntaBackend {
  id: string;
  surveyId: string; // Adicionado, se o backend relacionar assim
  text: string; // Alterado de 'titulo' para 'text' para refletir o backend
  type: "TEXT" | "NUMBER" | "YESORNO"; // Adicionado para tipos de perguntas
  // descricao: string; // Removido, se não vier do backend ou não for usada
}

// A interface Pesquisa precisa refletir o que o backend envia
interface PesquisaBackend {
  id: string;
  title: string; // Alterado de 'titulo' para 'title'
  description: string; // Alterado de 'descricao' para 'description'
  createdAt: string; // Nova data de criação, se vier do backend
  endDate: string; // Alterado de 'data' para 'endDate' para ser mais claro
  questions: PerguntaBackend[]; // Alterado de 'perguntas' para 'questions'
  // status: "Em andamento" | "Finalizada"; // Este status será derivado da data, não vem diretamente do backend
}

// O que será enviado para o endpoint de respostas do backend
interface RespostaEnvioBackend {
  surveyId: string; // ID da pesquisa
  questionId: string; // ID da pergunta
  answer: string | number; // A resposta em si (pode ser texto ou número)
}

// O que será armazenado localmente para "respostas já feitas" (para visualização)
interface RespostaUsuarioLocal {
  pesquisaId: string;
  respostas: Record<string, string | number>; // { questionId: answer }
  dataEnvio: string; // ISO string
}

// --- Constantes ---
const LOCAL_STORAGE_RESPOSTAS_KEY = "respostas_colaborador_salvas"; // Renomeado para maior clareza
const API_BASE_URL = "http://localhost:3000"; // <<<< ATENÇÃO: Mude para a URL REAL da sua API

// Opções para diferentes tipos de perguntas
const OPCOES_NUMERO = ["1", "2", "3", "4", "5"]; // Para perguntas do tipo 'NUMBER'
const OPCOES_YESORNO = ["Sim", "Não"]; // Para perguntas do tipo 'YESORNO'

// --- Utilitários ---
const formatDateBR = (isoDate: string): string => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR");
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return "Data inválida";
  }
};

// --- Hook Personalizado para Local Storage (Para respostas já feitas) ---
// Mantido do meu exemplo anterior, é mais robusto para localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao escrever no localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// --- Componente Modal (Mantido como você o definiu) ---
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
      className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh]"
      style={{ overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#08605f #e2e8f0" }}
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

// --- Funções de API ---
// Função auxiliar para incluir o token JWT (adapte se você não usa autenticação)
const fetchWithAuth = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  // ATENÇÃO: Substitua 'seu_jwt_token_key' pela chave real do seu token no localStorage
  const token = localStorage.getItem('seu_jwt_token_key');
  const headers = new Headers(options?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    console.error(`Erro na requisição ${url}: ${response.status} ${response.statusText}`);
    if (response.status === 401 || response.status === 403) {
      toast.error("Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.");
    }
    const errorBody = await response.text().catch(() => response.statusText);
    let errorMessage = `Erro: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorBody || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Função para buscar pesquisas do backend no endpoint /survey
const fetchPesquisasFromBackend = async (): Promise<PesquisaBackend[]> => {
  const url = `${API_BASE_URL}/survey`; // Endpoint definido: GET http://localhost:3000/survey
  return fetchWithAuth<PesquisaBackend[]>(url);
};

// Função para enviar respostas para o backend
const postRespostasToBackend = async (answers: RespostaEnvioBackend[]): Promise<{ message: string }> => {
  // ATENÇÃO: Confirme este endpoint de POST com seu backend
  const url = `${API_BASE_URL}/answers`; // Exemplo: ou /submit-answers, ou /survey/:surveyId/answers
  return fetchWithAuth<{ message: string }>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(answers),
  });
};

// --- Componente Principal PesquisaColaborador ---
const PesquisaColaborador: React.FC = () => {
  const [pesquisas, setPesquisas] = useState<PesquisaBackend[]>([]);
  // Use o hook useLocalStorage para gerenciar respostas salvas no localStorage
  const [respostasSalvas, setRespostasSalvas] = useLocalStorage<RespostaUsuarioLocal[]>(LOCAL_STORAGE_RESPOSTAS_KEY, []);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Em andamento" | "Finalizada">("Todos");
  const [modalResponder, setModalResponder] = useState<PesquisaBackend | null>(null);
  const [modalVisualizar, setModalVisualizar] = useState<PesquisaBackend | null>(null);
  const [respostasAtuais, setRespostasAtuais] = useState<Record<string, string | number>>({}); // Respostas para o modal de resposta
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para determinar o status da pesquisa com base na data final
  const getPesquisaStatus = useCallback((endDate: string): "Em andamento" | "Finalizada" => {
    const today = new Date();
    // Ajuste a data final para o final do dia para que a pesquisa esteja "Em andamento" durante todo o dia da endDate
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set to end of the day

    return today <= end ? "Em andamento" : "Finalizada";
  }, []);

  // Efeito para carregar as pesquisas do backend
  useEffect(() => {
    const loadPesquisas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPesquisasFromBackend();
        setPesquisas(data);
      } catch (err: any) {
        console.error("Falha ao carregar pesquisas:", err);
        setError(`Falha ao carregar pesquisas: ${err.message || "Erro desconhecido"}`);
        toast.error(`Erro: ${err.message || "Não foi possível carregar as pesquisas."}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadPesquisas();
  }, []); // Executa apenas uma vez ao montar o componente

  // Filtragem e categorização das pesquisas (mantido o seu fluxo)
  const pesquisasFiltradas = pesquisas.filter((p) => {
    const status = getPesquisaStatus(p.endDate); // Usa a nova lógica de status
    const filtroOk = filtroStatus === "Todos" || status === filtroStatus;
    const buscaOk =
      busca.trim() === "" ||
      p.title.toLowerCase().includes(busca.toLowerCase()) ||
      p.description.toLowerCase().includes(busca.toLowerCase());
    return filtroOk && buscaOk;
  });

  const pesquisasAtivas = pesquisasFiltradas.filter((p) => getPesquisaStatus(p.endDate) === "Em andamento");
  const pesquisasFinalizadas = pesquisasFiltradas.filter((p) => getPesquisaStatus(p.endDate) === "Finalizada");

  const handleRespostaChange = (perguntaId: string, valor: string | number) => {
    setRespostasAtuais((old) => ({ ...old, [perguntaId]: valor }));
  };

  const enviarRespostas = async () => {
    if (!modalResponder) return;

    // Verifica se todas as perguntas obrigatórias foram respondidas
    const perguntasNaoRespondidas = modalResponder.questions.filter((p) => !respostasAtuais[p.id]);
    if (perguntasNaoRespondidas.length > 0) {
      toast.error("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    // Mapeia as respostas para o formato que o backend espera
    const respostasParaEnvio: RespostaEnvioBackend[] = Object.entries(respostasAtuais).map(([questionId, answer]) => ({
      surveyId: modalResponder.id,
      questionId: questionId,
      answer: answer,
    }));

    toast(
      (t) => (
        <div>
          <p>Você tem certeza que deseja enviar suas respostas? Não será possível editar depois.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  // Envia as respostas para o backend
                  await postRespostasToBackend(respostasParaEnvio);
                  
                  // Salva no localStorage para visualização futura
                  const novaRespostaLocal: RespostaUsuarioLocal = {
                    pesquisaId: modalResponder.id,
                    respostas: respostasAtuais,
                    dataEnvio: new Date().toISOString(),
                  };
                  setRespostasSalvas((prev) => {
                    // Atualiza a resposta existente ou adiciona uma nova
                    const existingIndex = prev.findIndex(r => r.pesquisaId === novaRespostaLocal.pesquisaId);
                    if (existingIndex > -1) {
                        const updated = [...prev];
                        updated[existingIndex] = novaRespostaLocal;
                        return updated;
                    }
                    return [...prev, novaRespostaLocal];
                  });

                  toast.success("Respostas enviadas com sucesso! Obrigado pela participação.");
                  setRespostasAtuais({}); // Limpa as respostas do formulário
                  setModalResponder(null); // Fecha o modal
                } catch (err: any) {
                  console.error("Erro ao enviar respostas:", err);
                  toast.error(`Falha ao enviar respostas: ${err.message || "Erro desconhecido"}`);
                }
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded mr-2"
            >
              Enviar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        duration: 0,
      }
    );
  };

  const respostasUsuarioParaVisualizar = modalVisualizar
    ? respostasSalvas.find((r) => r.pesquisaId === modalVisualizar.id)?.respostas
    : null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
          <h1 className="text-2xl font-semibold text-gray-800">Pesquisas de Clima</h1>
        </div>

        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar pesquisas..."
            filterOptions={["Todos", "Em andamento", "Finalizada"]}
            initialFilter="Todos"
            onFilterChange={(f) => setFiltroStatus(f as "Todos" | "Em andamento" | "Finalizada")}
            className="flex-grow min-w-0"
          />
        </div>

        <div className="px-4 md:px-8 py-6 max-w-[1700px] mx-auto w-full space-y-12">
          {isLoading && <p className="text-center text-gray-600">Carregando pesquisas...</p>}
          {error && <p className="text-center text-red-600">Erro: {error}</p>}

          {!isLoading && !error && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesquisas Ativas</h2>
                {pesquisasAtivas.length === 0 ? (
                  <p className="text-gray-600">Nenhuma pesquisa ativa encontrada.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pesquisasAtivas.map((p) => (
                      <div
                        key={p.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-600"
                        onClick={() => {
                            // Ao abrir o modal para responder, carrega respostas existentes, se houver
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
                        <p className="text-sm text-gray-600 mb-3">Status: {getPesquisaStatus(p.endDate)}</p>
                        <p className="text-sm text-gray-500">{`Prazo: ${formatDateBR(p.endDate)}`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesquisas Finalizadas</h2>
                {pesquisasFinalizadas.length === 0 ? (
                  <p className="text-gray-600">Nenhuma pesquisa finalizada encontrada.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pesquisasFinalizadas.map((p) => (
                      <div
                        key={p.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-600"
                        onClick={() => setModalVisualizar(p)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setModalVisualizar(p);
                        }}
                        aria-label={`Visualizar respostas da pesquisa ${p.title}`}
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.title}</h3>
                        <p className="text-gray-600 mb-2 text-sm">{p.description}</p>
                        <p className="text-sm text-gray-600 mb-3">Status: {getPesquisaStatus(p.endDate)}</p>
                        <p className="text-sm text-gray-500">{`Prazo: ${formatDateBR(p.endDate)}`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {modalResponder && (
          <Modal
            title={modalResponder.title} // Usando 'title' do backend
            onClose={() => {
              setModalResponder(null);
              setRespostasAtuais({}); // Limpa as respostas ao fechar o modal
            }}
          >
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{modalResponder.description}</p> {/* Usando 'description' do backend */}
              <p className="text-sm text-gray-500">
                Prazo para responder: <strong>{formatDateBR(modalResponder.endDate)}</strong> {/* Usando 'endDate' do backend */}
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
              {modalResponder.questions.map((p) => ( // Usando 'questions' do backend
                <div key={p.id} className="border border-gray-300 rounded p-4 bg-white">
                  <strong className="block mb-1 text-gray-800">{p.text}</strong> {/* Usando 'text' da pergunta */}

                  {/* Renderização condicional do input baseado no tipo da pergunta */}
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
                  {/* Se houver outros tipos, adicione mais 'else if' ou um componente mapeado por tipo */}
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

        {modalVisualizar && (
          <Modal title={modalVisualizar.title} onClose={() => setModalVisualizar(null)}> {/* Usando 'title' */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{modalVisualizar.description}</p> {/* Usando 'description' */}
              <p className="text-sm text-gray-500">
                Prazo da pesquisa: <strong>{formatDateBR(modalVisualizar.endDate)}</strong> {/* Usando 'endDate' */}
              </p>
            </div>

            {modalVisualizar.questions.length === 0 && ( // Usando 'questions'
              <p className="text-sm text-gray-500">Sem perguntas cadastradas nesta pesquisa.</p>
            )}

            {respostasUsuarioParaVisualizar ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {modalVisualizar.questions.map((p) => ( // Usando 'questions'
                  <div key={p.id} className="border border-gray-300 rounded p-4 bg-white">
                    <strong className="block mb-1 text-gray-800">{p.text}</strong> {/* Usando 'text' */}
                    <p className="text-gray-700">
                      Resposta: <strong>{respostasUsuarioParaVisualizar[p.id] || "Não respondida"}</strong>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Você não respondeu esta pesquisa.</p>
            )}
          </Modal>
        )}
      </div>
    </>
  );
};

export default PesquisaColaborador;