import React, { useState, useMemo } from "react";
import TrilhaSection from "../../components/TrilhaSection";
import TabsContent from "../../components/TabContent";
import SearchInput from "../../components/SearchInput";

interface Criterion {
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
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

const filtrosDisponiveis = ["Todos", "Trilhas", "Criterios"];

const SECOES_FIXAS: Section[] = [
  { title: "Comportamento", criteria: [] },
  { title: "Execução", criteria: [] },
  { title: "Gestão e Liderança", criteria: [] },
];

const CriteriosAvaliacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha"),
    [searchTerm, setSearchTerm] = useState(""),
    [filtro, setFiltro] = useState("todos"),
    [isEditing, setIsEditing] = useState(false),
    trilhasBase: Omit<TrilhaData, "sections">[] = [
      { trilhaName: "Desenvolvimento" },
      { trilhaName: "Financeiro" },
      { trilhaName: "Design" },
    ],
    [trilhasData, setTrilhasData] = useState<TrilhaData[]>(() =>
      trilhasBase.map((trilha) => ({
        trilhaName: trilha.trilhaName,
        sections: SECOES_FIXAS.map((sec) => ({ title: sec.title, criteria: [] })),
      }))
    );

  React.useEffect(() => {
    setTrilhasData((prev) =>
      prev.map((trilha) => {
        if (trilha.trilhaName === "Desenvolvimento")
          return {
            ...trilha,
            sections: trilha.sections.map((sec) => {
              if (sec.title === "Comportamento")
                return {
                  ...sec,
                  criteria: [
                    { name: "Sentimento de Dono", isExpandable: true, isMandatory: true },
                    { name: "Resiliência nas adversidades", isExpandable: true, isMandatory: true },
                    { name: "Organização no Trabalho", isExpandable: true, isMandatory: true },
                    { name: "Capacidade de aprender", isExpandable: true, isMandatory: true },
                    { name: 'Ser "team player"', isExpandable: true, isMandatory: true },
                  ],
                };
              if (sec.title === "Execução")
                return {
                  ...sec,
                  criteria: [
                    { name: "Entregar com qualidade", isExpandable: true, isMandatory: true },
                    { name: "Atender aos prazos", isExpandable: true, isMandatory: true },
                    { name: "Fazer mais com menos", isExpandable: true, isMandatory: true },
                    { name: "Pensar fora da caixa", isExpandable: true, isMandatory: true },
                  ],
                };
              if (sec.title === "Gestão e Liderança")
                return {
                  ...sec,
                  criteria: [
                    { name: "Gente", isExpandable: true, isMandatory: true },
                    { name: "Resultados", isExpandable: true, isMandatory: true },
                    { name: "Evolução da Rocket Corp", isExpandable: true, isMandatory: true },
                  ],
                };
              return sec;
            }),
          };
        if (["Financeiro", "Design"].includes(trilha.trilhaName))
          return {
            ...trilha,
            sections: trilha.sections.map((sec) => ({ ...sec, criteria: [] })),
          };
        return trilha;
      })
    );
  }, []);

  const [expandedTrilhas, setExpandedTrilhas] = React.useState<{ [key: number]: boolean }>(() => {
      const initialState: { [key: number]: boolean } = {};
      trilhasData.forEach((_, i) => (initialState[i] = true));
      return initialState;
    }),
    [expandedCriteria, setExpandedCriteria] = React.useState<{
      [trilhaIndex: number]: { [sectionIndex: number]: { [criterionIndex: number]: boolean } };
    }>({}),
    [expandedSections, setExpandedSections] = React.useState<{ [trilhaIndex: number]: { [sectionIndex: number]: boolean } }>(() => {
      const initialState: { [trilhaIndex: number]: { [sectionIndex: number]: boolean } } = {};
      trilhasData.forEach((_, tIndex) => {
        initialState[tIndex] = {};
        SECOES_FIXAS.forEach((_, sIndex) => (initialState[tIndex][sIndex] = true));
      });
      return initialState;
    });

  const toggleTrilha = (trilhaIndex: number) => setExpandedTrilhas((prev) => ({ ...prev, [trilhaIndex]: !prev[trilhaIndex] })),
    toggleCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) =>
      setExpandedCriteria((prev) => ({
        ...prev,
        [trilhaIndex]: {
          ...prev[trilhaIndex],
          [sectionIndex]: {
            ...(prev[trilhaIndex]?.[sectionIndex] || {}),
            [criterionIndex]: !(prev[trilhaIndex]?.[sectionIndex]?.[criterionIndex] || false),
          },
        },
      })),
    toggleCriterionMandatory = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) =>
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
      ),
    toggleSection = (trilhaIndex: number, sectionIndex: number) =>
      setExpandedSections((prev) => ({
        ...prev,
        [trilhaIndex]: { ...prev[trilhaIndex], [sectionIndex]: !prev[trilhaIndex]?.[sectionIndex] },
      })),
    onEditCriterionName = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoNome: string) =>
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
      ),
    onEditCriterionDescription = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novaDescricao: string) =>
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
      ),
    onRemoveCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) =>
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
      ),
    onAddCriterion = (trilhaIndex: number, sectionIndex: number) => {
      const novoCriterion: Criterion = { name: "Novo Critério", isExpandable: true, initialDescription: "", isMandatory: false };
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

  const contemTodasPalavras = (texto: string, termo: string) => {
    const palavras = termo.toLowerCase().split(" ").filter(Boolean);
    return palavras.every((palavra) => texto.toLowerCase().includes(palavra));
  };

  const trilhasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return trilhasData;
    if (filtro === "trilhas") return trilhasData.filter((trilha) => contemTodasPalavras(trilha.trilhaName, searchTerm));
    if (filtro === "criterios")
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

  const placeholderBusca = filtro === "trilhas" ? "Buscar trilhas" : filtro === "criterios" ? "Buscar critérios" : "Buscar";

  const trilhaContent = (
    <div className="mx-auto mt-6 w-[1550px] max-w-full">
      {trilhasFiltradas.map((trilha, i) => (
        <TrilhaSection
          key={i}
          trilhaName={trilha.trilhaName}
          sections={trilha.sections}
          trilhaIndex={i}
          isTrilhaExpanded={expandedTrilhas[i] || false}
          onToggleTrilha={() => toggleTrilha(i)}
          expandedCriteria={expandedCriteria[i] || {}}
          onToggleCriterion={(sectionIndex, criterionIndex) => toggleCriterion(i, sectionIndex, criterionIndex)}
          onToggleCriterionMandatory={(sectionIndex, criterionIndex) => toggleCriterionMandatory(i, sectionIndex, criterionIndex)}
          isEditing={isEditing}
          onAddCriterion={onAddCriterion}
          onRemoveCriterion={onRemoveCriterion}
          onEditCriterionName={onEditCriterionName}
          onEditCriterionDescription={onEditCriterionDescription}
          expandedSections={expandedSections[i] || {}}
          onToggleSection={(sectionIndex) => toggleSection(i, sectionIndex)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white">
        <div className="flex items-center justify-between px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-800">Critérios de Avaliação</h1>
          <button onClick={() => setIsEditing(!isEditing)} type="button" className="rounded-md bg-[#08605f] px-4 py-2 font-medium text-white hover:bg-[#064d4a]">
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
