import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import Comite from "./pages/Comite";

const Dashboard = () => <h1 className="text-xl font-bold">Dashboard</h1>;
const Avaliacao = () => <h1 className="text-xl font-bold">Avaliação</h1>;
const Evolucao = () => <h1 className="text-xl font-bold">Evolução</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout role="comite" userName="Ylson Santos" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="evolucao" element={<Evolucao />} />
          <Route path="dashboardComite" element={<Comite />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
