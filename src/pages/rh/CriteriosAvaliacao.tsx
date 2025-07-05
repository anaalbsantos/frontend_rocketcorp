import React, { useState, useEffect, useMemo } from "react";
import TrilhaSection from "../../components/TrilhaSection";
import TabsContent from "../../components/TabContent";
import SearchInput from "../../components/SearchInput";

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

const POSICAO_PADRAO = {
  id: "cafc54b8-19d5-45d0-8afb-1c63b8cc2486",
  nome: "Padrão",
  trilha: "DESENVOLVIMENTO",
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

  async function carregarCriterios() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login novamente.");

      const response = await fetch("http://localhost:3000/criterios-avaliacao", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao carregar critérios: ${response.status} - ${errorText}`);
      }

      const criteriosBackend: BackendCriterion[] = await response.json();

      const trilhasMap: Record<string, TrilhaData> = {};

      ["DESENVOLVIMENTO", "FINANCEIRO", "DESIGN"].forEach((trilhaName) => {
        trilhasMap[trilhaName] = {
          trilhaName,
          sections: SECOES_FIXAS.map((sec) => ({ title: sec.title, criteria: [] })),
        };
      });

      criteriosBackend.forEach((crit) => {
        if (!crit.assignments || crit.assignments.length === 0) return;

        crit.assignments.forEach((assignment) => {
          const trackUpper = assignment.position.track.trim().toUpperCase();
          const trilha = trilhasMap[trackUpper];
          if (!trilha) return;

          const tipoFormatado = (crit.type || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .trim();

          let secTitle = "";
          switch (tipoFormatado) {
            case "COMPORTAMENTO":
              secTitle = "Comportamento";
              break;
            case "EXECUCAO":
              secTitle = "Execução";
              break;
            case "GESTAO":
            case "GESTAO E LIDERANCA":
              secTitle = "Gestão e Liderança";
              break;
            default:
              return;
          }

          const section = trilha.sections.find((s) => s.title === secTitle);
          if (!section) return;

          const jaExiste = section.criteria.some((c) => c.id === crit.id);
          if (!jaExiste) {
            section.criteria.push({
              id: crit.id,
              name: crit.title,
              initialDescription: crit.description,
              isExpandable: true,
            });
          }
        });
      });

      const trilhasArray = Object.values(trilhasMap);
      setTrilhasData(trilhasArray);

      const initialExpandedTrilhas: Record<number, boolean> = {};
      const initialExpandedSections: Record<number, Record<number, boolean>> = {};

      trilhasArray.forEach((_, tIndex) => {
        initialExpandedTrilhas[tIndex] = true;
        initialExpandedSections[tIndex] = {};
        SECOES_FIXAS.forEach((_, sIndex) => (initialExpandedSections[tIndex][sIndex] = true));
      });

      setExpandedTrilhas(initialExpandedTrilhas);
      setExpandedSections(initialExpandedSections);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  useEffect(() => {
    carregarCriterios();
  }, []);

  const toggleTrilha = (trilhaIndex: number) =>
    setExpandedTrilhas((prev) => ({ ...prev, [trilhaIndex]: !prev[trilhaIndex] }));

  const toggleCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) =>
    setExpandedCriteria((prev) => ({
      ...prev,
      [trilhaIndex]: {
        ...prev[trilhaIndex],
        [sectionIndex]: {
          ...(prev[trilhaIndex]?.[sectionIndex] || {}),
          [criterionIndex]: !(prev[trilhaIndex]?.[sectionIndex]?.[criterionIndex] || false),
        },
      },
    }));

  const toggleSection = (trilhaIndex: number, sectionIndex: number) =>
    setExpandedSections((prev) => ({
      ...prev,
      [trilhaIndex]: {
        ...prev[trilhaIndex],
        [sectionIndex]: !prev[trilhaIndex]?.[sectionIndex],
      },
    }));

  const onEditCriterionName = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoNome: string) =>
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((section, sIndex) =>
                sIndex !== sectionIndex
                  ? section
                  : {
                      ...section,
                      criteria: section.criteria.map((criterion, cIndex) =>
                        cIndex !== criterionIndex ? criterion : { ...criterion, name: novoNome }
                      ),
                    }
              ),
            }
      )
    );

  const onEditCriterionDescription = (
    trilhaIndex: number,
    sectionIndex: number,
    criterionIndex: number,
    novaDescricao: string
  ) =>
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((section, sIndex) =>
                sIndex !== sectionIndex
                  ? section
                  : {
                      ...section,
                      criteria: section.criteria.map((criterion, cIndex) =>
                        cIndex !== criterionIndex ? criterion : { ...criterion, initialDescription: novaDescricao }
                      ),
                    }
              ),
            }
      )
    );

  const onRemoveCriterion = async (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login.");

      const criterioToDelete = trilhasData[trilhaIndex].sections[sectionIndex].criteria[criterionIndex];

      if (criterioToDelete.id) {
        const response = await fetch(`http://localhost:3000/criterios-avaliacao/${criterioToDelete.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status !== 204) {
          const errorText = await response.text();
          throw new Error(`Erro ao deletar critério: ${response.status} - ${errorText}`);
        }
      }

      setTrilhasData((prev) =>
        prev.map((trilha, tIndex) =>
          tIndex !== trilhaIndex
            ? trilha
            : {
                ...trilha,
                sections: trilha.sections.map((section, sIndex) =>
                  sIndex !== sectionIndex
                    ? section
                    : {
                        ...section,
                        criteria: section.criteria.filter((_, cIndex) => cIndex !== criterionIndex),
                      }
                ),
              }
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        alert(`Erro ao deletar critério: ${error.message}`);
      }
    }
  };

