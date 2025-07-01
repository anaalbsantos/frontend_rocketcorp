import { useEffect, useState } from "react";
import EvaluationForm from "@/components/evaluation/EvaluationForm";
import TabsContent from "@/components/TabContent";
import TeamEvaluation from "@/components/TeamEvaluation";
import SearchInput from "@/components/SearchInput";
import { SearchColaborators } from "@/components/SearchColaborators";
import api from "@/api/api";
import { useUser } from "@/contexts/UserContext";
import { useAutoevaluationStore } from "@/stores/useAutoevaluationStore";
import { useReferenceEvaluationStore } from "@/stores/useReferenceEvaluationStore";
import { useMentorEvaluationStore } from "@/stores/useMentorEvaluationStore";
import { useEvaluation360Store } from "@/stores/useEvaluation360Store";
import toast from "react-hot-toast";

interface Criterion {
  id: string;
  title: string;
  description?: string;
  type: "HABILIDADES" | "VALORES" | "METAS";
}
interface Colaborator {
  id: string;
  name: string;
  position: string;
}

const Evaluations = () => {
  const [activeTab, setActiveTab] = useState("autoavaliação");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
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
  const [cycle, setCycle] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });

  const { userId, mentor } = useUser();
  const tabs = mentor
    ? ["autoavaliação", "avaliação 360", "mentoring", "referências"]
    : ["autoavaliação", "avaliação 360", "referências"];

  const autoevaluationStore = useAutoevaluationStore();
  const evaluation360Store = useEvaluation360Store();
  const mentorStore = useMentorEvaluationStore();
  const referenceStore = useReferenceEvaluationStore();

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

  const allFormsFilled =
    autoevaluationStore.responses.filled.every(Boolean) &&
    Object.values(evaluation360Store.responses).every(
      (response) => response.filled
    ) &&
    (mentor ? mentorStore.responses[mentorData?.id ?? ""]?.filled : true) &&
    referenceStore.response?.filled;

  useEffect(() => {
    async function fetchEvaluationCriteria() {
      try {
        const response = await api.get(
          `/avaliacao/criterios/usuario/${userId}`
        );
        const criteria = response.data.criteria;

        setCriteria(criteria);
        setVariant("autoevaluation");
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

  useEffect(() => {
    async function fetchCycle() {
      try {
        const response = await api.get(`/score-cycle`);
        setCycle({ id: response.data.id, name: response.data.name });
      } catch {
        console.error("Erro ao buscar ciclo de avaliação");
      }
    }

    fetchCycle();
  });

  const handleSelectReference: React.Dispatch<
    React.SetStateAction<Colaborator | null>
  > = (colabOrFn) => {
    const colab =
      typeof colabOrFn === "function" ? colabOrFn(reference) : colabOrFn;
    setReference(colab);
    referenceStore.setSelectedReferenceId(colab ? colab.id : null);
  };

  const handleSubmitAll = async () => {
    try {
      // const evaluation360 = {};
      const mentor = {
        mentorId: mentorData?.id,
        menteeId: userId,
        cycleId: cycle.id,
        score: mentorStore.responses[mentorData?.id ?? ""]?.score,
        feedback: mentorStore.responses[mentorData?.id ?? ""]?.justification,
      };
      const reference = {
        referencedId: referenceStore.selectedReferenceId,
        theme: "Colaboração em Equipe",
        justification: referenceStore.response?.justification,
      };

      const submition = Promise.all([
        api.post("/mentoring", mentor),
        api.post("/references", reference),
      ]);

      toast.promise(submition, {
        loading: "Enviando avaliações...",
        success: "Avaliações enviadas com sucesso!",
        error: "Erro ao enviar as avaliações",
      });
    } catch (e) {
      console.error("Erro ao enviar avaliações:", e);
      toast.error("Erro ao enviar as avaliações");
    }
  };

  return (
    <div>
      <div className="bg-white flex flex-col justify-between  border-b border-gray-200 shadow-sm">
        <div className="flex justify-between p-6">
          <h3 className="font-bold">Ciclo {cycle.name}</h3>

          {variant === "autoevaluation" && (
            <button
              className="text-sm text-white bg-brand disabled:bg-brand/50"
              type="submit"
              disabled={!allFormsFilled}
              onClick={() => handleSubmitAll()}
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
          <EvaluationForm criteria={criteria} variant={variant} />
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
