import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user cache exists on load, then verify with backend me query
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
      fetchFreshProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFreshProfile = async () => {
    try {
      const response = await api.get('auth/me/');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // If profile fetch fails, session cookie is invalid/expired
      await logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });
      const { user: userData } = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Fetch details in case they need to include student_profile relations
      await fetchFreshProfile();
      return { success: true };
    } catch (error) {
      console.error("Login error details:", error);
      const errMsg = error.response?.data?.detail || "Invalid username or password.";
      return { success: false, error: errMsg };
    }
  };

  const register = async (studentData) => {
    try {
      await api.post('auth/register/', studentData);
      return { success: true };
    } catch (error) {
      console.error("Registration error details:", error);
      const errors = error.response?.data || {};
      let errorMsg = "Registration failed. ";
      if (typeof errors === 'object') {
        const errorList = [];
        for (const [key, value] of Object.entries(errors)) {
          errorList.push(`${key}: ${Array.isArray(value) ? value.join(' ') : value}`);
        }
        if (errorList.length > 0) {
          errorMsg = errorList.join(' | ');
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logoutLocal = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const logout = async () => {
    try {
      await api.post('auth/logout/');
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      logoutLocal();
      window.location.href = '/';
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isStudent = () => user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
