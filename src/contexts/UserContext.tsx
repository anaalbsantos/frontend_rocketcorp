import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Role = "colaborador" | "gestor" | "rh" | "comite" | null;

interface UserContextType {
  userId: string | null;
  userName: string;
  role: Role;
  token: string | null;
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setRole: (role: Role) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState("");
  const [role, setRoleState] = useState<Role>(null);
  const [token, setTokenState] = useState<string | null>(null);

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    setUserIdState(null);
    setUserNameState("");
    setRoleState(null);
    setTokenState(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("role") as Role;

    if (storedToken) setTokenState(storedToken);
    if (storedId) setUserIdState(storedId);
    if (storedName) setUserNameState(storedName);
    if (storedRole) setRoleState(storedRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        userId,
        userName,
        role,
        token,
        setUserId,
        setUserName,
        setRole,
        setToken,
        logout,
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
