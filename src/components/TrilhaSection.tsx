import React from "react";
import IndividualCriterion from "./IndividualCriterion";

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
interface TrilhaSectionProps {
  trilhaName: string;
  sections: Section[];
  trilhaIndex: number;
  isTrilhaExpanded: boolean;
  onToggleTrilha: () => void;
  expandedCriteria: { [sectionIndex: number]: { [criterionIndex: number]: boolean } };
  onToggleCriterion: (sectionIndex: number, criterionIndex: number) => void;
  onToggleCriterionMandatory: (sectionIndex: number, criterionIndex: number) => void;
  isEditing: boolean;
  onEditTrilhaName: (trilhaIndex: number, novoNome: string) => void;
  onAddCriterion: (trilhaIndex: number, sectionIndex: number) => void;
  onRemoveCriterion: (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => void;
  onEditCriterionName: (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoNome: string) => void;
  onEditCriterionDescription: (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novaDescricao: string) => void;
  onEditCriterionWeight: (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoPeso: string) => void;
  onRemoveTrilha: (trilhaIndex: number) => void;
  onRemoveSection: (trilhaIndex: number, sectionIndex: number) => void;
  onEditSectionTitle: (trilhaIndex: number, sectionIndex: number, novoTitulo: string) => void;
  pesoPlaceholder?: string;
  descricaoPlaceholder?: string;
}

const TrilhaSection: React.FC<TrilhaSectionProps> = ({
  trilhaName,
  sections,
  trilhaIndex,
  isTrilhaExpanded,
  onToggleTrilha,
  expandedCriteria,
  onToggleCriterion,
  onToggleCriterionMandatory,
  isEditing,
  onEditTrilhaName,
  onAddCriterion,
  onRemoveCriterion,
  onEditCriterionName,
  onEditCriterionDescription,
  onEditCriterionWeight,
  onRemoveTrilha,
  onRemoveSection,
  onEditSectionTitle,
  pesoPlaceholder,
  descricaoPlaceholder,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-500 ease-in-out">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-4 ${isEditing ? "w-full" : ""}`}>
          {isEditing ? (
            <input type="text" value={trilhaName} onChange={(e) => onEditTrilhaName(trilhaIndex, e.target.value)} className="flex-grow text-xl font-semibold text-[#08605f] border-b border-gray-300 focus:outline-none focus:ring-0 bg-white px-1" />
          ) : (
            <h2 className="text-xl font-semibold text-[#08605f]">{trilhaName}</h2>
          )}
        </div>
        {isEditing && (
          <button onClick={() => onRemoveTrilha(trilhaIndex)} className="rounded-full p-1.5 text-black border border-transparent hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center transition duration-200 cursor-pointer" type="button" aria-label="Excluir trilha" title="Excluir trilha">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
          </button>
        )}
      </div>
      {isTrilhaExpanded && (
        <div className="mt-4 space-y-6 transition-all duration-700 ease-in-out">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <input type="text" value={section.title} onChange={(e) => onEditSectionTitle(trilhaIndex, sectionIndex, e.target.value)} className="text-xl font-semibold text-gray-800 w-full max-w-full border-b border-gray-300 bg-white px-1 hover:border-gray-300 focus:border-gray-300 focus:outline-none" />
                ) : (
                  <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                )}
                {isEditing && (
                  <button onClick={() => onRemoveSection(trilhaIndex, sectionIndex)} className="rounded-full p-1.5 text-black border border-transparent hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center transition duration-200 cursor-pointer" type="button" aria-label="Excluir seção" title="Excluir seção">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {section.criteria.map((criterion, criterionIndex) => (
                  <IndividualCriterion key={criterionIndex} name={criterion.name} isExpandable={criterion.isExpandable} isMandatory={criterion.isMandatory} initialDescription={criterion.initialDescription} initialWeight={criterion.initialWeight} onToggleMandatory={() => onToggleCriterionMandatory(sectionIndex, criterionIndex)} isExpanded={expandedCriteria[sectionIndex]?.[criterionIndex] || false} onToggleExpand={() => onToggleCriterion(sectionIndex, criterionIndex)} trilhaIndex={trilhaIndex} sectionIndex={sectionIndex} criterionIndex={criterionIndex} isEditing={isEditing} onRemoveCriterion={isEditing ? () => onRemoveCriterion(trilhaIndex, sectionIndex, criterionIndex) : undefined} onChangeName={isEditing ? (novoNome) => onEditCriterionName(trilhaIndex, sectionIndex, criterionIndex, novoNome) : undefined} onChangeDescription={isEditing ? (novaDescricao) => onEditCriterionDescription(trilhaIndex, sectionIndex, criterionIndex, novaDescricao) : undefined} onChangeWeight={isEditing ? (novoPeso) => onEditCriterionWeight(trilhaIndex, sectionIndex, criterionIndex, novoPeso) : undefined} pesoPlaceholder={pesoPlaceholder} descricaoPlaceholder={descricaoPlaceholder} />
                ))}
                {isEditing && (
                  <button onClick={() => onAddCriterion(trilhaIndex, sectionIndex)} className="mt-2 self-start rounded bg-[#08605f] px-3 py-1 text-white hover:bg-[#064d4a] flex items-center gap-1" type="button" title="Adicionar critério">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrilhaSection;
