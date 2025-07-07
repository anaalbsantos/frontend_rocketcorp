import React, { useState, useEffect, useMemo } from "react";
import TrilhaSection from "../../components/TrilhaSection";
import TabsContent from "../../components/TabContent";
import SearchInput from "../../components/SearchInput";
import toast from "react-hot-toast";

interface Criterion {
  id?: string;
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
  assignments?: { positionId: string; isRequired?: boolean }[];
}

interface Section {
  title: string;
  criteria: Criterion[];
}

interface TrilhaData {
  trilhaName: string;
  sections: Section[];
}

interface BackendCriterion {
  id: string;
  title: string;
  description: string;
  type: string;
  assignments: {
    id: string;
    criterionId: string;
    positionId: string;
    isRequired: boolean;
    position: {
      id: string;
      name: string;
      track: string;
    };
  }[];
}

interface UpsertCreate {
  title: string;
  description: string;
  type: string;
  track: string;
  positionId: string;
}

interface UpsertUpdate extends UpsertCreate {
  id: string;
}

interface UpsertPayload {
  create: UpsertCreate[];
  update: UpsertUpdate[];
}

const filtrosDisponiveis = ["todos", "trilhas", "criterios"];

const SECOES_FIXAS: Section[] = [
  { title: "Comportamento", criteria: [] },
  { title: "Execução", criteria: [] },
  { title: "Gestão e Liderança", criteria: [] },
];

const POSICOES_PADRAO: Record<string, { id: string; nome: string; trilha: string }> = {
  DESENVOLVIMENTO: {
    id: "cafc54b8-19d5-45d0-8afb-1c63b8cc2486",
    nome: "Padrão Desenvolvimento",
    trilha: "DESENVOLVIMENTO",
  },
  DESIGN: {
    id: "2e1b0f1e-3a5f-4f2e-b6d8-91234abcde01",  // Exemplo UUID válido
    nome: "Padrão Design",
    trilha: "DESIGN",
  },
  FINANCEIRO: {
    id: "7b3a12cd-9f8e-4d2c-8a12-3a7bcd123456",  // Exemplo UUID válido
    nome: "Padrão Financeiro",
    trilha: "FINANCEIRO",
  },
};



const CriteriosAvaliacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [isEditing, setIsEditing] = useState(false);
  const [trilhasData, setTrilhasData] = useState<TrilhaData[]>([]);
  const [expandedTrilhas, setExpandedTrilhas] = useState<Record<number, boolean>>({});
  const [expandedCriteria, setExpandedCriteria] = useState<
    Record<number, Record<number, Record<number, boolean>>>
  >({});
  const [expandedSections, setExpandedSections] = useState<Record<number, Record<number, boolean>>>({});

  const carregarCriterios = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login novamente.");

      const res = await fetch("http://localhost:3000/criterios-avaliacao", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erro ao carregar critérios: ${res.status} - ${errText}`);
      }

      const backend: BackendCriterion[] = await res.json();

      const trilhasMap: Record<string, TrilhaData> = {};
      ["DESENVOLVIMENTO", "FINANCEIRO", "DESIGN"].forEach((trilha) => {
        trilhasMap[trilha] = {
          trilhaName: trilha,
          sections: SECOES_FIXAS.map(({ title }) => ({ title, criteria: [] })),
        };
      });

      backend.forEach(({ id, title, description, type, assignments }) => {
        if (!assignments?.length) return;

        assignments.forEach(({ position }) => {
          const track = position.track.trim().toUpperCase();
          const trilha = trilhasMap[track];
          if (!trilha) return;

          const tipo = (type || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .trim();

          let secTitle = "";
          if (tipo === "COMPORTAMENTO") secTitle = "Comportamento";
          else if (tipo === "EXECUCAO") secTitle = "Execução";
          else if (tipo === "GESTAO" || tipo === "GESTAO E LIDERANCA") secTitle = "Gestão e Liderança";
          else return;

          const section = trilha.sections.find((s) => s.title === secTitle);
          if (!section) return;

          if (!section.criteria.some((c) => c.id === id)) {
            section.criteria.push({
              id,
              name: title,
              initialDescription: description,
              isExpandable: true,
            });
          }
        });
      });

      const trilhasArray = Object.values(trilhasMap);
      setTrilhasData(trilhasArray);

      const expandedTrilhasInit: Record<number, boolean> = {};
      const expandedSectionsInit: Record<number, Record<number, boolean>> = {};
      trilhasArray.forEach((_, tIdx) => {
        expandedTrilhasInit[tIdx] = true;
        expandedSectionsInit[tIdx] = {};
        SECOES_FIXAS.forEach((_, sIdx) => (expandedSectionsInit[tIdx][sIdx] = true));
      });
      setExpandedTrilhas(expandedTrilhasInit);
      setExpandedSections(expandedSectionsInit);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  useEffect(() => {
    carregarCriterios();
  }, []);

  const toggleTrilha = (tIdx: number) => setExpandedTrilhas((prev) => ({ ...prev, [tIdx]: !prev[tIdx] }));

  const toggleCriterion = (tIdx: number, sIdx: number, cIdx: number) =>
    setExpandedCriteria((prev) => ({
      ...prev,
      [tIdx]: {
        ...prev[tIdx],
        [sIdx]: {
          ...(prev[tIdx]?.[sIdx] || {}),
          [cIdx]: !prev[tIdx]?.[sIdx]?.[cIdx],
        },
      },
    }));

  const toggleSection = (tIdx: number, sIdx: number) =>
    setExpandedSections((prev) => ({
      ...prev,
      [tIdx]: { ...prev[tIdx], [sIdx]: !prev[tIdx]?.[sIdx] },
    }));

  const onEditCriterionName = (tIdx: number, sIdx: number, cIdx: number, newName: string) =>
    setTrilhasData((prev) =>
      prev.map((trilha, ti) =>
        ti !== tIdx
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((sec, si) =>
                si !== sIdx
                  ? sec
                  : {
                      ...sec,
                      criteria: sec.criteria.map((crit, ci) =>
                        ci !== cIdx ? crit : { ...crit, name: newName }
                      ),
                    }
              ),
            }
      )
    );

  const onEditCriterionDescription = (tIdx: number, sIdx: number, cIdx: number, newDesc: string) =>
    setTrilhasData((prev) =>
      prev.map((trilha, ti) =>
        ti !== tIdx
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((sec, si) =>
                si !== sIdx
                  ? sec
                  : {
                      ...sec,
                      criteria: sec.criteria.map((crit, ci) =>
                        ci !== cIdx ? crit : { ...crit, initialDescription: newDesc }
                      ),
                    }
              ),
            }
      )
    );

  const onRemoveCriterion = async (tIdx: number, sIdx: number, cIdx: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login.");

      const crit = trilhasData[tIdx].sections[sIdx].criteria[cIdx];
      if (crit.id) {
        const res = await fetch(`http://localhost:3000/criterios-avaliacao/${crit.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status !== 204) {
          const err = await res.text();
          throw new Error(`Erro ao deletar critério: ${res.status} - ${err}`);
        }
      }

      setTrilhasData((prev) =>
        prev.map((trilha, ti) =>
          ti !== tIdx
            ? trilha
            : {
                ...trilha,
                sections: trilha.sections.map((sec, si) =>
                  si !== sIdx
                    ? sec
                    : { ...sec, criteria: sec.criteria.filter((_, ci) => ci !== cIdx) }
                ),
              }
        )
      );
    } catch (error) {
      if (error instanceof Error) alert(`Erro ao deletar critério: ${error.message}`);
    }
  };

const onAddCriterion = async (tIdx: number, sIdx: number) => {
  try {
    const trilha = trilhasData[tIdx];
    const track = trilha.trilhaName; // nome da trilha atual
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado.");

    const res = await fetch(`http://localhost:3000/positions/track/${track}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erro ao buscar posições da trilha: ${res.status} - ${err}`);
    }

    const posicoes: { id: string; name: string; track: string }[] = await res.json();

    // Busca a posição padrão da trilha ou usa Desenvolvimento como fallback
    const padrao = POSICOES_PADRAO[track] || POSICOES_PADRAO.DESENVOLVIMENTO;
    const primeiraPosicao = posicoes.length > 0 ? posicoes[0] : padrao;

    const novoCriterion: Criterion = {
      name: "Novo Critério",
      isExpandable: true,
      initialDescription: "",
      assignments: [{ positionId: primeiraPosicao.id, isRequired: false }],
    };

    setTrilhasData((prev) =>
      prev.map((trilha, ti) =>
        ti !== tIdx
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((sec, si) =>
                si !== sIdx ? sec : { ...sec, criteria: [...sec.criteria, novoCriterion] }
              ),
            }
      )
    );
  } catch (error) {
    if (error instanceof Error) alert(error.message);
  }
};


function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

