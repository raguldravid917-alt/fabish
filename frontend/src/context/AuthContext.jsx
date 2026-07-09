import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          // Only clear user state on explicit authorization failures (401/403)
          if (res.status === 401 || res.status === 403) {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            setToken(null);
          } else {
            console.warn('Transient failure fetching user profile:', res.message || res);
            // Keep current user state to prevent forced logout on rate limiting / server down
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Keep current user state on network/unexpected errors
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      console.log("LOGIN API RESPONSE:", result); // Debugging-kaaga ithu irukatum

      if (result.success) {
        const data = result.data;
        // Backend 'token' or 'accessToken' epdi anupunalum eduka ithu uthavum
        const actualToken = data?.token || data?.accessToken || result?.token || result?.accessToken;

        if (!actualToken) {
          setError("Login Error: Backend didn't send a valid token.");
          setLoading(false);
          return { success: false, message: "Token missing from server." };
        }

        localStorage.setItem('token', actualToken);
        setToken(actualToken);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role, isAdmin: data.isAdmin });
        setLoading(false);
        return { success: true };
      } else {
        setError(result.message || 'Login failed');
        setLoading(false);
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (err) {
      setError('Server connection failed');
      setLoading(false);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.register(name, email, password);

      if (result.success) {
        const data = result.data;
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role, isAdmin: data.isAdmin });
        setLoading(false);
        return { success: true };
      } else {
        setError(result.message || 'Registration failed');
        setLoading(false);
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (err) {
      setError('Server connection failed');
      setLoading(false);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout cleanup warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (name, email, password) => {
    setError(null);
    try {
      const result = await authService.updateProfile({ name, email, password });

      if (result.success) {
        const data = result.data;
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role, isAdmin: data.isAdmin });
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Update failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (err) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      return await authService.resetPassword(resetToken, password);
    } catch (err) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};