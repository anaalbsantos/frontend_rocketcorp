import React, { useState, useMemo } from "react";
import TrilhaSection from "../../components/TrilhaSection";
import TabsContent from "../../components/TabContent";
import SearchInput from "../../components/SearchInput";

interface Criterion {
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
  initialWeight?: string;
  isMandatory: boolean;
}

interface Section {
  title: string;
  criteria: Criterion[];
}

interface TrilhaData {
  trilhaName: string;
  sections: Section[];
}

const filtrosDisponiveis = ["todos", "trilhas", "criterios"];

// Seções fixas que todas as trilhas terão, sem possibilidade de alteração
const SECOES_FIXAS: Section[] = [
  { title: "Comportamento", criteria: [] },
  { title: "Execução", criteria: [] },
  { title: "Gestão e Liderança", criteria: [] },
];

const CriteriosAvaliacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [isEditing, setIsEditing] = useState(false);

  // Dados iniciais das trilhas, só com nome e critérios. As seções fixas serão atribuídas abaixo
  const trilhasBase: Omit<TrilhaData, "sections">[] = [
    { trilhaName: "Trilha de Financeiro" },
    { trilhaName: "Trilha de Design" },
    // Pode adicionar mais trilhas aqui se quiser
  ];

  // Estado com as trilhas já com seções fixas e critérios preenchidos
  // Inicializa as trilhas com as 3 seções fixas, e critérios default para exemplo
  const [trilhasData, setTrilhasData] = useState<TrilhaData[]>(() =>
    trilhasBase.map((trilha) => ({
      trilhaName: trilha.trilhaName,
      sections: SECOES_FIXAS.map((sec) => ({
        title: sec.title,
        criteria: [], // inicia vazio, pode popular depois via edição de critérios
      })),
    }))
  );

  // Exemplo de popular critérios padrão para "Trilha de Financeiro"
  React.useEffect(() => {
    setTrilhasData((prev) =>
      prev.map((trilha) => {
        if (trilha.trilhaName === "Trilha de Financeiro") {
          return {
            ...trilha,
            sections: trilha.sections.map((sec) => {
              if (sec.title === "Comportamento") {
                return {
                  ...sec,
                  criteria: [
                    {
                      name: "Sentimento de Dono",
                      isExpandable: true,
                      initialDescription: "Demonstre vontade de projeto ser executado da melhor forma",
                      initialWeight: "20%",
                      isMandatory: true,
                    },
                    { name: "Resiliência nas adversidades", isExpandable: true, isMandatory: true },
                    { name: "Organização no trabalho", isExpandable: true, isMandatory: true },
                    { name: 'Ser "team player"', isExpandable: true, isMandatory: true },
                  ],
                };
              }
              if (sec.title === "Execução") {
                return {
                  ...sec,
                  criteria: [
                    {
                      name: "Análise de Dados",
                      isExpandable: true,
                      initialDescription: "Capacidade de interpretar e usar dados financeiros",
                      initialWeight: "25%",
                      isMandatory: true,
                    },
                    { name: "Conhecimento de Mercado", isExpandable: true, isMandatory: true },
                    { name: "Gestão de Orçamento", isExpandable: true, isMandatory: true },
                  ],
                };
              }
              if (sec.title === "Gestão e Liderança") {
                return {
                  ...sec,
                  criteria: [
                    {
                      name: "Liderança Situacional",
                      isExpandable: true,
                      initialDescription: "Capacidade de adaptar liderança ao contexto",
                      initialWeight: "15%",
                      isMandatory: false,
                    },
                    {
                      name: "Comunicação Eficaz",
                      isExpandable: true,
                      initialDescription: "Clareza e assertividade na comunicação",
                      initialWeight: "10%",
                      isMandatory: true,
                    },
                  ],
                };
              }
              return sec;
            }),
          };
        }
        // Exemplo para Trilha de Design, critérios diferentes
        if (trilha.trilhaName === "Trilha de Design") {
          return {
            ...trilha,
            sections: trilha.sections.map((sec) => {
              if (sec.title === "Comportamento") {
                return {
                  ...sec,
                  criteria: [
                    {
                      name: "Criatividade",
                      isExpandable: true,
                      initialDescription: "Capacidade de gerar ideias inovadoras",
                      initialWeight: "30%",
                      isMandatory: true,
                    },
                    { name: "Trabalho em Equipe", isExpandable: true, isMandatory: true },
                    { name: "Flexibilidade", isExpandable: true, isMandatory: true },
                  ],
                };
              }
              if (sec.title === "Execução") {
                return {
                  ...sec,
                  criteria: [
                    { name: "Design Responsivo", isExpandable: true, isMandatory: true },
                    { name: "Uso de Ferramentas", isExpandable: true, isMandatory: true },
                    { name: "Prototipagem Rápida", isExpandable: true, isMandatory: false },
                  ],
                };
              }
              if (sec.title === "Gestão e Liderança") {
                return {
                  ...sec,
                  criteria: [
                    {
                      name: "Gestão de Projetos",
                      isExpandable: true,
                      initialDescription: "Organização e controle do fluxo de trabalho",
                      initialWeight: "20%",
                      isMandatory: true,
                    },
                    {
                      name: "Comunicação com Stakeholders",
                      isExpandable: true,
                      initialDescription: "Alinhamento com partes interessadas",
                      initialWeight: "15%",
                      isMandatory: false,
                    },
                  ],
                };
              }
              return sec;
            }),
          };
        }

        return trilha;
      })
    );
  }, []);

  const [expandedTrilhas, setExpandedTrilhas] = React.useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    trilhasData.forEach((_, i) => (initialState[i] = true));
    return initialState;
  });

  const [expandedCriteria, setExpandedCriteria] = React.useState<{
    [trilhaIndex: number]: { [sectionIndex: number]: { [criterionIndex: number]: boolean } };
  }>({});

  const toggleTrilha = (trilhaIndex: number) =>
    setExpandedTrilhas((prev) => ({ ...prev, [trilhaIndex]: !prev[trilhaIndex] }));

  const toggleCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
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
  };

  const toggleCriterionMandatory = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
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
                        cIndex !== criterionIndex ? criterion : { ...criterion, isMandatory: !criterion.isMandatory }
                      ),
                    }
              ),
            }
      )
    );
  };

  const onEditCriterionName = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoNome: string) => {
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
  };

  const onEditCriterionDescription = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novaDescricao: string) => {
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
  };

  const onEditCriterionWeight = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoPeso: string) => {
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
                        cIndex !== criterionIndex ? criterion : { ...criterion, initialWeight: novoPeso }
                      ),
                    }
              ),
            }
      )
    );
  };

  const onRemoveCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((section, sIndex) =>
                sIndex !== sectionIndex
                  ? section
                  : { ...section, criteria: section.criteria.filter((_, cIndex) => cIndex !== criterionIndex) }
              ),
            }
      )
    );
  };

  const onAddCriterion = (trilhaIndex: number, sectionIndex: number) => {
    const novoCriterion: Criterion = {
      name: "Novo Critério",
      isExpandable: true,
      initialDescription: "",
      initialWeight: "",
      isMandatory: false,
    };
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((section, sIndex) =>
                sIndex !== sectionIndex ? section : { ...section, criteria: [...section.criteria, novoCriterion] }
              ),
            }
      )
    );
  };

  // Buscas e filtros continuam iguais
  const contemTodasPalavras = (texto: string, termo: string) => {
    const palavras = termo.toLowerCase().split(" ").filter(Boolean);
    return palavras.every((palavra) => texto.toLowerCase().includes(palavra));
  };

  const trilhasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return trilhasData;

    if (filtro === "trilhas") {
      return trilhasData.filter((trilha) => contemTodasPalavras(trilha.trilhaName, searchTerm));
    }

    if (filtro === "criterios") {
      return trilhasData
        .map((trilha) => {
          const sectionsFiltradas = trilha.sections
            .map((section) => {
              const criteriosFiltrados = section.criteria.filter((criterion) => contemTodasPalavras(criterion.name, searchTerm));
              if (criteriosFiltrados.length === 0) return null;
              return { ...section, criteria: criteriosFiltrados };
            })
            .filter(Boolean) as Section[];
          if (sectionsFiltradas.length === 0) return null;
          return { ...trilha, sections: sectionsFiltradas };
        })
        .filter(Boolean) as TrilhaData[];
    }

    return trilhasData
      .map((trilha) => {
        const trilhaBate = contemTodasPalavras(trilha.trilhaName, searchTerm);

        const sectionsFiltradas = trilha.sections
          .map((section) => {
            const criteriosFiltrados = section.criteria.filter((criterion) => contemTodasPalavras(criterion.name, searchTerm));
            if (criteriosFiltrados.length > 0) return { ...section, criteria: criteriosFiltrados };
            if (trilhaBate) return { ...section, criteria: [...section.criteria] };
            return null;
          })
          .filter(Boolean) as Section[];

        if (trilhaBate || sectionsFiltradas.length > 0) return { ...trilha, sections: sectionsFiltradas };
        return null;
      })
      .filter(Boolean) as TrilhaData[];
  }, [searchTerm, filtro, trilhasData]);

  const placeholderBusca =
    filtro === "trilhas" ? "Buscar trilhas" : filtro === "criterios" ? "Buscar critérios" : "Buscar";

  const trilhaContent = (
    <div className="mx-auto mt-6 w-[1550px] max-w-full">
      {trilhasFiltradas.map((trilha, trilhaIndex) => (
        <TrilhaSection
          key={trilhaIndex}
          trilhaName={trilha.trilhaName}
          sections={trilha.sections}
          trilhaIndex={trilhaIndex}
          isTrilhaExpanded={expandedTrilhas[trilhaIndex] || false}
          onToggleTrilha={() => toggleTrilha(trilhaIndex)}
          expandedCriteria={expandedCriteria[trilhaIndex] || {}}
          onToggleCriterion={(sectionIndex, criterionIndex) => toggleCriterion(trilhaIndex, sectionIndex, criterionIndex)}
          onToggleCriterionMandatory={(sectionIndex, criterionIndex) =>
            toggleCriterionMandatory(trilhaIndex, sectionIndex, criterionIndex)
          }
          isEditing={isEditing}
          // Removidos quaisquer props que mexem com seções (edit, add, remove)
          onAddCriterion={onAddCriterion}
          onRemoveCriterion={onRemoveCriterion}
          onEditCriterionName={onEditCriterionName}
          onEditCriterionDescription={onEditCriterionDescription}
          onEditCriterionWeight={onEditCriterionWeight}
        />
      ))}
      {/* Sem botão de adicionar trilha */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white ">
        <div className="flex items-center justify-between px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-800">Critérios de Avaliação</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-md bg-[#08605f] px-4 py-2 font-medium text-white hover:bg-[#064d4a]"
            type="button"
          >
            {isEditing ? (
              <>
                <span className="hidden lg:inline">Salvar alterações</span>
                <span className="inline lg:hidden">Salvar</span>
              </>
            ) : (
              <>
                <span className="hidden lg:inline">Editar</span>
                <span className="inline lg:hidden">Editar</span>
              </>
            )}
          </button>
        </div>
        <div className="border-t border-gray-200">
          <TabsContent activeTab={activeTab} onChangeTab={setActiveTab} tabs={["trilha"]} itemClasses={{ trilha: "ml-4 px-10 py-3" }} />
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
