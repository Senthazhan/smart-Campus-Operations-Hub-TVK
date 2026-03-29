import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchMe } from "../api/authApi";

const AuthContext = createContext(null);

// Normalize role data to always be an object with 'name' property
const normalizeRole = (role) => {
  if (!role) return { name: "USER" };
  if (typeof role === "object" && role.name) return role;
  if (typeof role === "string") return { name: role };
  return { name: "USER" };
};

const normalizeUser = (userData) => ({
  ...userData,
  role: normalizeRole(userData?.role),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = React.useCallback((userData, token) => {
    const normalizedUser = normalizeUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateUser = React.useCallback((userData) => {
    const normalizedUser = normalizeUser(userData);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token) {
          setLoading(false);
          return;
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Try to hydrate with fresh profile data when a token exists
        try {
          const res = await fetchMe();
          if (res.success && res.data) {
            updateUser(res.data);
          }
        } catch {
          // Ignore profile fetch errors here; keep whatever user we have
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
