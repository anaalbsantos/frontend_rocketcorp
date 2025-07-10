import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Role as BaseRole } from "@/types";

type Role = BaseRole | null;

interface UserContextType {
  userId: string | null;
  userName: string;
  role: Role;
  token: string | null;
  mentor: string | null;
  isLoading: boolean;
  wasLoggedOut: boolean;
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setRole: (role: Role) => void;
  setToken: (token: string | null) => void;
  setMentor: (mentor: string | null) => void;
  logout: () => void;
  setWasLoggedOut: (v: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState("");
  const [role, setRoleState] = useState<Role>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [mentor, setMentorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wasLoggedOut, setWasLoggedOut] = useState(false);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const setUserId = (id: string | null) => {
    setUserIdState(id);
    if (id) localStorage.setItem("userId", id);
    else localStorage.removeItem("userId");
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("userName", name);
  };

  const setRole = (r: Role) => {
    setRoleState(r);
    if (r) localStorage.setItem("role", r);
    else localStorage.removeItem("role");
  };

  const setMentor = (m: string | null) => {
    setMentorState(m);
    if (m) localStorage.setItem("mentor", m);
    else localStorage.removeItem("mentor");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("mentor");
    setUserIdState(null);
    setUserNameState("");
    setRoleState(null);
    setTokenState(null);
    setMentorState(null);
    setWasLoggedOut(true);

    // Opcional: resetar wasLoggedOut após delay para evitar toast indesejado em outras renderizações
    setTimeout(() => setWasLoggedOut(false), 1000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("role") as Role;
    const storedMentor = localStorage.getItem("mentor");

    if (storedToken) setTokenState(storedToken);
    if (storedId) setUserIdState(storedId);
    if (storedName) setUserNameState(storedName);
    if (storedRole) setRoleState(storedRole);
    if (storedMentor) setMentorState(storedMentor);
    setIsLoading(false);
  }, []);

  // Listener para detectar mudanças no localStorage (quando token é removido pelo interceptador)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && e.newValue === null) {
        // Token foi removido - fazer logout
        setUserIdState(null);
        setUserNameState("");
        setRoleState(null);
        setTokenState(null);
        setMentorState(null);
        setWasLoggedOut(false);
      }
    };

    // Listener para mudanças em outras abas/janelas
    window.addEventListener("storage", handleStorageChange);

    // Verificar periodicamente se o token ainda existe (para a mesma aba)
    const checkTokenInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken && token) {
        // Token foi removido mas o estado ainda tem - fazer logout
        setUserIdState(null);
        setUserNameState("");
        setRoleState(null);
        setTokenState(null);
        setMentorState(null);
        setWasLoggedOut(true);
        setTimeout(() => setWasLoggedOut(false), 1000);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkTokenInterval);
    };
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        userId,
        userName,
        role,
        token,
        mentor,
        isLoading,
        wasLoggedOut,
        setUserId,
        setUserName,
        setRole,
        setToken,
        setMentor,
        logout,
        setWasLoggedOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