const onAddCriterion = async (trilhaIndex: number, sectionIndex: number) => {
  try {
    const trilha = trilhasData[trilhaIndex];
    const track = trilha.trilhaName;
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado.");

    const response = await fetch(`http://localhost:3000/positions/track/${track}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao buscar posições da trilha: ${response.status} - ${errorText}`);
    }

    const posicoes: { id: string; name: string; track: string }[] = await response.json();
    const primeiraPosicao = posicoes[0];

    const novoCriterion: Criterion = {
      name: "Novo Critério",
      isExpandable: true,
      initialDescription: "",
      assignments: primeiraPosicao ? [{ positionId: primeiraPosicao.id, isRequired: false }] : [],
    };

    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((section, sIndex) =>
                sIndex !== sectionIndex
                  ? section
                  : { ...section, criteria: [...section.criteria, novoCriterion] }
              ),
            }
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
  }
};


  const montarPayloadUpsert = (): UpsertPayload => {
    const create: UpsertCreate[] = [];
    const update: UpsertUpdate[] = [];

    trilhasData.forEach((trilha) => {
      trilha.sections.forEach((section) => {
        section.criteria.forEach((criterion) => {
          let type = "";
          switch (section.title.toLowerCase()) {
            case "comportamento":
              type = "COMPORTAMENTO";
              break;
            case "execução":
              type = "EXECUCAO";
              break;
            case "gestão e liderança":
              type = "GESTAO";
              break;
          }

          const track = trilha.trilhaName;
          const positionId =
            criterion.assignments?.[0]?.positionId || POSICAO_PADRAO.id;

          if (criterion.id) {
            update.push({
              id: criterion.id,
              title: criterion.name,
              description: criterion.initialDescription || "",
              type,
              track,
              positionId,
            });
          } else {
            create.push({
              title: criterion.name,
              description: criterion.initialDescription || "",
              type,
              track,
              positionId,
            });
          }
        });
      });
    });

    return { create, update };
  };

  const salvarAlteracoes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login.");

      const payload = montarPayloadUpsert();

      const response = await fetch("http://localhost:3000/criterios-avaliacao/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao salvar alterações: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      alert(data.message);

      await carregarCriterios();
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const contemTodasPalavras = (texto: string, termo: string) => {
    const palavras = termo.toLowerCase().split(" ").filter(Boolean);
    return palavras.every((palavra) => texto.toLowerCase().includes(palavra));
  };

  const trilhasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return trilhasData;

    if (filtro === "trilhas") {
      return trilhasData.filter((trilha) =>
        contemTodasPalavras(trilha.trilhaName, searchTerm)
      );
    }

    if (filtro === "criterios") {
      return trilhasData
        .map((trilha) => {
          const sectionsFiltradas = trilha.sections
            .map((section) => {
              const criteriosFiltrados = section.criteria.filter((criterion) =>
                contemTodasPalavras(criterion.name, searchTerm)
              );
              return criteriosFiltrados.length > 0 ? { ...section, criteria: criteriosFiltrados } : null;
            })
            .filter(Boolean) as Section[];

          return sectionsFiltradas.length > 0 ? { ...trilha, sections: sectionsFiltradas } : null;
        })
        .filter(Boolean) as TrilhaData[];
    }

    return trilhasData
      .map((trilha) => {
        const trilhaBate = contemTodasPalavras(trilha.trilhaName, searchTerm);
        const sectionsFiltradas = trilha.sections
          .map((section) => {
            const criteriosFiltrados = section.criteria.filter((criterion) =>
              contemTodasPalavras(criterion.name, searchTerm)
            );
            if (criteriosFiltrados.length > 0) return { ...section, criteria: criteriosFiltrados };
            if (trilhaBate) return { ...section, criteria: [...section.criteria] };
            return null;
          })
          .filter(Boolean) as Section[];

        return trilhaBate || sectionsFiltradas.length > 0 ? { ...trilha, sections: sectionsFiltradas } : null;
      })
      .filter(Boolean) as TrilhaData[];
  }, [searchTerm, filtro, trilhasData]);

  const placeholderBusca =
    filtro === "trilhas" ? "Buscar trilhas" : filtro === "criterios" ? "Buscar critérios" : "Buscar";

  const trilhaContent = (
    <div className="mx-auto mt-6 w-[1550px] max-w-full">
      {trilhasFiltradas.map((trilha) => (
        <TrilhaSection
          key={trilha.trilhaName}
          trilhaName={trilha.trilhaName}
          sections={trilha.sections}
          trilhaIndex={trilhasFiltradas.indexOf(trilha)}
          isTrilhaExpanded={expandedTrilhas[trilhasFiltradas.indexOf(trilha)] || false}
          onToggleTrilha={() => toggleTrilha(trilhasFiltradas.indexOf(trilha))}
          expandedCriteria={expandedCriteria[trilhasFiltradas.indexOf(trilha)] || {}}
          onToggleCriterion={(sectionIndex, criterionIndex) =>
            toggleCriterion(trilhasFiltradas.indexOf(trilha), sectionIndex, criterionIndex)
          }
          isEditing={isEditing}
          onAddCriterion={onAddCriterion}
          onRemoveCriterion={onRemoveCriterion}
          onEditCriterionName={onEditCriterionName}
          onEditCriterionDescription={onEditCriterionDescription}
          expandedSections={expandedSections[trilhasFiltradas.indexOf(trilha)] || {}}
          onToggleSection={(sectionIndex) =>
            toggleSection(trilhasFiltradas.indexOf(trilha), sectionIndex)
          }
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white">
        <div className="flex items-center justify-between px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-800">Critérios de Avaliação</h1>
          <button
            onClick={() => (isEditing ? salvarAlteracoes() : setIsEditing(true))}
            type="button"
            className="rounded-md bg-[#08605f] px-4 py-2 font-medium text-white hover:bg-[#064d4a]"
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
        {activeTab === "trilha" && trilhaContent}
      </div>
    </div>
  );
};

export default CriteriosAvaliacao;
