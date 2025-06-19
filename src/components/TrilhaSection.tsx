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
  expandedCriteria: {
    [sectionIndex: number]: { [criterionIndex: number]: boolean };
  };
  onToggleCriterion: (sectionIndex: number, criterionIndex: number) => void;
  onToggleCriterionMandatory: (
    sectionIndex: number,
    criterionIndex: number
  ) => void;
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
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 transition-all duration-500 ease-in-out">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#08605f]">{trilhaName}</h2>
        <button
          onClick={onToggleTrilha}
          className="p-1 transition duration-150 ease-in-out rounded-full bg-transparent hover:bg-gray-100 focus:outline-none"
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
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      </div>

      <div
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          isTrilhaExpanded
            ? "max-h-[2000px] opacity-100 scale-y-100"
            : "max-h-0 opacity-0 scale-y-95"
        } transform origin-top`}
      >
        <div className="mt-4 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-md"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                {section.title}
              </h3>
              {section.criteria.map((criterion, criterionIndex) => (
                <IndividualCriterion
                  key={criterionIndex}
                  name={criterion.name}
                  isExpandable={true}
                  isMandatory={criterion.isMandatory ?? false}
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
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrilhaSection;
