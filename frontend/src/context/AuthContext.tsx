// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  username: string;
  role: "staff" | "customer";
}

interface JwtCustomPayload {
  sub: string;
  role?: "staff" | "customer";
  exp?: number;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const decodeToken = (jwt: string): User => {
    try {
      const payload = jwtDecode<JwtCustomPayload>(jwt);
      return {
        username: payload.sub ?? "",
        role: payload.role ?? "customer",
      };
    } catch (e) {
      return {
        username: "",
        role: "customer",
      };
    }
  };

  const login = async (username: string, password: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
 
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail ?? "Login failed");
    }

    const data = await resp.json(); // { access_token, token_type, role?, username? }
    const jwt = data.access_token as string;
    const decoded = decodeToken(jwt);

    // If backend returns role and username directly, prefer those
    const currentUser: User = {
      username: data.username ?? decoded.username,
      role: data.role ?? decoded.role,
    };

    // Persist for page reloads   
    localStorage.setItem("tms_token", jwt);
    localStorage.setItem("tms_user", JSON.stringify(currentUser));
    setToken(jwt);
    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem("tms_token");
    localStorage.removeItem("tms_user");
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("tms_token");
      const storedUser = localStorage.getItem("tms_user");
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
        } catch {
          localStorage.removeItem("tms_token");
          localStorage.removeItem("tms_user");
        }
      }
    }
    setLoading(false);
  }, []);

  const value: AuthContextProps = { user, token, login, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
