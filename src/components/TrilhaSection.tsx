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
  onAddCriterion: (trilhaIndex: number, sectionIndex: number) => void;
  onRemoveCriterion: (trilhaIndex: number, sectionIndex: number, criterionIndex: number) => void;
  onEditCriterionName: (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoNome: string) => void;
  onEditCriterionDescription: (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novaDescricao: string) => void;
  onEditCriterionWeight: (trilhaIndex: number, sectionIndex: number, criterionIndex: number, novoPeso: string) => void;
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
  onAddCriterion,
  onRemoveCriterion,
  onEditCriterionName,
  onEditCriterionDescription,
  onEditCriterionWeight,
  onRemoveSection,
  onEditSectionTitle,
  pesoPlaceholder,
  descricaoPlaceholder,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-500 ease-in-out">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#08605f]">{trilhaName}</h2>
        </div>
        <div className="flex items-center ml-4 gap-2">
          <button
            onClick={onToggleTrilha}
            className="p-1 rounded-full bg-transparent hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out"
            aria-label={isTrilhaExpanded ? "Recolher trilha" : "Expandir trilha"}
            type="button"
          >
            <svg
              className={`h-5 w-5 text-[#08605f] transition-transform duration-300 ease-in-out transform ${
                isTrilhaExpanded ? "rotate-45" : "rotate-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-in-out transform-origin-top ${
          isTrilhaExpanded
            ? "max-h-[2000px] opacity-100 scale-y-100"
            : "max-h-0 opacity-0 scale-y-95"
        }`}
      >
        <div className="mt-4 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      onEditSectionTitle(trilhaIndex, sectionIndex, e.target.value)
                    }
                    className="text-xl font-semibold text-gray-800 w-full max-w-full border-b border-gray-300 bg-white px-1 hover:border-gray-300 focus:border-gray-300 focus:outline-none"
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                )}
                {isEditing && (
                  <button
                    onClick={() => onRemoveSection(trilhaIndex, sectionIndex)}
                    className="rounded-full p-1.5 text-black border border-transparent hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center transition duration-200 cursor-pointer"
                    type="button"
                    aria-label="Excluir seção"
                    title="Excluir seção"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {section.criteria.map((criterion, criterionIndex) => (
                  <IndividualCriterion
                    key={criterionIndex}
                    name={criterion.name}
                    isExpandable={criterion.isExpandable}
                    isMandatory={criterion.isMandatory}
                    initialDescription={criterion.initialDescription}
                    initialWeight={criterion.initialWeight}
                    onToggleMandatory={() =>
                      onToggleCriterionMandatory(sectionIndex, criterionIndex)
                    }
                    isExpanded={
                      expandedCriteria[sectionIndex]?.[criterionIndex] || false
                    }
                    onToggleExpand={() =>
                      onToggleCriterion(sectionIndex, criterionIndex)
                    }
                    trilhaIndex={trilhaIndex}
                    sectionIndex={sectionIndex}
                    criterionIndex={criterionIndex}
                    isEditing={isEditing}
                    onRemoveCriterion={
                      isEditing
                        ? () =>
                            onRemoveCriterion(trilhaIndex, sectionIndex, criterionIndex)
                        : undefined
                    }
                    onChangeName={
                      isEditing
                        ? (novoNome) =>
                            onEditCriterionName(
                              trilhaIndex,
                              sectionIndex,
                              criterionIndex,
                              novoNome
                            )
                        : undefined
                    }
                    onChangeDescription={
                      isEditing
                        ? (novaDescricao) =>
                            onEditCriterionDescription(
                              trilhaIndex,
                              sectionIndex,
                              criterionIndex,
                              novaDescricao
                            )
                        : undefined
                    }
                    onChangeWeight={
                      isEditing
                        ? (novoPeso) =>
                            onEditCriterionWeight(
                              trilhaIndex,
                              sectionIndex,
                              criterionIndex,
                              novoPeso
                            )
                        : undefined
                    }
                    pesoPlaceholder={pesoPlaceholder}
                    descricaoPlaceholder={descricaoPlaceholder}
                  />
                ))}

                {isEditing && (
                  <button
                    onClick={() => onAddCriterion(trilhaIndex, sectionIndex)}
                    className="mt-2 self-start rounded bg-[#08605f] px-3 py-1 text-white hover:bg-[#064d4a] flex items-center gap-1"
                    type="button"
                    title="Adicionar critério"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrilhaSection;
