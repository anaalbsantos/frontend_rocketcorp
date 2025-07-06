import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import SearchInput from "@/components/SearchInput";
import toast, { Toaster } from "react-hot-toast";

interface Pergunta {
  id: string;
  titulo: string;
  descricao: string;
}

interface Pesquisa {
  id: string;
  titulo: string;
  descricao: string;
  status: "Em andamento" | "Finalizada";
  perguntas: Pergunta[];
  data: string;
}

interface Resposta {
  pesquisaId: string;
  respostas: Record<string, string>;
  dataEnvio: string;
}

const LOCAL_STORAGE_PESQUISAS = "pesquisas_colaborador";
const LOCAL_STORAGE_RESPOSTAS = "respostas_colaborador";

const OPCOES_RESPOSTA = [
  "Não",
  "Relativamente não",
  "Às vezes",
  "Sim",
  "Sempre",
];

const formatDateBR = (isoDate: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("pt-BR");
};

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

const PesquisaColaborador: React.FC = () => {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Em andamento" | "Finalizada">("Todos");
  const [modalResponder, setModalResponder] = useState<Pesquisa | null>(null);
  const [modalVisualizar, setModalVisualizar] = useState<Pesquisa | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_PESQUISAS);
    if (raw) {
      try {
        setPesquisas(JSON.parse(raw));
        return;
      } catch {
        setPesquisas([]);
      }
    } else {
      setPesquisas([
        {
          id: "1",
          titulo: "Pesquisa de clima - Julho/2025",
          descricao: "Avaliação do ambiente e clima organizacional.",
          status: "Em andamento",
          perguntas: [
            { id: "p1", titulo: "Você se sente respeitado no trabalho?", descricao: "" },
            { id: "p2", titulo: "A comunicação é clara na empresa?", descricao: "" },
            { id: "p3", titulo: "Você está satisfeito com sua equipe?", descricao: "" },
          ],
          data: "2025-07-30",
        },
        {
          id: "2",
          titulo: "Pesquisa Onboarding",
          descricao: "Avaliação do processo de integração de novos colaboradores.",
          status: "Finalizada",
          perguntas: [
            { id: "p1", titulo: "O treinamento foi claro?", descricao: "" },
            { id: "p2", titulo: "Você recebeu o suporte necessário?", descricao: "" },
          ],
          data: "2025-06-01",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PESQUISAS, JSON.stringify(pesquisas));
  }, [pesquisas]);

  const pesquisasFiltradas = pesquisas.filter((p) => {
    const filtroOk = filtroStatus === "Todos" || p.status === filtroStatus;
    const buscaOk =
      busca.trim() === "" ||
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(busca.toLowerCase());
    return filtroOk && buscaOk;
  });

  const pesquisasAtivas = pesquisasFiltradas.filter((p) => p.status === "Em andamento");
  const pesquisasFinalizadas = pesquisasFiltradas.filter((p) => p.status === "Finalizada");

  const handleRespostaChange = (perguntaId: string, valor: string) => {
    setRespostas((old) => ({ ...old, [perguntaId]: valor }));
  };

  const enviarRespostas = () => {
    if (!modalResponder) return;
    if (modalResponder.perguntas.some((p) => !respostas[p.id])) {
      toast.error("Por favor, responda todas as perguntas.");
      return;
    }

    toast(
      (t) => (
        <div>
          <p>Você tem certeza que deseja enviar suas respostas? Não será possível editar depois.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                const novaResposta: Resposta = {
                  pesquisaId: modalResponder.id,
                  respostas,
                  dataEnvio: new Date().toISOString(),
                };

                const raw = localStorage.getItem(LOCAL_STORAGE_RESPOSTAS);
                let respostasExistentes: Resposta[] = [];
                if (raw) {
                  try {
                    respostasExistentes = JSON.parse(raw);
                  } catch {}
                }
                respostasExistentes.push(novaResposta);
                localStorage.setItem(LOCAL_STORAGE_RESPOSTAS, JSON.stringify(respostasExistentes));

                toast.success("Respostas enviadas com sucesso! Obrigado pela participação.");
                setRespostas({});
                setTimeout(() => {
                  setModalResponder(null);
                }, 1500);
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

  const respostasSalvasRaw = localStorage.getItem(LOCAL_STORAGE_RESPOSTAS);
  let respostasSalvas: Resposta[] = [];
  try {
    respostasSalvas = respostasSalvasRaw ? JSON.parse(respostasSalvasRaw) : [];
  } catch {}

  const respostasUsuario = modalVisualizar
    ? respostasSalvas.find((r) => r.pesquisaId === modalVisualizar.id)?.respostas
    : null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="shadow-sm bg-white border-b border-gray-200 px-4 md:px-8 py-8 max-w-[1700px] mx-auto w-full">
          <h1 className="text-2xl font-semibold text-gray-800">Pesquisa de Clima Organizacional</h1>
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
                    onClick={() => setModalResponder(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setModalResponder(p);
                    }}
                    aria-label={`Responder pesquisa ${p.titulo}`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.titulo}</h3>
                    <p className="text-gray-600 mb-2 text-sm">{p.descricao}</p>
                    <p className="text-sm text-gray-600 mb-3">Status: {p.status}</p>
                    <p className="text-sm text-gray-500">{`Prazo: ${formatDateBR(p.data)}`}</p>
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
                    aria-label={`Visualizar respostas da pesquisa ${p.titulo}`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{p.titulo}</h3>
                    <p className="text-gray-600 mb-2 text-sm">{p.descricao}</p>
                    <p className="text-sm text-gray-600 mb-3">Status: {p.status}</p>
                    <p className="text-sm text-gray-500">{`Prazo: ${formatDateBR(p.data)}`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {modalResponder && (
          <Modal
            title={modalResponder.titulo}
            onClose={() => {
              setModalResponder(null);
              setRespostas({});
            }}
          >
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{modalResponder.descricao}</p>
              <p className="text-sm text-gray-500">
                Prazo para responder: <strong>{formatDateBR(modalResponder.data)}</strong>
              </p>
            </div>

            {modalResponder.perguntas.length === 0 && (
              <p className="text-sm text-gray-500">Sem perguntas cadastradas nesta pesquisa.</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviarRespostas();
              }}
              className="space-y-6 max-h-[60vh] overflow-y-auto"
            >
              {modalResponder.perguntas.map((p) => (
                <div key={p.id} className="border border-gray-300 rounded p-4 bg-white">
                  <strong className="block mb-1 text-gray-800">{p.titulo}</strong>

                  <select
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={respostas[p.id] || ""}
                    onChange={(e) => handleRespostaChange(p.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Selecione uma opção
                    </option>
                    {OPCOES_RESPOSTA.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalResponder(null);
                    setRespostas({});
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Enviar respostas
                </button>
              </div>
            </form>
          </Modal>
        )}

        {modalVisualizar && (
            <Modal title={modalVisualizar.titulo} onClose={() => setModalVisualizar(null)}>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{modalVisualizar.descricao}</p>
              <p className="text-sm text-gray-500">
                Prazo da pesquisa: <strong>{formatDateBR(modalVisualizar.data)}</strong>
              </p>
            </div>

            {modalVisualizar.perguntas.length === 0 && (
              <p className="text-sm text-gray-500">Sem perguntas cadastradas nesta pesquisa.</p>
            )}

            {respostasUsuario ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {modalVisualizar.perguntas.map((p) => (
                  <div key={p.id} className="border border-gray-300 rounded p-4 bg-white">
                    <strong className="block mb-1 text-gray-800">{p.titulo}</strong>
                    <p className="text-gray-700">
                      Resposta: <strong>{respostasUsuario[p.id] || "Não respondida"}</strong>
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
