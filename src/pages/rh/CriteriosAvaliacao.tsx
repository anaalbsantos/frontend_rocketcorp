import React, { useState, useMemo } from "react";
import TrilhaSection from "../../components/TrilhaSection";
import SearchInput from "../../components/SearchInput";

interface Criterion {
  name: string;
  isExpandable: boolean;
  initialDescription?: string;
  initialWeight?: string;
  isMandatory: boolean;
}

interface TrilhaData {
  trilhaName: string;
  criteria: Criterion[];
}

const filtrosDisponiveis = ["todos", "trilhas", "criterios"];

const trilhasFixas: TrilhaData[] = [
  {
    trilhaName: "DESENVOLVIMENTO",
    criteria: [
      { name: "Critério A", isExpandable: true, initialDescription: "Descrição do Critério A", initialWeight: "30%", isMandatory: false },
      { name: "Critério B", isExpandable: true, initialDescription: "Descrição do Critério B", initialWeight: "20%", isMandatory: true },
    ],
  },
  {
    trilhaName: "DESIGN",
    criteria: [
      { name: "Critério C", isExpandable: true, initialDescription: "Descrição do Critério C", initialWeight: "50%", isMandatory: false },
    ],
  },
  {
    trilhaName: "FINANCEIRO",
    criteria: [
      { name: "Critério D", isExpandable: true, initialDescription: "Descrição do Critério D", initialWeight: "40%", isMandatory: true },
    ],
  },
];

const CriteriosAvaliacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [isEditing, setIsEditing] = useState(false);
  const [trilhasData, setTrilhasData] = useState<TrilhaData[]>(trilhasFixas);
  const [expandedTrilhas, setExpandedTrilhas] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
  });
  const [expandedCriteria, setExpandedCriteria] = useState<{ [trilhaIndex: number]: { [criterionIndex: number]: boolean } }>({});

  // Toggle trilha expandida
  const toggleTrilha = (trilhaIndex: number) =>
    setExpandedTrilhas((prev) => ({ ...prev, [trilhaIndex]: !prev[trilhaIndex] }));

  // Toggle critério expandido
  const toggleCriterion = (trilhaIndex: number, criterionIndex: number) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [trilhaIndex]: {
        ...(prev[trilhaIndex] || {}),
        [criterionIndex]: !(prev[trilhaIndex]?.[criterionIndex] || false),
      },
    }));
  };

  // Toggle critério obrigatório
  const toggleCriterionMandatory = (trilhaIndex: number, criterionIndex: number) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              criteria: trilha.criteria.map((criterion, cIndex) =>
                cIndex !== criterionIndex ? criterion : { ...criterion, isMandatory: !criterion.isMandatory }
              ),
            }
      )
    );
  };

  // Editar nome critério
  const onEditCriterionName = (trilhaIndex: number, criterionIndex: number, novoNome: string) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              criteria: trilha.criteria.map((criterion, cIndex) =>
                cIndex !== criterionIndex ? criterion : { ...criterion, name: novoNome }
              ),
            }
      )
    );
  };

  // Editar descrição critério
  const onEditCriterionDescription = (trilhaIndex: number, criterionIndex: number, novaDescricao: string) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              criteria: trilha.criteria.map((criterion, cIndex) =>
                cIndex !== criterionIndex ? criterion : { ...criterion, initialDescription: novaDescricao }
              ),
            }
      )
    );
  };

  // Editar peso critério
  const onEditCriterionWeight = (trilhaIndex: number, criterionIndex: number, novoPeso: string) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : {
              ...trilha,
              criteria: trilha.criteria.map((criterion, cIndex) =>
                cIndex !== criterionIndex ? criterion : { ...criterion, initialWeight: novoPeso }
              ),
            }
      )
    );
  };

  // Adicionar critério
  const onAddCriterion = (trilhaIndex: number) => {
    const novoCriterion: Criterion = {
      name: "Novo Critério",
      isExpandable: true,
      initialDescription: "",
      initialWeight: "",
      isMandatory: false,
    };
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : { ...trilha, criteria: [...trilha.criteria, novoCriterion] }
      )
    );
  };

  // Remover critério
  const onRemoveCriterion = (trilhaIndex: number, criterionIndex: number) => {
    setTrilhasData((prev) =>
      prev.map((trilha, tIndex) =>
        tIndex !== trilhaIndex
          ? trilha
          : { ...trilha, criteria: trilha.criteria.filter((_, cIndex) => cIndex !== criterionIndex) }
      )
    );
  };

  // Função para verificar se todas palavras do termo estão contidas no texto
  const contemTodasPalavras = (texto: string, termo: string) => {
    const palavras = termo.toLowerCase().split(" ").filter(Boolean);
    return palavras.every((palavra) => texto.toLowerCase().includes(palavra));
  };

  // Filtrar trilhas e critérios
  const trilhasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return trilhasData;

    if (filtro === "trilhas") {
      return trilhasData.filter((trilha) => contemTodasPalavras(trilha.trilhaName, searchTerm));
    }

    if (filtro === "criterios") {
      return trilhasData
        .map((trilha) => {
          const criteriosFiltrados = trilha.criteria.filter((criterion) => contemTodasPalavras(criterion.name, searchTerm));
          if (criteriosFiltrados.length === 0) return null;
          return { ...trilha, criteria: criteriosFiltrados };
        })
        .filter(Boolean) as TrilhaData[];
    }

    // filtro 'todos'
    return trilhasData
      .map((trilha) => {
        const trilhaBate = contemTodasPalavras(trilha.trilhaName, searchTerm);

        if (trilhaBate) return trilha;

        const criteriosFiltrados = trilha.criteria.filter((criterion) => contemTodasPalavras(criterion.name, searchTerm));

        if (criteriosFiltrados.length > 0) return { ...trilha, criteria: criteriosFiltrados };

        return null;
      })
      .filter(Boolean) as TrilhaData[];
  }, [searchTerm, filtro, trilhasData]);

  const placeholderBusca = filtro === "trilhas" ? "Buscar trilhas" : filtro === "criterios" ? "Buscar critérios" : "Buscar";

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
        <div className="mx-auto mt-6 w-[1550px] max-w-full">
          {trilhasFiltradas.map((trilha, trilhaIndex) => (
            <TrilhaSection
              key={trilhaIndex}
              trilhaName={trilha.trilhaName}
              criteria={trilha.criteria}
              trilhaIndex={trilhaIndex}
              isTrilhaExpanded={expandedTrilhas[trilhaIndex] || false}
              onToggleTrilha={() => toggleTrilha(trilhaIndex)}
              expandedCriteria={expandedCriteria[trilhaIndex] || {}}
              onToggleCriterion={(criterionIndex) => toggleCriterion(trilhaIndex, criterionIndex)}
              onToggleCriterionMandatory={(criterionIndex) => toggleCriterionMandatory(trilhaIndex, criterionIndex)}
              isEditing={isEditing}
              onAddCriterion={onAddCriterion}
              onRemoveCriterion={onRemoveCriterion}
              onEditCriterionName={onEditCriterionName}
              onEditCriterionDescription={onEditCriterionDescription}
              onEditCriterionWeight={onEditCriterionWeight}
              pesoPlaceholder="Digite o peso aqui (ex: 30%)"
              descricaoPlaceholder="Descreva o critério de forma clara e objetiva"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CriteriosAvaliacao;
