import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export const AccessDenied = () => {
  const { token } = useUser();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          Acesso negado
        </h1>
        <p className="text-gray-600 mb-6">
          {token
            ? "Você não tem permissão para acessar esta página."
            : "Você precisa estar logado para acessar esta página."}
        </p>

        {!token && (
          <button
            onClick={() => navigate("/")}
            className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand/90 transition"
          >
            Voltar ao login
          </button>
        )}
      </div>
    </div>
  );
};
