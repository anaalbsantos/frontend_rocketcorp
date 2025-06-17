import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout";

const Dashboard = () => <h1 className="text-xl font-bold">Dashboard</h1>;
const Avaliacao = () => <h1 className="text-xl font-bold">Avaliação</h1>;
const Evolucao = () => <h1 className="text-xl font-bold">Evolução</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="evolucao" element={<Evolucao />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
