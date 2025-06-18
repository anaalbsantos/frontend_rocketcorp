import Chart from "@/components/Chart";
import CycleEvaluation from "@/components/CycleEvaluation";

export const Home = () => {
  return (
    <>
      <CycleEvaluation
        score={4.5}
        semester="2024.1"
        summary="Você se saiu muito bem por conta disso e isso"
        status="Em andamento"
      />
      <Chart />
    </>
  );
};

export default Home;
