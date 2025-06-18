import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Login } from "./pages/Login";
import { Layout } from "./layouts/Layout";
import ColaboradorDashboard from "./pages/Colaborador/Dashboard";
import ComiteDashboard from "./pages/comite/Comite";

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
