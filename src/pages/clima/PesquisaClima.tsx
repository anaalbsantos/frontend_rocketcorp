import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlusCircle,
  FiX,
  FiTrash2,
  FiCpu,
  FiPlayCircle,
  FiEdit,
} from "react-icons/fi";
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
  active: boolean;
}

interface SurveyInsight {
  surveyTitle: string;
  resumo: string;
}

interface RawBackendSurvey {
  id: string;
  cycleId?: string;
  title: string;
  description: string;
  createdAt: string;
  endDate: string;
  active: boolean;
  questions: RawBackendQuestion[];
}

interface RawBackendQuestion {
  id: string;
  text: string;
  type: "TEXT" | "NUMBER" | "YESORNO";
  surveyId?: string;
}

interface CreateUpdateSurveyPayload {
  cycleId: string;
  title: string;
  description: string;
  endDate: string;
  active: boolean;
  questions: Array<{ text: string; type: "TEXT" | "NUMBER" | "YESORNO" }>;
}

const BASE_URL = "http://localhost:3000";

const formatDateBR = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return isNaN(date.getTime())
      ? "Data inválida"
      : date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return "Data inválida";
  }
};

const gerarCycleId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const semester = month <= 5 ? 1 : 2;
  return `cycle${year}_${semester}`;
};

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100] p-4"
    onClick={onClose}
    aria-modal="true"
    role="dialog"
  >
    <div
      // Aumentado max-w-4xl (aproximadamente 56rem ou 896px) para dar mais espaço
      // Adicionado overflow-hidden para o título do modal caso seja muito longo
      className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-white"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        aria-label="Fechar modal"
      >
        <FiX size={24} />
      </button>
      {/* Adicionado break-words ao título do modal */}
      <h3 className="text-xl font-semibold mb-6 text-gray-800 break-words">{title}</h3>
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

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  onUpdateQuestion,
  onRemoveQuestion,
  onAddQuestion,
  isEditable,
}) => (
  <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-white">
    {questions.length === 0 && isEditable && (
      <p className="text-gray-500 text-center py-4">
        Clique em "Adicionar pergunta" para começar.
      </p>
    )}
    {questions.map((q, i) => (
      <div
        key={q.id}
        className="border border-gray-300 rounded p-4 relative bg-white"
      >
        {isEditable && (
          <button
            type="button"
            onClick={() => onRemoveQuestion(q.id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            aria-label={`Remover pergunta ${i + 1}`}
          >
            <FiTrash2 />
          </button>
        )}
        <div className="mb-2">
          <label
            htmlFor={`pergunta-titulo-${q.id}`}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Pergunta {i + 1} - Título
          </label>
          <input
            id={`pergunta-titulo-${q.id}`}
            type="text"
            value={q.titulo}
            onChange={(e) => onUpdateQuestion(q.id, "titulo", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            disabled={!isEditable}
            maxLength={200}
          />
        </div>
        <div className="mb-2">
          <label
            htmlFor={`pergunta-tipo-${q.id}`}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Tipo de Resposta
          </label>
          <select
            id={`pergunta-tipo-${q.id}`}
            value={q.tipoResposta}
            onChange={(e) =>
              onUpdateQuestion(
                q.id,
                "tipoResposta",
                e.target.value as "TEXT" | "NUMBER" | "YESORNO"
              )
            }
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            disabled={!isEditable}
          >
            <option value="TEXT">Texto</option>
            <option value="YESORNO">Sim ou Não</option>
            <option value="NUMBER">Escala (Número)</option>
          </select>
        </div>
      </div>
    ))}
    {isEditable && (
      <button
        type="button"
        onClick={onAddQuestion}
        className="flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-800 font-semibold"
      >
        <FiPlusCircle /> Adicionar pergunta
      </button>
    )}
  </div>
);

interface MessageModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

const MessageModal: React.FC<MessageModalProps> = ({
  title,
  message,
  onClose,
  onConfirm,
  showConfirmButton = false,
}) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100] p-4"
    onClick={onClose}
    aria-modal="true"
    role="dialog"
  >
    <div
      className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        aria-label="Fechar mensagem"
      >
        <FiX size={24} />
      </button>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Fechar
        </button>
        {showConfirmButton && onConfirm && (
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  </div>
);

type UserRole = "rh" | "gestor" | "colaborador" | "comite";
interface PesquisaClimaProps {
  role: UserRole | null;
}

const PesquisaClima: React.FC<PesquisaClimaProps> = ({ role }) => {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [modalDashboard, setModalDashboard] = useState<Pesquisa | null>(null);
  const [modalFormOpen, setModalFormOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPesquisa, setCurrentPesquisa] = useState<Partial<Pesquisa>>({
    title: "",
    description: "",
    endDate: "",
    questions: [],
    status: "Programada",
    cycleId: gerarCycleId(),
    createdAt: new Date().toISOString(),
    active: false,
  });
  const [formStep, setFormStep] = useState<"info" | "perguntas">("info");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | PesquisaStatus>(
    "Todos"
  );
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyInsight, setSurveyInsight] = useState<SurveyInsight | null>(
    null
  );
  const [messageModal, setMessageModal] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
    showConfirmButton?: boolean;
  } | null>(null);

  const canManage = role === "rh";

  const fetchWithAuth = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Token não encontrado. Faça login novamente.");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      };
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData: unknown = await response.json();
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData &&
          typeof (errorData as { message: string }).message === "string"
        ) {
          throw new Error((errorData as { message: string }).message);
        }
        throw new Error("Erro na requisição.");
      }
      return response;
    },
    []
  );

  const fetchPesquisas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${BASE_URL}/survey`);
      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Dados de pesquisa inválidos recebidos do servidor.");
      }

      const formattedData: Pesquisa[] = (data as RawBackendSurvey[]).map(
        (item: RawBackendSurvey) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDate = new Date(item.endDate);
          endDate.setHours(23, 59, 59, 999);

          let status: PesquisaStatus;
          if (endDate < today) {
            status = "Finalizada";
          } else if (item.active) {
            status = "Em andamento";
          } else {
            status = "Programada";
          }

          return {
            id: item.id,
            cycleId: item.cycleId,
            title: item.title,
            description: item.description,
            createdAt: item.createdAt,
            endDate: item.endDate,
            questions: item.questions.map((q: RawBackendQuestion) => ({
              id: q.id,
              titulo: q.text,
              tipoResposta: q.type,
            })),
            status: status,
            active: item.active,
          };
        }
      );

      setPesquisas(
        formattedData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar pesquisas."
      );
      console.error("Erro ao buscar pesquisas:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchPesquisas();
  }, [fetchPesquisas]);

  const fetchSurveyInsight = useCallback(
    async (surveyId: string) => {
      setSurveyInsight(null);
      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/genai/generate-insight/${surveyId}`
        );
        const data: unknown = await response.json();
        if (
          typeof data === "object" &&
          data !== null &&
          "surveyTitle" in data &&
          "resumo" in data
        ) {
          setSurveyInsight(data as SurveyInsight);
        } else {
          throw new Error("Formato de insight de pesquisa inválido.");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Falha ao carregar insights da pesquisa."
        );
        console.error("Erro ao buscar insights:", err);
      }
    },
    [fetchWithAuth]
  );

  const mensagemPrazo = useCallback(
    (isoDate: string, status: PesquisaStatus) => {
      if (!isoDate) return "Data não disponível";
      if (status === "Finalizada") return "Pesquisa encerrada";
      return `Encerramento em ${formatDateBR(isoDate)}`;
    },
    []
  );

  const handleUpdateCurrentPesquisa = useCallback(
    <K extends keyof Partial<Pesquisa>>(
      field: K,
      value: Partial<Pesquisa>[K]
    ) => {
      setCurrentPesquisa((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleUpdatePergunta = useCallback(
    (id: string, field: keyof Pergunta, value: string) =>
      setCurrentPesquisa((prev) => ({
        ...prev,
        questions: (prev.questions || []).map((q) =>
          q.id === id ? { ...q, [field]: value } : q
        ),
      })),
    []
  );

  const handleRemovePergunta = useCallback(
    (id: string) =>
      setCurrentPesquisa((prev) => ({
        ...prev,
        questions: (prev.questions || []).filter((q) => q.id !== id),
      })),
    []
  );

  const handleAddPergunta = useCallback(() => {
    const newId = String(Date.now()) + Math.random();
    setCurrentPesquisa((prev) => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        { id: newId, titulo: "", tipoResposta: "TEXT" },
      ],
    }));
  }, []);

  const openCreateModal = useCallback(() => {
    if (!canManage) return;
    setCurrentPesquisa({
      title: "",
      description: "",
      endDate: "",
      questions: [],
      status: "Programada",
      cycleId: gerarCycleId(),
      createdAt: new Date().toISOString(),
      active: false,
    });
    setIsEditing(false);
    setFormStep("info");
    setModalFormOpen(true);
  }, [canManage]);

  const openEditModal = useCallback(
    (p: Pesquisa) => {
      if (!canManage || p.active) {
        setMessageModal({
          title: "Atenção",
          message: "Pesquisas ativas não podem ser editadas.",
        });
        return;
      }
      setCurrentPesquisa({
        id: p.id,
        title: p.title,
        description: p.description,
        endDate: p.endDate,
        questions: p.questions,
        status: p.status,
        cycleId: p.cycleId,
        createdAt: p.createdAt,
        active: p.active,
      });
      setIsEditing(true);
      setFormStep("info");
      setModalFormOpen(true);
    },
    [canManage]
  );

  const handleFormSubmit = useCallback(async () => {
    if (!canManage) return;
    if (!currentPesquisa.title || !currentPesquisa.endDate) {
      setMessageModal({
        title: "Erro de Validação",
        message: "Título e data final são obrigatórios.",
      });
      return;
    }
    if ((currentPesquisa.questions || []).length === 0) {
      setMessageModal({
        title: "Erro de Validação",
        message: "Adicione pelo menos uma pergunta à pesquisa.",
      });
      return;
    }
    if ((currentPesquisa.questions || []).some((q) => !q.titulo.trim())) {
      setMessageModal({
        title: "Erro de Validação",
        message: "Todas as perguntas devem ter um título.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: CreateUpdateSurveyPayload = {
        cycleId: currentPesquisa.cycleId || gerarCycleId(),
        title: currentPesquisa.title,
        description: currentPesquisa.description || "",
        endDate: new Date(
          currentPesquisa.endDate + "T23:59:59.000Z"
        ).toISOString(),
        active: currentPesquisa.active || false,
        questions: (currentPesquisa.questions || []).map((q) => ({
          text: q.titulo,
          type: q.tipoResposta,
        })),
      };

      if (isEditing && currentPesquisa.id) {
        await fetchWithAuth(`${BASE_URL}/survey/${currentPesquisa.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessageModal({
          title: "Sucesso",
          message: "Pesquisa editada com sucesso!",
        });
      } else {
        await fetchWithAuth(`${BASE_URL}/survey`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessageModal({
          title: "Sucesso",
          message: "Pesquisa criada com sucesso!",
        });
      }
      setModalFormOpen(false);
      fetchPesquisas();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Falha ao salvar pesquisa."
      );
      setMessageModal({
        title: "Erro",
        message: `Erro ao salvar pesquisa: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPesquisa, isEditing, canManage, fetchWithAuth, fetchPesquisas]);

  const excluirPesquisa = useCallback(
    async (id: string) => {
      if (!canManage) return;
      const pesquisa = pesquisas.find((p) => p.id === id);
      if (!pesquisa) {
        setMessageModal({ title: "Erro", message: "Pesquisa não encontrada." });
        return;
      }
      if (pesquisa.active) {
        setMessageModal({
          title: "Atenção",
          message: "Pesquisas ativas não podem ser excluídas.",
        });
        return;
      }

      setMessageModal({
        title: "Confirmação",
        message: `Tem certeza que deseja excluir a pesquisa?`,
        showConfirmButton: true,
        onConfirm: async () => {
          setMessageModal(null);
          setLoading(true);
          setError(null);
          try {
            await fetchWithAuth(`${BASE_URL}/survey/${id}`, {
              method: "DELETE",
            });
            setMessageModal({
              title: "Sucesso",
              message: `Pesquisa excluída com sucesso!`,
            });
            fetchPesquisas();
            if (modalFormOpen && currentPesquisa.id === id)
              setModalFormOpen(false);
          } catch (err: unknown) {
            setError(
              err instanceof Error ? err.message : "Falha ao excluir pesquisa."
            );
            setMessageModal({
              title: "Erro",
              message: `Erro ao excluir pesquisa: ${
                err instanceof Error ? err.message : "Erro desconhecido"
              }`,
            });
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [
      pesquisas,
      modalFormOpen,
      currentPesquisa,
      canManage,
      fetchWithAuth,
      fetchPesquisas,
    ]
  );

  const ativarPesquisa = useCallback(
    async (id: string) => {
      if (!canManage) return;
      const pesquisa = pesquisas.find((p) => p.id === id);
      if (!pesquisa) {
        setMessageModal({ title: "Erro", message: "Pesquisa não encontrada." });
        return;
      }
      if (pesquisa.active) {
        setMessageModal({
          title: "Atenção",
          message: "Esta pesquisa já está ativa.",
        });
        return;
      }
      if (new Date(pesquisa.endDate) < new Date()) {
        setMessageModal({
          title: "Atenção",
          message:
            "Não é possível ativar uma pesquisa cuja data final já passou.",
        });
        return;
      }

      setMessageModal({
        title: "Confirmação",
        message: `Tem certeza que deseja INICIAR a pesquisa? Após iniciada, ela não poderá ser editada ou excluída.`,
        showConfirmButton: true,
        onConfirm: async () => {
          setMessageModal(null);
          setLoading(true);
          setError(null);
          try {
            await fetchWithAuth(`${BASE_URL}/survey/${id}/setActive`, {
              method: "POST",
            });
            setMessageModal({
              title: "Sucesso",
              message: `Pesquisa iniciada com sucesso!`,
            });
            fetchPesquisas();
          } catch (err: unknown) {
            setError(
              err instanceof Error ? err.message : "Falha ao iniciar pesquisa."
            );
            setMessageModal({
              title: "Erro",
              message: `Erro ao iniciar pesquisa: ${
                err instanceof Error ? err.message : "Erro desconhecido"
              }`,
            });
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [canManage, fetchWithAuth, fetchPesquisas, pesquisas]
  );

  const filteredPesquisas = pesquisas.filter((p) => {
    const matchesStatus = filtroStatus === "Todos" || p.status === filtroStatus;
    const matchesSearch =
      busca.trim() === "" ||
      p.title.toLowerCase().includes(busca.toLowerCase()) ||
      p.description.toLowerCase().includes(busca.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
        <h1 className="text-2xl font-semibold text-gray-800">
          Pesquisa de Clima
        </h1>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 max-w-[1700px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar pesquisas..."
          filterOptions={["Todos", "Programada", "Em andamento", "Finalizada"]}
          initialFilter="Todos"
          onFilterChange={(f) => setFiltroStatus(f as "Todos" | PesquisaStatus)}
          className="flex-grow min-w-0"
        />
      </div>

      <div className="px-4 md:px-8 py-6 max-w-[1700px] mx-auto w-full">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Minhas pesquisas
              </h2>
              {canManage && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded phone:px-2 phone:py-0.5"
                >
                  <span className="phone:hidden flex items-center gap-2">
                    <FiPlusCircle /> Nova pesquisa
                  </span>
                  <span className="hidden phone:inline text-lg font-bold">
                    +
                  </span>
                </button>
              )}
            </div>

            {loading && (
              <p className="text-gray-600">Carregando pesquisas...</p>
            )}
            {error && <p className="text-red-500">Erro: {error}</p>}
            {!loading && !error && filteredPesquisas.length === 0 && (
              <p className="text-gray-500">Nenhuma pesquisa encontrada.</p>
            )}

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl1600:grid-cols-3">
              {!loading &&
                !error &&
                filteredPesquisas.map((p) => {
                  const canEditOrDelete =
                    !p.active && p.status === "Programada";
                  const canActivate =
                    !p.active &&
                    p.status === "Programada" &&
                    new Date(p.endDate) >= new Date();

                  return (
                    <div
                      key={p.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm relative cursor-pointer hover:ring-2 hover:ring-emerald-600"
                    >
                      <div
                        onClick={() => {
                          setModalDashboard(p);
                          if (p.status === "Finalizada")
                            fetchSurveyInsight(p.id);
                          else setSurveyInsight(null);
                        }}
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1 overflow-hidden text-ellipsis break-words w-1/2">
                          {p.title}
                        </h3>
                        <p
                          className="text-gray-600 mb-2 text-sm line-clamp-1 overflow-hidden text-ellipsis break-words"
                          title={p.description}
                        >
                          {p.description}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          Status: {p.status}
                        </p>
                        <div className="flex flex-col xl1600:flex-row justify-between items-start xl1600:items-center text-sm text-gray-500 mb-3 gap-1">
                          <span>{mensagemPrazo(p.endDate, p.status)}</span>
                        </div>
                      </div>

                      {canManage && (
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          {canActivate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                ativarPesquisa(p.id);
                              }}
                              className="text-emerald-600 hover:text-emerald-800 p-1 rounded transition"
                              title="Iniciar Pesquisa"
                              aria-label="Iniciar Pesquisa"
                            >
                              <FiPlayCircle size={20} />
                            </button>
                          )}

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuAberto((prev) =>
                                  prev === p.id ? null : p.id
                                );
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
                                    openEditModal(p);
                                    setMenuAberto(null);
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left ${
                                    canEditOrDelete
                                      ? "hover:bg-gray-100 text-gray-700"
                                      : "text-gray-400 cursor-not-allowed"
                                  }`}
                                  disabled={!canEditOrDelete}
                                >
                                  <FiEdit /> Editar
                                </button>
                                <button
                                  onClick={() => {
                                    excluirPesquisa(p.id);
                                    setMenuAberto(null);
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left ${
                                    canEditOrDelete
                                      ? "hover:bg-gray-100 text-red-600"
                                      : "text-gray-400 cursor-not-allowed"
                                  }`}
                                  disabled={!canEditOrDelete}
                                >
                                  <FiTrash2 /> Excluir
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
                <div
                  className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 text-gray-400 text-sm cursor-pointer"
                  onClick={openCreateModal}
                >
                  Nova pesquisa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalDashboard && (
        <Modal
          title={modalDashboard.title}
          onClose={() => setModalDashboard(null)}
        >
          <div className="mb-6 text-gray-700">
            <h4 className="font-semibold mb-2">Descrição da Pesquisa</h4>
            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4">
              <p className="text-gray-600 break-words break-all max-h-28 pr-2  overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-white">
                {modalDashboard.description}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4">
              <p className="text-sm text-gray-500">
                Data de Conclusão: {formatDateBR(modalDashboard.endDate)}
              </p>
              <p className="text-sm text-gray-500">
                Status Atual: {modalDashboard.status} (
                {modalDashboard.active ? "Ativa" : "Inativa"})
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded bg-gray-50 mb-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#08605f] scrollbar-track-white">
              <h4 className="font-semibold text-gray-800 mb-4">Perguntas</h4>
              <div className="space-y-4">
                {modalDashboard.questions &&
                modalDashboard.questions.length > 0 ? (
                  modalDashboard.questions.map((pergunta, index) => (
                    <div
                      key={pergunta.id}
                      className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300"
                    >
                      <strong>Pergunta {index + 1}:</strong>
                      <p className="text-gray-600 mt-2 break-words break-all">
                        {pergunta.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tipo de Resposta:{" "}
                        {pergunta.tipoResposta === "TEXT"
                          ? "Texto"
                          : pergunta.tipoResposta === "YESORNO"
                          ? "Sim ou Não"
                          : "Escala (Número)"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma pergunta cadastrada.</p>
                )}
              </div>
            </div>

            {modalDashboard.status === "Finalizada" && (
              <>
                <h4 className="font-semibold mt-6 mb-2 flex items-center gap-2 text-gray-800">
                  <FiCpu size={20} /> Resumo da Análise de Sentimento
                </h4>
                <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50 min-h-[60px]">
                  {surveyInsight ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: surveyInsight.resumo.replace(/\n/g, "<br />"),
                      }}
                    />
                  ) : (
                    <p className="text-gray-500">
                      Carregando análise de sentimento...
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {modalFormOpen && (
        <Modal
          title={
            isEditing
              ? "Editar Pesquisa"
              : `Nova Pesquisa - Passo ${formStep === "info" ? "1" : "2"}`
          }
          onClose={() => setModalFormOpen(false)}
        >
          {formStep === "info" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!currentPesquisa.title || !currentPesquisa.endDate) {
                  setMessageModal({
                    title: "Erro de Validação",
                    message: "Título e data final são obrigatórios.",
                  });
                  return;
                }
                setFormStep("perguntas");
              }}
              className="space-y-4"
            >
              <div>
                <label
                  className="block mb-1 text-sm font-medium text-gray-700"
                  htmlFor="title"
                >
                  Título
                </label>
                <input
                  id="title"
                  type="text"
                  value={currentPesquisa.title || ""}
                  onChange={(e) =>
                    handleUpdateCurrentPesquisa("title", e.target.value)
                  }
                  placeholder="Digite o título"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                  autoFocus
                  disabled={!canManage}
                  maxLength={150}
                />
              </div>
              <div>
                <label
                  className="block mb-1 text-sm font-medium text-gray-700"
                  htmlFor="description"
                >
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={currentPesquisa.description || ""}
                  onChange={(e) =>
                    handleUpdateCurrentPesquisa("description", e.target.value)
                  }
                  placeholder="Digite a descrição"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 h-24 resize-none"
                  disabled={!canManage}
                  maxLength={500}
                />
              </div>
              <div>
                <label
                  className="block mb-1 text-sm font-medium text-gray-700"
                  htmlFor="endDate"
                >
                  Data Final
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={
                    currentPesquisa.endDate
                      ? currentPesquisa.endDate.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleUpdateCurrentPesquisa("endDate", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                  disabled={!canManage}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  disabled={!canManage}
                >
                  Próximo
                </button>
              </div>
            </form>
          )}

          {formStep === "perguntas" && (
            <div className="space-y-4">
              <QuestionEditor
                questions={currentPesquisa.questions || []}
                onUpdateQuestion={handleUpdatePergunta}
                onRemoveQuestion={handleRemovePergunta}
                onAddQuestion={handleAddPergunta}
                isEditable={canManage}
              />
              <div className="flex justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setFormStep("info")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  disabled={!canManage}
                >
                  {isEditing ? "Salvar Edição" : "Criar Pesquisa"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {messageModal && (
        <MessageModal
          title={messageModal.title}
          message={messageModal.message}
          onClose={() => setMessageModal(null)}
          onConfirm={messageModal.onConfirm}
          showConfirmButton={messageModal.showConfirmButton}
        />
      )}
    </div>
  );
};

export default PesquisaClima;