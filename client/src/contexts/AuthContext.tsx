"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
} from "@/libs/auth";
import { api } from "@/libs/api";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const savedUser = getUser();

      if (token && savedUser) {
        const result = await api.auth.getMe(token);
        if ("user" in result) {
          setUserState(result.user);
          setUser(result.user);
        } else {
          removeToken();
          removeUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const data = await api.auth.login(email, password);

      if ("token" in data) {
        setToken(data.token);
        setUser(data.user);
        setUserState(data.user);
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<AuthResult> => {
    try {
      const data = await api.auth.register(userData);

      if ("token" in data) {
        setToken(data.token);
        setUser(data.user);
        setUserState(data.user);
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const logout = (): void => {
    removeToken();
    removeUser();
    setUserState(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
