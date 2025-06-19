import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Login } from "./pages/Login";
import { Layout } from "./layouts/Layout";
import Comite from "./pages/comite/Dashboard";
import Equalizacao from "./pages/comite/Equalizacao";
import CriteriosAvaliacao from "./pages/rh/CriteriosAvaliacao";
import ColaboradorDashboard from "./pages/Colaborador/Dashboard";
import ComiteDashboard from "./pages/comite/Comite";

const Dashboard = () => <h1 className="text-xl font-bold">Dashboard</h1>;
const Avaliacao = () => <h1 className="text-xl font-bold">Avaliação</h1>;
const Evolucao = () => <h1 className="text-xl font-bold">Evolução</h1>;

function App() {
  const [role, setRole] = useState<
    "colaborador" | "gestor" | "rh" | "comite" | null
  >(null);
  const [userName, setUserName] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout role="rh" userName="Ylson Santos" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="evolucao" element={<Evolucao />} />
          <Route path="dashboardComite" element={<Comite />} />
          <Route path="equalizacao" element={<Equalizacao />} />
          <Route path="criterios" element={<CriteriosAvaliacao />} />
        </Route>

        <Route
          path="/login"
          element={
            <Login
              onLogin={(role, userName) => {
                setRole(role);
                setUserName(userName);
              }}
            />
          }
        />

        {role && (
          <Route
            path="/app"
            element={<Layout role={role} userName={userName} />}
          >
            {role === "colaborador" && (
              <Route path="dashboard" element={<ColaboradorDashboard />} />
            )}
            {role === "comite" && (
              <Route path="dashboard" element={<ComiteDashboard />} />
            )}
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

