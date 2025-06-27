import React, { useState } from "react";
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

const CriteriosAvaliacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [trilhasData, setTrilhasData] = useState<TrilhaData[]>([
    {
      trilhaName: "Trilha de Financeiro",
      sections: [
        {
          title: "Critérios de Postura",
          criteria: [
            { name: "Sentimento de Dono", isExpandable: true, initialDescription: "Demonstre vontade de projeto ser executado da melhor forma", initialWeight: "20%", isMandatory: true },
            { name: "Resiliência nas adversidades", isExpandable: true, isMandatory: true },
            { name: "Organização no trabalho", isExpandable: true, isMandatory: true },
            { name: 'Ser "team player"', isExpandable: true, isMandatory: true },
          ],
        },
        {
          title: "Critérios de Habilidade Técnica",
          criteria: [
            { name: "Análise de Dados", isExpandable: true, initialDescription: "Capacidade de interpretar e usar dados financeiros", initialWeight: "25%", isMandatory: true },
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
            { name: "Criatividade", isExpandable: true, initialDescription: "Capacidade de gerar ideias inovadoras", initialWeight: "30%", isMandatory: true },
            { name: "User Experience (UX)", isExpandable: true, isMandatory: true },
            { name: "Design Responsivo", isExpandable: true, isMandatory: true },
          ],
        },
      ],
    },
  ]);

  const [expandedTrilhas, setExpandedTrilhas] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    trilhasData.forEach((_, i) => (initialState[i] = true));
    return initialState;
  });

  const [expandedCriteria, setExpandedCriteria] = useState<{ [trilhaIndex: number]: { [sectionIndex: number]: { [criterionIndex: number]: boolean } } }>({});

  const toggleTrilha = (trilhaIndex: number) => setExpandedTrilhas(prev => ({ ...prev, [trilhaIndex]: !prev[trilhaIndex] }));

  const toggleCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
    setExpandedCriteria(prev => ({
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
    setTrilhasData(prev =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              sections: trilha.sections.map((section, sIndex) =>
                sIndex !== sectionIndex
                  ? section
                  : { ...section, criteria: section.criteria.map((criterion, cIndex) => (cIndex !== criterionIndex ? criterion : { ...criterion, isMandatory: !criterion.isMandatory })) },
              ),
            },
      ),
    );
  };

  const onEditTrilhaName = (trilhaIndex: number, novoNome: string) => {
    setTrilhasData(prev => prev.map((trilha, i) => (i === trilhaIndex ? { ...trilha, trilhaName: novoNome } : trilha)));
  };

  const onEditCriterionName = (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoNome: string) => {
    setTrilhasData(prev =>
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
    setTrilhasData(prev =>
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
    setTrilhasData(prev =>
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
    setTrilhasData(prev =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex ? trilha : { ...trilha, sections: trilha.sections.map((section, sIndex) => (sIndex !== sectionIndex ? section : { ...section, title: novoTitulo })) },
      ),
    );
  };

  const onRemoveCriterion = (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => {
    setTrilhasData(prev =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : { ...trilha, sections: trilha.sections.map((section, sIndex) => (sIndex !== sectionIndex ? section : { ...section, criteria: section.criteria.filter((_, cIndex) => cIndex !== criterionIndex) })) },
      ),
    );
  };

  const onRemoveSection = (trilhaIndex: number, sectionIndex: number) => {
    setTrilhasData(prev =>
      prev.map((trilha, tIndex) => (tIndex !== trilhaIndex ? trilha : { ...trilha, sections: trilha.sections.filter((_, sIndex) => sIndex !== sectionIndex) })),
    );
  };

  const onAddCriterion = (trilhaIndex: number, sectionIndex: number) => {
    const novoCriterion: Criterion = { name: "Novo Critério", isExpandable: true, initialDescription: "", initialWeight: "", isMandatory: false };
    setTrilhasData(prev =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : { ...trilha, sections: trilha.sections.map((section, sIndex) => (sIndex !== sectionIndex ? section : { ...section, criteria: [...section.criteria, novoCriterion] })) },
      ),
    );
  };

  const onRemoveTrilha = (trilhaIndex: number) => {
    setTrilhasData(prev => prev.filter((_, i) => i !== trilhaIndex));
    setExpandedTrilhas(prev => {
      const copy = { ...prev };
      delete copy[trilhaIndex];
      return copy;
    });
  };

  const onAddTrilha = () => {
    const novaTrilha: TrilhaData = { trilhaName: "Nova Trilha", sections: [{ title: "Nova Seção", criteria: [] }] };
    setTrilhasData(prev => [...prev, novaTrilha]);
    setExpandedTrilhas(prev => ({ ...prev, [trilhasData.length]: true }));
  };

  const trilhaContent = (
    <div className="mx-auto mt-6 w-[1550px] max-w-full">
      {trilhasData.map((trilha, trilhaIndex) => (
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
        <button onClick={onAddTrilha} className="mt-4 rounded bg-[#08605f] px-4 py-2 text-white hover:bg-[#064d4a] flex items-center gap-1" type="button" title="Adicionar trilha">
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
          <button onClick={() => setIsEditing(!isEditing)} className="rounded-md bg-[#08605f] px-4 py-2 font-medium text-white hover:bg-[#064d4a]" type="button">
            {isEditing ? <><span className="hidden lg:inline">Salvar alterações</span><span className="inline lg:hidden">Salvar</span></> : <><span className="hidden lg:inline">Editar</span><span className="inline lg:hidden">Editar</span></>}
          </button>
        </div>
        <div className="border-t border-gray-200"><TabsContent activeTab={activeTab} onChangeTab={setActiveTab} tabs={["trilha"]} itemClasses={{ trilha: "ml-4 px-10 py-3" }} /></div>
      </div>
      <div className="py-6 px-4">
        <div className="mx-auto mb-6 w-[1550px] max-w-full flex items-center gap-4 rounded-md bg-gray-50 p-4 shadow-sm">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por colaboradores" className="flex-grow min-w-0" />
          <button className="flex-shrink-0 rounded-md border border-[#08605f] bg-[#08605f] p-2 text-white hover:bg-[#064d4a] flex items-center justify-center" type="button">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {activeTab === "trilha" && trilhaContent}
      </div>
    </div>
  );
};

export default CriteriosAvaliacao;
