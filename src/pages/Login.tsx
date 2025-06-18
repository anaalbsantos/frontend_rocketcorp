import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "colaborador" | "gestor" | "rh" | "comite";

interface LoginProps {
  onLogin: (role: Role, userName: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const staticUsers: Record<string, Role> = {
      rh: "rh",
      comite: "comite",
      colaborador: "colaborador",
      gestor: "gestor",
    };

    const emailTrimmed = email.trim().toLowerCase();
    const passwordTrimmed = password.trim().toLowerCase();

    if (emailTrimmed === passwordTrimmed && staticUsers[emailTrimmed]) {
      const role = staticUsers[emailTrimmed];
      onLogin(role, `${role[0].toUpperCase() + role.slice(1)} 1`);
      navigate("/app/dashboard");
    } else {
      setError("login inválido. tente: rh, comite, colaborador ou gestor");
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
