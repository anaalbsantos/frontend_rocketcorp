import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Layout } from "./layouts/Layout";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";

// Colaborador pages
import ColaboradorDashboard from "./pages/colaborador/Dashboard";
import Evaluations from "./pages/colaborador/Evaluations";
import Evolution from "./pages/colaborador/Evolution";

// Comitê pages
import ComiteDashboard from "./pages/comite/Dashboard";
import Equalizacao from "./pages/comite/Equalizacao";

// RH pages
import CriteriosAvaliacao from "./pages/rh/CriteriosAvaliacao";
import RhDashboard from "./pages/rh/Dashboard";
import Colaboradores from "./pages/rh/Colaboradores";
import Historico from "./pages/rh/Historico";

// Gestor pages
import GestorDashboard from "./pages/gestor/Dashboard";
import ColaboradoresGestor from "./pages/gestor/Colaboradores";
import ColaboradorDetails from "./pages/gestor/ColaboradorDetails";
import BrutalFacts from "./pages/gestor/BrutalFacts";
import Goals from "./pages/colaborador/Goals";

// Página pública
import { AccessDenied } from "./pages/AccessDenied";
// Extra pages (PesquisaClima)
import PesquisaClima from "./pages/clima/PesquisaClima";
import PesquisaColaborador from "./pages/clima/PesquisaColaborador";

function AppRoutes() {
  const {
    role,
    userName,
    isLoading,
    setRole,
    setUserName,
    setUserId,
    logout,
    setToken,
    setMentor,
  } = useUser();

  if (isLoading) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Login
            onLogin={(r, name, id, token, mentor) => {
              setRole(r);
              setUserName(name);
              setUserId(id);
              setToken(token);
              setMentor(mentor);
            }}
          />
        }
      />

      <Route path="/access-denied" element={<AccessDenied />} />

      <Route
        path="/app"
        element={<Layout role={role} userName={userName} onLogout={logout} />}
      >
        {/* COLABORADOR */}
        <Route element={<ProtectedRoute allowedRoles={["colaborador"]} />}>
          <Route
            path="colaborador/dashboard"
            element={<ColaboradorDashboard />}
          />
          <Route path="colaborador/evolucao" element={<Evolution />} />
          <Route path="colaborador/avaliacao" element={<Evaluations />} />
          <Route
            path="colaborador/pesquisa"
            element={<PesquisaColaborador />}
          />
          <Route path="colaborador/objetivos" element={<Goals />} />
        </Route>

        {/* GESTOR */}
        <Route element={<ProtectedRoute allowedRoles={["gestor"]} />}>
          <Route path="gestor/dashboard" element={<GestorDashboard />} />
          <Route
            path="gestor/colaboradores"
            element={<ColaboradoresGestor />}
          />
          <Route
            path="gestor/pesquisa-clima"
            element={<PesquisaClima role={role} />}
          />
          <Route
            path="gestor/colaboradores/:id"
            element={<ColaboradorDetails />}
          />
          <Route path="gestor/brutalfacts" element={<BrutalFacts />} />
          <Route path="gestor/objetivos" element={<Goals />} />
        </Route>

        {/* RH */}
        <Route element={<ProtectedRoute allowedRoles={["rh"]} />}>
          <Route path="rh/dashboard" element={<RhDashboard />} />
          <Route path="rh/criterios" element={<CriteriosAvaliacao />} />
          <Route path="rh/colaboradores" element={<Colaboradores />} />
          <Route path="rh/historico" element={<Historico />} />
          <Route
            path="rh/pesquisa-clima"
            element={<PesquisaClima role={role} />}
          />
        </Route>

        {/* COMITE */}
        <Route element={<ProtectedRoute allowedRoles={["comite"]} />}>
          <Route path="comite/dashboard" element={<ComiteDashboard />} />
          <Route path="comite/equalizacao" element={<Equalizacao />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
