import React, { useState } from "react";
import TrilhaSection from "../../components/TrilhaSection";
import TabsContent from "../../components/TabContent";

interface Criterion {
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
  initialWeight?: string;
  isMandatory?: boolean;
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

  const trilhasData: TrilhaData[] = [
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
            {
              name: "Resiliência nas adversidades",
              isExpandable: true,
              isMandatory: true,
            },
            {
              name: "Organização no trabalho",
              isExpandable: true,
              isMandatory: true,
            },
            {
              name: 'Ser "team player"',
              isExpandable: true,
              isMandatory: true,
            },
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
            {
              name: "Conhecimento de Mercado",
              isExpandable: true,
              isMandatory: true,
            },
            {
              name: "Gestão de Orçamento",
              isExpandable: true,
              isMandatory: true,
            },
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
            {
              name: "User Experience (UX)",
              isExpandable: true,
              isMandatory: true,
            },
            {
              name: "Design Responsivo",
              isExpandable: true,
              isMandatory: true,
            },
          ],
        },
      ],
    },
  ];

  const [expandedTrilhas, setExpandedTrilhas] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    trilhasData.forEach((_, i) => {
      initialState[i] = true;
    });
    return initialState;
  });

  const [expandedCriteria, setExpandedCriteria] = useState<{
    [trilhaIndex: number]: {
      [sectionIndex: number]: { [criterionIndex: number]: boolean };
    };
  }>({});

  const toggleTrilha = (trilhaIndex: number) => {
    setExpandedTrilhas((prev) => ({
      ...prev,
      [trilhaIndex]: !prev[trilhaIndex],
    }));
  };

  const toggleCriterion = (
    trilhaIndex: number,
    sectionIndex: number,
    criterionIndex: number
  ) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [trilhaIndex]: {
        ...prev[trilhaIndex],
        [sectionIndex]: {
          ...(prev[trilhaIndex]?.[sectionIndex] || {}),
          [criterionIndex]: !(
            prev[trilhaIndex]?.[sectionIndex]?.[criterionIndex] || false
          ),
        },
      },
    }));
  };

  const toggleCriterionMandatory = (
    trilhaIndex: number,
    sectionIndex: number,
    criterionIndex: number
  ) => {
    console.log(
      `Toggled obrigatório: Trilha ${trilhaIndex}, Seção ${sectionIndex}, Critério ${criterionIndex}`
    );
  };

  const trilhaContent = (
    <div className="mx-auto mt-6 w-[1550px]">
      {trilhasData.map((trilha, trilhaIndex) => (
        <TrilhaSection
          key={trilhaIndex}
          trilhaName={trilha.trilhaName}
          sections={trilha.sections}
          trilhaIndex={trilhaIndex}
          isTrilhaExpanded={expandedTrilhas[trilhaIndex] || false}
          onToggleTrilha={() => toggleTrilha(trilhaIndex)}
          expandedCriteria={expandedCriteria[trilhaIndex] || {}}
          onToggleCriterion={(sectionIndex, criterionIndex) =>
            toggleCriterion(trilhaIndex, sectionIndex, criterionIndex)
          }
          onToggleCriterionMandatory={(sectionIndex, criterionIndex) =>
            toggleCriterionMandatory(trilhaIndex, sectionIndex, criterionIndex)
          }
        />
      ))}
    </div>
  );

  const unidadeContent = (
    <div className="mx-auto mt-6 w-[1550px] rounded-md bg-white p-4 shadow-md">
      <p className="text-gray-600">esperando</p>
      <p className="mt-2 text-sm text-gray-500">
        ainda n sei oq colocar.
      </p>
    </div>
  );

  const tabs = ["trilha", "unidade"];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="shadow-sm bg-white">
        <div className="flex items-center justify-between px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-800">Critérios de Avaliação</h1>
          <button className="rounded-md bg-[#08605f] px-2 py-1 font-medium text-white transition duration-150 ease-in-out hover:bg-[#064d4a]">
            Salvar alterações
          </button>
        </div>
        <TabsContent
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabs={tabs}
          itemClasses={{
            trilha: "ml-4 px-10 py-3",
            unidade: "px-6 py-3",
          }}
        />
      </div>
      <div className="px-4 py-6">
        <div className="mx-auto mb-6 flex w-[1550px] items-center rounded-md bg-gray-50 p-4 shadow-sm">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por colaboradores"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-[#08605f] focus:outline-none focus:ring-[#08605f] sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="ml-4 rounded-md border border-[#08605f] bg-[#08605f] p-2 text-white focus:outline-none focus:ring-[#08605f] hover:bg-[#064d4a]">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {activeTab === "trilha" && trilhaContent}
        {activeTab === "unidade" && unidadeContent}
      </div>
    </div>
  );
};

export default CriteriosAvaliacao;
