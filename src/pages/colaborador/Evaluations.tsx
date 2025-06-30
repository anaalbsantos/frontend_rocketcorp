import { useEffect, useState } from "react";
import EvaluationForm from "@/components/evaluation/EvaluationForm";
import TabsContent from "@/components/TabContent";
import TeamEvaluation from "@/components/TeamEvaluation";
import SearchInput from "@/components/SearchInput";
import { SearchColaborators } from "@/components/SearchColaborators";
import api from "@/api/api";
import { useUser } from "@/contexts/UserContext";
import { useReferenceEvaluationStore } from "@/stores/useReferenceEvaluationStore";

interface Criterion {
  id: string;
  title: string;
  description?: string;
  type: "HABILIDADES" | "VALORES" | "METAS";
}
interface EvaluationCriteria {
  topic: string;
  criteria: Criterion[];
}

interface Colaborator {
  id: string;
  name: string;
  position: string;
}

const Evaluations = () => {
  const [activeTab, setActiveTab] = useState("autoavaliação");
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [formsFilled, setFormsFilled] = useState<boolean[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [reference, setReference] = useState<Colaborator | null>(null);
  const [mentorData, setMentorData] = useState<Colaborator | null>(null);
  const [allColaborators, setAllColaborators] = useState<Colaborator[]>([]);
  const [filteredColaborators, setFilteredColaborators] = useState<
    Colaborator[]
  >([]);
  const [variant, setVariant] = useState<"autoevaluation" | "final-evaluation">(
    "autoevaluation"
  );

  const { userId, mentor } = useUser();
  const tabs = mentor
    ? ["autoavaliação", "avaliação 360", "mentoring", "referências"]
    : ["autoavaliação", "avaliação 360", "referências"];

  const referenceStore = useReferenceEvaluationStore();

  const handleFormFilledChange = (index: number, filled: boolean) => {
    setFormsFilled((prev) => {
      if (prev[index] === filled) return prev;
      const updated = [...prev];
      updated[index] = filled;
      return updated;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value.trim() === "") {
      setFilteredColaborators(allColaborators);
    } else {
      const filtered = allColaborators.filter((colaborador) =>
        colaborador.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredColaborators(filtered);
    }
  };

  const allFormsFilled = formsFilled.every(Boolean);

  useEffect(() => {
    async function fetchEvaluationCriteria() {
      try {
        const response = await api.get(
          `/avaliacao/criterios/usuario/${userId}`
        );
        const criteria = response.data.criteria;

        const evaluationCriteria = [
          {
            topic: "Habilidades",
            criteria: criteria.filter(
              (v: Criterion) => v.type === "HABILIDADES"
            ),
          },
          {
            topic: "Valores",
            criteria: criteria.filter((v: Criterion) => v.type === "VALORES"),
          },
          {
            topic: "Metas",
            criteria: criteria.filter((v: Criterion) => v.type === "METAS"),
          },
        ];
        setCriteria(evaluationCriteria);
        setVariant("autoevaluation");
        setFormsFilled((prev) =>
          prev.length === evaluationCriteria.length
            ? prev
            : Array(evaluationCriteria.length).fill(false)
        );
      } catch {
        console.error("Erro ao buscar critérios de avaliação");
      }
    }

    fetchEvaluationCriteria();
  }, [userId]);

  useEffect(() => {
    async function fetchColaborators() {
      try {
        const response = await api.get(`/avaliacao-360/team-members`);
        const colaborators: Colaborator[] = response.data.members
          .filter((c: { id: string }) => c.id !== mentorData?.id)
          .map(
            (c: { id: string; name: string; position: { name: string } }) => ({
              id: c.id,
              name: c.name,
              position: c.position.name,
            })
          );

        setAllColaborators(colaborators);
        setFilteredColaborators(colaborators);
      } catch {
        console.error("Erro ao buscar colaboradores");
      }
    }
    fetchColaborators();
  }, [mentorData]);

  useEffect(() => {
    async function fetchMentor() {
      try {
        if (mentor) {
          const response = await api.get(`/users/${mentor}`);
          setMentorData(response.data);
        }
      } catch {
        console.error("Erro ao buscar mentor");
      }
    }

    fetchMentor();
  }, [mentor]);

  useEffect(() => {
    if (referenceStore.selectedReferenceId && allColaborators.length > 0) {
      const found = allColaborators.find(
        (c) => c.id === referenceStore.selectedReferenceId
      );
      if (found) setReference(found);
    }
  }, [referenceStore.selectedReferenceId, allColaborators]);

  const handleSelectReference: React.Dispatch<
    React.SetStateAction<Colaborator | null>
  > = (colabOrFn) => {
    const colab =
      typeof colabOrFn === "function" ? colabOrFn(reference) : colabOrFn;
    setReference(colab);
    referenceStore.setSelectedReferenceId(colab ? colab.id : null);
  };

  return (
    <div>
      <div className="bg-white flex flex-col justify-between  border-b border-gray-200 shadow-sm">
        <div className="flex justify-between p-6">
          <h3 className="font-bold">Ciclo 2025.1</h3>

          {variant === "autoevaluation" && (
            <button
              className="text-sm text-white bg-brand disabled:bg-brand/50"
              type="submit"
              disabled={!allFormsFilled}
            >
              Concluir e enviar
            </button>
          )}
        </div>
        <TabsContent
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabs={tabs}
        />
      </div>

      {activeTab === "autoavaliação" && (
        <div className="flex flex-col p-6 gap-6">
          {criteria.map((evaluation, index) => (
            <EvaluationForm
              key={evaluation.topic}
              topic={evaluation.topic}
              criteria={evaluation.criteria}
              variant={variant}
              onAllFilledChange={(filled) =>
                handleFormFilledChange(index, filled)
              }
            />
          ))}
        </div>
      )}

      {activeTab === "avaliação 360" && (
        <div className="flex flex-col p-6 gap-6">
          <SearchInput
            value={searchValue}
            onChange={(v) => handleSearchChange(v)}
            placeholder="Buscar por colaboradores"
          />
          {filteredColaborators.map((colaborador) => (
            <TeamEvaluation
              key={colaborador.id}
              id={colaborador.id}
              name={colaborador.name}
              position={colaborador.position}
              role="colaborador"
            />
          ))}
        </div>
      )}

      {activeTab === "mentoring" && (
        <div className="flex flex-col p-6 gap-6">
          {mentorData && (
            <TeamEvaluation
              id={mentorData.id}
              name={mentorData.name}
              position="Mentor"
              role="mentor"
            />
          )}
        </div>
      )}

      {activeTab === "referências" && (
        <div className="flex flex-col p-6 gap-6">
          <SearchColaborators
            colaborators={allColaborators}
            selected={reference}
            setSelected={handleSelectReference}
          />
          {reference && (
            <TeamEvaluation
              id={reference.id}
              name={reference.name}
              position={reference.position}
              role="reference"
              onDelete={() => setReference(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Evaluations;
