import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Layout } from "./layouts/Layout";
import { UserProvider, useUser } from "./contexts/UserContext";

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

// Gestor pages
import GestorDashboard from "./pages/gestor/Dashboard";
import ColaboradoresGestor from "./pages/gestor/Colaboradores";
import ColaboradorDetails from "./pages/gestor/ColaboradorDetails";
import BrutalFacts from "./pages/gestor/BrutalFacts";

function AppRoutes() {
  const {
    role,
    userName,
    setRole,
    setUserName,
    setUserId,
    logout,
    setToken,
    setMentor,
  } = useUser();

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

      {role && (
        <Route
          path="/app"
          element={<Layout role={role} userName={userName} onLogout={logout} />}
        >
          {role === "colaborador" && (
            <>
              <Route path="dashboard" element={<ColaboradorDashboard />} />
              <Route path="evolucao" element={<Evolution />} />
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
              <Route path="colaboradores" element={<Colaboradores />} />
            </>
          )}

          {role === "gestor" && (
            <>
              <Route path="dashboard" element={<GestorDashboard />} />
              <Route path="colaboradores" element={<ColaboradoresGestor />} />
              <Route
                path="colaboradores/:id"
                element={<ColaboradorDetails />}
              />
              <Route path="brutalfacts" element={<BrutalFacts />} />
            </>
          )}
        </Route>
      )}
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
