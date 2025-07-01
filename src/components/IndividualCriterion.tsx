import React from "react";

interface IndividualCriterionProps {
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
  initialWeight?: string;
  isMandatory: boolean;
  onToggleMandatory: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  trilhaIndex: number;
  sectionIndex: number;
  criterionIndex: number;
  nomeLabel?: string;
  pesoLabel?: string;
  descricaoLabel?: string;
  descricaoPlaceholder?: string;
  pesoPlaceholder?: string;
  campoObrigatorioLabel?: string;
  onRemoveCriterion?: () => void;
  onChangeName?: (novoNome: string) => void;
  onChangeDescription?: (novaDescricao: string) => void;
  onChangeWeight?: (novoPeso: string) => void;
  isEditing?: boolean;
}

const IndividualCriterion: React.FC<IndividualCriterionProps> = ({
  name,
  isExpandable,
  initialDescription = "",
  initialWeight = "",
  isMandatory,
  onToggleMandatory,
  isExpanded,
  onToggleExpand,
  trilhaIndex,
  sectionIndex,
  criterionIndex,
  nomeLabel = "Nome do Critério",
  pesoLabel = "Peso",
  descricaoLabel = "Descrição",
  descricaoPlaceholder = "Demonstre vontade de projeto ser executado da melhor forma",
  pesoPlaceholder = "Ex: 20%",
  campoObrigatorioLabel = "Campo obrigatório",
  onRemoveCriterion,
  onChangeName,
  onChangeDescription,
  onChangeWeight,
  isEditing = false,
}) => {
  const mandatoryToggleId = `mandatory-${trilhaIndex}-${sectionIndex}-${criterionIndex}`;

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <div className={`flex justify-between items-center p-4 ${isExpandable ? "cursor-pointer" : ""}`} onClick={() => isExpandable && onToggleExpand()}>
        <div className="flex justify-between items-center w-full">
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName && onChangeName(e.target.value)}
            disabled={!isEditing}
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-lg font-medium text-gray-800 w-full max-w-xs"
            aria-label="Nome do critério"
          />
          {isEditing && onRemoveCriterion && (
            <button onClick={(e) => { e.stopPropagation(); onRemoveCriterion(); }} className="ml-2 rounded-full p-1.5 text-black border border-transparent hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center transition duration-200 cursor-pointer" type="button" aria-label="Excluir critério" title="Excluir critério">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
          {!isEditing && (
            <span className={`text-sm ${isMandatory ? "text-black" : "text-gray-400"} hidden xl:inline whitespace-nowrap`}>{campoObrigatorioLabel}</span>
          )}
          {!isEditing && (
            <label htmlFor={mandatoryToggleId} className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" id={mandatoryToggleId} className="sr-only" checked={isMandatory} onChange={onToggleMandatory} />
                <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ease-in-out ${isMandatory ? "bg-teal-600" : "bg-gray-300"}`} />
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isMandatory ? "translate-x-full" : ""}`} />
              </div>
            </label>
          )}
          {isExpandable && (
            <button onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} className="bg-transparent focus:outline-none p-1 rounded-full hover:bg-gray-100" aria-label={isExpanded ? "Recolher critério" : "Expandir critério"} type="button">
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {isExpandable && (
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-screen opacity-100 px-4 pb-4" : "max-h-0 opacity-0"}`}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{nomeLabel}</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800" value={name} onChange={(e) => onChangeName && onChangeName(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{pesoLabel}</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800" placeholder={pesoPlaceholder || "Ex: 20%"} value={initialWeight} onChange={(e) => onChangeWeight && onChangeWeight(e.target.value)} disabled={!isEditing} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{descricaoLabel}</label>
              <textarea className="mt-1 block w-full h-28 resize-none border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800" placeholder={descricaoPlaceholder} value={initialDescription} onChange={(e) => onChangeDescription && onChangeDescription(e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualCriterion;
