import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wabaInfo, setWabaInfo] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchWabaInfo(userData.customer_id); 
    }
    setLoading(false);
  }, []);

  // Login method: persist user in localStorage
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    fetchWabaInfo(userData.customer_id);
  }, []);

  // Logout method: clear user and WABA info from memory
  const logout = useCallback(() => {
    setUser(null);
    setWabaInfo(null);
    localStorage.removeItem("user");
    axios
      .post(API_ENDPOINTS.AUTH.LOGOUT, {}, { withCredentials: true })
      .catch(() => {});
  }, []);

  const isAuthenticated = !!user;

  // Fetch WABA info (in-memory only)
  const fetchWabaInfo = useCallback(async (customerId) => {
    if (!customerId) return;
    try {
      const response = await axios.get(API_ENDPOINTS.WABA.INFO(customerId));
      // console.log('WABA Info Response:', response.data);
      setWabaInfo(response.data.wabaInfo); 
    } catch (err) {
      console.error("Failed to fetch WABA info:", err.response?.data?.error || err.message);
      setWabaInfo(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, loading, wabaInfo, fetchWabaInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