const montarPayloadUpsert = (): UpsertPayload => {
  const create: UpsertCreate[] = [];
  const update: UpsertUpdate[] = [];

  trilhasData.forEach(({ trilhaName, sections }) =>
    sections.forEach(({ title, criteria }) => {
      const type =
        title.toLowerCase() === "comportamento"
          ? "COMPORTAMENTO"
          : title.toLowerCase() === "execução"
          ? "EXECUCAO"
          : title.toLowerCase() === "gestão e liderança"
          ? "GESTAO"
          : "";

      criteria.forEach(({ id, name, initialDescription, assignments }) => {
        const rawPositionId =
          assignments?.[0]?.positionId ||
          POSICOES_PADRAO[trilhaName]?.id ||
          POSICOES_PADRAO.DESENVOLVIMENTO.id;

        const positionId = isValidUUID(rawPositionId)
          ? rawPositionId
          : POSICOES_PADRAO.DESENVOLVIMENTO.id;

        if (id) {
          update.push({
            id,
            title: name,
            description: initialDescription || "",
            type,
            track: trilhaName,
            positionId,
          });
        } else {
          create.push({
            title: name,
            description: initialDescription || "",
            type,
            track: trilhaName,
            positionId,
          });
        }
      });
    })
  );

  return { create, update };
};


  const salvarAlteracoes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login.");

      const payload = montarPayloadUpsert();

      const request = fetch("http://localhost:3000/criterios-avaliacao/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro ao salvar alterações: ${res.status} - ${errText}`);
        }
        return res.json();
      });

      await toast.promise(request, {
        loading: "Salvando critérios...",
        success: "Critérios salvos com sucesso!",
        error: (err) => err.message || "Erro ao salvar critérios.",
      });

      await carregarCriterios();
      setIsEditing(false);
    } catch (error) {
      console.error("Erro geral:", error);
    }
  };

  const contemTodasPalavras = (texto: string, termo: string) =>
    termo
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .every((p) => texto.toLowerCase().includes(p));

  const trilhasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return trilhasData;

    if (filtro === "trilhas")
      return trilhasData.filter((t) => contemTodasPalavras(t.trilhaName, searchTerm));

    if (filtro === "criterios") {
      return trilhasData
        .map((t) => {
          const sectionsFiltered = t.sections
            .map((s) => {
              const critFiltered = s.criteria.filter((c) =>
                contemTodasPalavras(c.name, searchTerm)
              );
              return critFiltered.length ? { ...s, criteria: critFiltered } : null;
            })
            .filter(Boolean) as Section[];
          return sectionsFiltered.length ? { ...t, sections: sectionsFiltered } : null;
        })
        .filter(Boolean) as TrilhaData[];
    }

    return trilhasData
      .map((t) => {
        const bateTrilha = contemTodasPalavras(t.trilhaName, searchTerm);
        const sectionsFiltered = t.sections
          .map((s) => {
            const critFiltered = s.criteria.filter((c) =>
              contemTodasPalavras(c.name, searchTerm)
            );
            if (critFiltered.length) return { ...s, criteria: critFiltered };
            if (bateTrilha) return { ...s, criteria: [...s.criteria] };
            return null;
          })
          .filter(Boolean) as Section[];

        return bateTrilha || sectionsFiltered.length ? { ...t, sections: sectionsFiltered } : null;
      })
      .filter(Boolean) as TrilhaData[];
  }, [searchTerm, filtro, trilhasData]);

  const placeholderBusca =
    filtro === "trilhas" ? "Buscar trilhas" : filtro === "criterios" ? "Buscar critérios" : "Buscar";

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white">
        <div className="flex items-center justify-between px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-800">Critérios de Avaliação</h1>
          <button
            type="button"
            className="rounded-md bg-[#08605f] px-4 py-2 font-medium text-white hover:bg-[#064d4a]"
            onClick={() => (isEditing ? salvarAlteracoes() : setIsEditing(true))}
          >
            {isEditing ? "Salvar alterações" : "Editar"}
          </button>
        </div>
        <div className="border-t border-gray-200">
          <TabsContent
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            tabs={["trilha"]}
            itemClasses={{ trilha: "ml-4 px-10 py-3" }}
          />
        </div>
      </div>

      <div className="py-6 px-4">
        <div className="mx-auto mb-6 w-[1550px] max-w-full flex items-center gap-4 rounded-md bg-gray-50 p-4 shadow-sm">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={placeholderBusca}
            className="flex-grow min-w-0"
            filterOptions={filtrosDisponiveis}
            initialFilter={filtrosDisponiveis[0]}
            onFilterChange={setFiltro}
          />
        </div>

        {activeTab === "trilha" && (
          <div className="mx-auto mt-6 w-[1550px] max-w-full">
            {trilhasFiltradas.map((trilha, tIdx) => (
              <TrilhaSection
                key={trilha.trilhaName}
                trilhaName={trilha.trilhaName}
                sections={trilha.sections}
                trilhaIndex={tIdx}
                isTrilhaExpanded={expandedTrilhas[tIdx] || false}
                onToggleTrilha={() => toggleTrilha(tIdx)}
                expandedCriteria={expandedCriteria[tIdx] || {}}
                onToggleCriterion={(sIdx, cIdx) => toggleCriterion(tIdx, sIdx, cIdx)}
                isEditing={isEditing}
                onAddCriterion={onAddCriterion}
                onRemoveCriterion={onRemoveCriterion}
                onEditCriterionName={onEditCriterionName}
                onEditCriterionDescription={onEditCriterionDescription}
                expandedSections={expandedSections[tIdx] || {}}
                onToggleSection={(sIdx) => toggleSection(tIdx, sIdx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CriteriosAvaliacao;
