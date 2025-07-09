import { Navigate, Outlet, useLocation } from "react-router-dom";
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
  const location = useLocation();
  if (isLoading) {
    return null;
  }
  if (!token) {
    if (showToast && !wasLoggedOut) {
      toast.error("Faça login para continuar.");
    }

    if (wasLoggedOut) {
      setWasLoggedOut(false);
    }

    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role || "")) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};
