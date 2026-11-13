"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiGet,
  apiLogin,
  BackendUser,
  clearSession,
  getStoredUser,
  getToken,
} from "@/lib/api";

interface AuthContextValue {
  user: BackendUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await apiGet<BackendUser>("/api/users/me");
      setUser(me);
      localStorage.setItem("karin_user", JSON.stringify(me));
    } catch {
      clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const cached = getStoredUser();
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    if (cached) setUser(cached);
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshMe }),
    [user, loading, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
