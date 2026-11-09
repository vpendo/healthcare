
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export type UserRole = "patient" | "doctor" | "receptionist" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("famcare_token")
  );
  const [loading, setLoading] = useState(true);

  // Verify the saved token whenever the application starts.
  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const savedToken = localStorage.getItem("famcare_token");

      if (!savedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired.");
        }

        const data = await response.json();

        if (active) {
          setToken(savedToken);
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem("famcare_token");

        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("famcare_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    const savedToken = token;

    try {
      if (savedToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
      }
    } finally {
      localStorage.removeItem("famcare_token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
