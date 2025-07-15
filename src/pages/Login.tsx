import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AxiosError } from "axios";
import type { Role } from "@/types";
import Colab from "../assets/background.png";
import { Mail, Lock, Rocket } from "lucide-react";

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

        const mappedRole = roleMap[apiRole?.toUpperCase()];
        if (!mappedRole) throw new Error("Role desconhecida retornada");

        onLogin(mappedRole, name, userId, access_token, mentor);

        const defaultPathMap: Record<Role, string> = {
          colaborador: "/app/colaborador/dashboard",
          gestor: "/app/gestor/dashboard",
          rh: "/app/rh/dashboard",
          comite: "/app/comite/dashboard",
        };

        navigate(defaultPathMap[mappedRole], { replace: true });
      } catch (err: unknown) {
        console.error("Erro no login:", err);

        if (err instanceof AxiosError && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Erro ao tentar fazer login. Tente novamente.");
        }
      }
    },
    [email, password, navigate, onLogin]
  );

  return (
    <div className="h-screen w-full flex flex-row justify-start items-center p-12 bg-gray-50 relative">
      <div className="h-[calc(100vh-4rem)] w-full flex justify-center items-center rounded-[80px_20px] overflow-hidden">
        <img src={Colab} className="h-full w-full object-cover relative" />
        <h2 className="absolute w-96 bottom-20 left-20 text-5xl font-black text-white">
          Rocket Performance & Engagement
        </h2>
      </div>
      <div className="flex flex-col items-center w-[40%] p-12 absolute right-[420px] bg-white shadow-lg rounded-3xl text-brand">
        <Rocket size={40} className="m-3" />
        <h1 className="text-2xl font-bold mb-6 text-center">
          Bem-vindo de volta!
        </h1>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full h-10 bg-white text-text-primary border border-border rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                className="w-full h-10 bg-white text-text-primary border border-border rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
            </div>
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
