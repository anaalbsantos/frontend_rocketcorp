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

const CriteriosAvaliacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("todos"); // filtro que controla busca: todos, trilhas, criterios
  const [isEditing, setIsEditing] = useState(false);

  const [trilhasData, setTrilhasData] = useState<TrilhaData[]>([
    {
      trilhaName: "Trilha de Financeiro",
      sections: [
        {
          title: "Critérios de Postura",
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
        },
        {
          title: "Critérios de Habilidade Técnica",
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
        },
      ],
    },
    {
      trilhaName: "Trilha de Design",
      sections: [
        {
          title: "Critérios de Design",
          criteria: [
            {
              name: "Criatividade",
              isExpandable: true,
              initialDescription: "Capacidade de gerar ideias inovadoras",
              initialWeight: "30%",
              isMandatory: true,
            },
            { name: "User Experience (UX)", isExpandable: true, isMandatory: true },
            { name: "Design Responsivo", isExpandable: true, isMandatory: true },
          ],
        },
      ],
    },
  ]);

  // === Estados e funções para expandir/contrair e editar ===
  const [expandedTrilhas, setExpandedTrilhas] = React.useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    trilhasData.forEach((_, i) => (initialState[i] = true));
    return initialState;
  });

  const [expandedCriteria, setExpandedCriteria] = React.useState<{ [trilhaIndex: number]: { [sectionIndex: number]: { [criterionIndex: number]: boolean } } }>({});

  const toggleTrilha = (trilhaIndex: number) => setExpandedTrilhas((prev) => ({ ...prev, [trilhaIndex]: !prev[trilhaIndex] }));

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
                        cIndex !== criterionIndex ? criterion : { ...criterion, isMandatory: !criterion.isMandatory },
                      ),
                    },
              ),
            },
      ),
    );
  };

  const onEditTrilhaName = (trilhaIndex: number, novoNome: string) => {
    setTrilhasData((prev) => prev.map((trilha, i) => (i === trilhaIndex ? { ...trilha, trilhaName: novoNome } : trilha)));
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
                  : { ...section, criteria: section.criteria.map((criterion, cIndex) => (cIndex !== criterionIndex ? criterion : { ...criterion, name: novoNome })) },
              ),
            },
      ),
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
                  : { ...section, criteria: section.criteria.map((criterion, cIndex) => (cIndex !== criterionIndex ? criterion : { ...criterion, initialDescription: novaDescricao })) },
              ),
            },
      ),
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
                  : { ...section, criteria: section.criteria.map((criterion, cIndex) => (cIndex !== criterionIndex ? criterion : { ...criterion, initialWeight: novoPeso })) },
              ),
            },
      ),
    );
  };

  const onEditSectionTitle = (trilhaIndex: number, sectionIndex: number, novoTitulo: string) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex ? trilha : { ...trilha, sections: trilha.sections.map((section, sIndex) => (sIndex !== sectionIndex ? section : { ...section, title: novoTitulo })) },
      ),
    );
  };

  const onRemoveCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : { ...trilha, sections: trilha.sections.map((section, sIndex) => (sIndex !== sectionIndex ? section : { ...section, criteria: section.criteria.filter((_, cIndex) => cIndex !== criterionIndex) })) },
      ),
    );
  };

  const onRemoveSection = (trilhaIndex: number, sectionIndex: number) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) => (tIndex !== trilhaIndex ? trilha : { ...trilha, sections: trilha.sections.filter((_, sIndex) => sIndex !== sectionIndex) })),
    );
  };

  const onAddCriterion = (trilhaIndex: number, sectionIndex: number) => {
    const novoCriterion: Criterion = { name: "Novo Critério", isExpandable: true, initialDescription: "", initialWeight: "", isMandatory: false };
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : { ...trilha, sections: trilha.sections.map((section, sIndex) => (sIndex !== sectionIndex ? section : { ...section, criteria: [...section.criteria, novoCriterion] })) },
      ),
    );
  };

  const onRemoveTrilha = (trilhaIndex: number) => {
    setTrilhasData((prev) => prev.filter((_, i) => i !== trilhaIndex));
    setExpandedTrilhas((prev) => {
      const copy = { ...prev };
      delete copy[trilhaIndex];
      return copy;
    });
  };

  const onAddTrilha = () => {
    const novaTrilha: TrilhaData = { trilhaName: "Nova Trilha", sections: [{ title: "Nova Seção", criteria: [] }] };
    setTrilhasData((prev) => [...prev, novaTrilha]);
    setExpandedTrilhas((prev) => ({ ...prev, [trilhasData.length]: true }));
  };

  // === FILTRO E BUSCA ===

  // Verifica se uma string contém todas as palavras do termo (case insensitive)
  const contemTodasPalavras = (texto: string, termo: string) => {
    const palavras = termo.toLowerCase().split(" ").filter(Boolean);
    return palavras.every((palavra) => texto.toLowerCase().includes(palavra));
  };

  // Filtra as trilhas e critérios conforme filtro e termo de busca
  const trilhasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return trilhasData; // busca vazia retorna tudo

    if (filtro === "trilhas") {
      // Retorna as trilhas que contenham o termo no nome, com todos os critérios intactos
      return trilhasData.filter((trilha) => contemTodasPalavras(trilha.trilhaName, searchTerm));
    }

    if (filtro === "criterios") {
      // Retorna trilhas que tenham pelo menos um critério que bate, mas mantém só os critérios filtrados
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

    // Filtro "todos": busca tanto na trilha quanto nos critérios
    return trilhasData
      .map((trilha) => {
        const trilhaBate = contemTodasPalavras(trilha.trilhaName, searchTerm);

        const sectionsFiltradas = trilha.sections
          .map((section) => {
            const criteriosFiltrados = section.criteria.filter((criterion) => contemTodasPalavras(criterion.name, searchTerm));
            // Mantém a seção se houver critérios filtrados ou se a trilha bate (para mostrar seção vazia só se trilha bate)
            if (criteriosFiltrados.length > 0) return { ...section, criteria: criteriosFiltrados };
            if (trilhaBate) return { ...section, criteria: [...section.criteria] }; // se trilha bate, mantém todos critérios
            return null;
          })
          .filter(Boolean) as Section[];

        if (trilhaBate || sectionsFiltradas.length > 0) return { ...trilha, sections: sectionsFiltradas };
        return null;
      })
      .filter(Boolean) as TrilhaData[];
  }, [searchTerm, filtro, trilhasData]);

  // Placeholder dinâmico conforme filtro
  const placeholderBusca =
    filtro === "trilhas" ? "Buscar trilhas" : filtro === "criterios" ? "Buscar critérios" : "Buscar";

  // Conteúdo das trilhas filtradas para exibir
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
          onToggleCriterionMandatory={(sectionIndex, criterionIndex) => toggleCriterionMandatory(trilhaIndex, sectionIndex, criterionIndex)}
          isEditing={isEditing}
          onEditTrilhaName={onEditTrilhaName}
          onAddCriterion={onAddCriterion}
          onRemoveCriterion={onRemoveCriterion}
          onEditCriterionName={onEditCriterionName}
          onEditCriterionDescription={onEditCriterionDescription}
          onEditCriterionWeight={onEditCriterionWeight}
          onRemoveTrilha={onRemoveTrilha}
          onRemoveSection={onRemoveSection}
          onEditSectionTitle={onEditSectionTitle}
          pesoPlaceholder="Digite o peso aqui (ex: 30%)"
          descricaoPlaceholder="Descreva o critério de forma clara e objetiva"
        />
      ))}
      {isEditing && (
        <button
          onClick={onAddTrilha}
          className="mt-4 rounded bg-[#08605f] px-4 py-2 text-white hover:bg-[#064d4a] flex items-center gap-1"
          type="button"
          title="Adicionar trilha"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
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
        </div >
        {activeTab === "trilha" && trilhaContent}
      </div>
    </div>
  );
};

export default CriteriosAvaliacao;
