import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
  allowedRoles: string[];
  showToast?: boolean;
}

export const ProtectedRoute = ({
  allowedRoles,
  showToast = true,
}: ProtectedRouteProps) => {
  const { token, role, isLoading, wasLoggedOut, setWasLoggedOut } = useUser();
  /*   const location = useLocation(); */

  useEffect(() => {
    // Se houve logout, resetar o flag após um delay para evitar toast imediato
    if (wasLoggedOut) {
      const timer = setTimeout(() => setWasLoggedOut(false), 500);
      return () => clearTimeout(timer);
    }
  }, [wasLoggedOut, setWasLoggedOut]);

  if (isLoading) {
    return null;
  }

  if (!token) {
    if (showToast && !wasLoggedOut) {
      toast.error("Faça login para continuar.");
    }

    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role || "")) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};
