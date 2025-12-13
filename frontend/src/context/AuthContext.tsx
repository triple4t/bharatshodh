import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService, UserPublic } from "../services/api";
import { redirect, useNavigate } from "react-router";

type AuthContextType = {
  user: UserPublic | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    if (!apiService.isAuthenticated()) {
      setUser(null);
      return;
    }
    try {
      const me = await apiService.me();
      setUser(me);
    } catch {
      apiService.logout();
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    await apiService.login(email, password);
    await refreshMe();
  };

  const signUp = async (email: string, password: string, name?: string) => {
    await apiService.register(email, password, name);
    // optional auto-login:
    await apiService.login(email, password);
    await refreshMe();
  };

  const signOut = () => {
    setLoading(true);
    apiService.logout();
    setUser(null);
    redirect("/signin"); // redirect immediately
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
