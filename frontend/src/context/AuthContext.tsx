// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, UserRole } from "../types/auth";

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_TOKEN = "barberhair_token";
const LS_USER = "barberhair_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(LS_TOKEN);
    const u = localStorage.getItem(LS_USER);

    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u) as AuthUser);
      } catch {
        localStorage.removeItem(LS_USER);
      }
    }
    setLoading(false);
  }, []);

  const login: AuthContextType["login"] = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  };

  const hasRole = (role: UserRole) => user?.role === role;

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      logout,
      hasRole,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
