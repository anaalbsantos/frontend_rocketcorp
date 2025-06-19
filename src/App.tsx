import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Login } from "./pages/Login";
import { Layout } from "./layouts/Layout";

// Colaborador pages
import ColaboradorDashboard from "./pages/colaborador/Dashboard";
import Evaluations from "./pages/colaborador/Evaluations";

// Comitê pages
import ComiteDashboard from "./pages/comite/Dashboard";
import Equalizacao from "./pages/comite/Equalizacao";

// RH pages
import CriteriosAvaliacao from "./pages/rh/CriteriosAvaliacao";
import RhDashboard from "./pages/rh/Dashboard";

// Gestor pages
import GestorDashboard from "./pages/gestor/Dashboard";

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
              <>
                <Route path="dashboard" element={<ColaboradorDashboard />} />
                <Route path="avaliacao" element={<Evaluations />} />
              </>
            )}

            {role === "comite" && (
              <>
                <Route path="dashboard" element={<ComiteDashboard />} />
                <Route path="equalizacao" element={<Equalizacao />} />
              </>
            )}
            {role === "rh" && (
              <>
                <Route path="criterios" element={<CriteriosAvaliacao />} />
                <Route path="dashboard" element={<RhDashboard />} />
              </>
            )}

            {role === "gestor" && (
              <Route path="dashboard" element={<GestorDashboard />} />
            )}
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
