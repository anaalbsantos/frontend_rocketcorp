import React from "react";

interface IndividualCriterionProps {
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  nomeLabel?: string;
  descricaoLabel?: string;
  descricaoPlaceholder?: string;
  onRemoveCriterion?: () => void;
  onChangeName?: (novoNome: string) => void;
  onChangeDescription?: (novaDescricao: string) => void;
  isEditing?: boolean;
}

const IndividualCriterion: React.FC<IndividualCriterionProps> = ({
  name,
  isExpandable,
  initialDescription = "",
  isExpanded,
  onToggleExpand,
  nomeLabel = "Nome do Critério",
  descricaoLabel = "Descrição",
  descricaoPlaceholder = "Descrição do critério.",
  onRemoveCriterion,
  onChangeName,
  onChangeDescription,
  isEditing = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <div
        className={`flex justify-between items-center p-4 ${
          isExpandable ? "cursor-pointer" : ""
        }`}
        onClick={() => isExpandable && onToggleExpand()}
      >
        <div className="flex justify-between items-center w-full">
         <input
            type="text"
            value={name}
            disabled={true}
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-lg font-medium text-gray-800 w-full"
            aria-label="Nome do critério"
          />
          {isEditing && onRemoveCriterion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCriterion();
              }}
              className="ml-2 rounded-full p-1.5 text-black border border-transparent hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center transition duration-200 cursor-pointer"
              type="button"
              aria-label="Excluir critério"
              title="Excluir critério"
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
        <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
          {isExpandable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="bg-transparent focus:outline-none p-1 rounded-full hover:bg-gray-100"
              aria-label={isExpanded ? "Recolher critério" : "Expandir critério"}
              type="button"
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {isExpandable && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-screen opacity-100 px-4 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{nomeLabel}</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800"
                value={name}
                onChange={(e) => onChangeName && onChangeName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{descricaoLabel}</label>
              <textarea
                className="mt-1 block w-full h-28 resize-none border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800"
                placeholder={descricaoPlaceholder}
                value={initialDescription}
                onChange={(e) => onChangeDescription && onChangeDescription(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualCriterion;
