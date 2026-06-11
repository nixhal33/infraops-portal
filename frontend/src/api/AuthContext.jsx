import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "./client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("infraops_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    apiRequest("/auth/me")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("infraops_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(username, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem("infraops_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("infraops_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading]);

  if (loading) return <div className="center-screen">Loading InfraOps...</div>;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
