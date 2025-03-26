"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Ensure this package is installed

// Define the shape of our auth context.
interface AuthContextProps {
  user: unknown;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

// Create the context with an undefined default.
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  // On component mount, check if there's a token in localStorage and decode it.
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        setUser(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    // Set loading to false after token check.
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // While token is being checked/decoded, show a loading indicator.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading authentication...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to the auth context.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
