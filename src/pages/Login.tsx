import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AxiosError } from "axios";

type Role = "colaborador" | "gestor" | "rh" | "comite";

interface LoginProps {
  onLogin: (
    role: Role,
    userName: string,
    userId: string,
    token: string,
    mentor: string | null
  ) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token, role: apiRole, name, userId, mentor } = res.data;

      const roleMap: Record<string, Role> = {
        COLABORADOR: "colaborador",
        LIDER: "gestor",
        RH: "rh",
        COMITE: "comite",
      };
      const mappedRole = roleMap[apiRole];
      if (!mappedRole) throw new Error("Role desconhecida retornada");

      onLogin(mappedRole, name, userId, access_token, mentor);
      navigate("/app/dashboard");
    } catch (err: unknown) {
      console.error("Erro no login:", err);

      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro no login");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-6 text-center">
          Entrar
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Email</label>
            <input
              type="text"
              className="w-full bg-white text-text-primary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Senha</label>
            <input
              type="password"
              className="w-full bg-white text-text-primary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand text-white font-medium py-2 rounded-md hover:bg-brand/90 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};
