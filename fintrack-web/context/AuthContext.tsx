"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken } from "../lib/auth";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nombre: string;
  email: string;
  email_verificado: boolean;
  subscription_tier?: string;
  subscription_status?: string;
  stripe_customer_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // In a real app we would have a /users/me endpoint to validate the token
      // For now we assume if the token exists we might be logged in, but we probably 
      // want to fetch the user profile if it's missing from state.
      // Since the frontend might naturally refresh, ideally we want a persistent way to know the user's name/email.
      // We will parse the user from localStorage or just rely on a protected route check later.
      const savedUser = localStorage.getItem("fintrack_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Auth check failed", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    // The token is already stored by the login function in page.tsx,
    // but we save the user state here to rehydrate on refresh.
    localStorage.setItem("fintrack_user", JSON.stringify(userData));
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("fintrack_user");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
