import React from 'react';

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
}

const IndividualCriterion: React.FC<IndividualCriterionProps> = ({
  name,
  isExpandable,
  initialDescription = '',
  initialWeight = '',
  isMandatory,
  onToggleMandatory,
  isExpanded,
  onToggleExpand,
  trilhaIndex,
  sectionIndex,
  criterionIndex,
}) => {
  const mandatoryToggleId = `mandatory-${trilhaIndex}-${sectionIndex}-${criterionIndex}`;

  return (
    <div className="border border-gray-200 rounded-md mb-4 bg-white">
      <div
        className={`flex justify-between items-center p-4 ${
          isExpandable ? 'cursor-pointer' : ''
        }`}
        onClick={() => isExpandable && onToggleExpand()}
      >
        <h3 className="text-lg font-medium text-gray-800">{name}</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Campo obrigatório</span>
          <label htmlFor={mandatoryToggleId} className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id={mandatoryToggleId}
                className="sr-only"
                checked={isMandatory}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleMandatory();
                }}
              />
              <div
                className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  isMandatory ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                  isMandatory ? 'translate-x-full' : ''
                }`}
              ></div>
            </div>
          </label>
          {isExpandable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="bg-transparent focus:outline-none p-1 rounded-full hover:bg-gray-100"
              aria-label={isExpanded ? 'Recolher critério' : 'Expandir critério'}
              type="button"
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {isExpandable && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-screen opacity-100 px-4 pb-4' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`nome-criterio-${trilhaIndex}-${sectionIndex}-${criterionIndex}`} className="block text-sm font-medium text-gray-700">
                Nome do Critério
              </label>
              <input
                type="text"
                id={`nome-criterio-${trilhaIndex}-${sectionIndex}-${criterionIndex}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800"
                defaultValue={name}
                readOnly
              />
            </div>
            <div>
              <label htmlFor={`peso-${trilhaIndex}-${sectionIndex}-${criterionIndex}`} className="block text-sm font-medium text-gray-700">
                Peso
              </label>
              <input
                type="text"
                id={`peso-${trilhaIndex}-${sectionIndex}-${criterionIndex}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800"
                placeholder="Ex: 20%"
                defaultValue={initialWeight}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor={`descricao-${trilhaIndex}-${sectionIndex}-${criterionIndex}`} className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id={`descricao-${trilhaIndex}-${sectionIndex}-${criterionIndex}`}
                className="mt-1 block w-full h-28 resize-none border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-800"
                placeholder="Demonstre vontade de projeto ser executado da melhor forma"
                defaultValue={initialDescription}
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualCriterion;