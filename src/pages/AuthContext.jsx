/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Attempt to notify backend
      await api.post('/api/auth/logout');
    } catch (error) {
      console.log("Error during backend logout (Client-side clear only):", error.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      localStorage.removeItem('userReservations');

      delete api.defaults.headers.common['Authorization'];
      console.log('👋 Logout successful');
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // FIXED: Tinanggal ang '/api/auth/verify' call dito dahil wala ito sa iyong UserRoutes.js.
          // Ito ang solusyon sa 404 error na nakikita mo sa console.
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If data is corrupted, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  // Login function
  const login = async (emailOrUser, password = null) => {
    try {
      console.log('🔐 Attempting login...');
      let userData, token;

      // Scenario 1: Normal Login (email, pass)
      if (typeof emailOrUser === 'string' && password) {
        const response = await api.post('/api/auth/login', { 
          email: emailOrUser, 
          password 
        });

        const { data } = response;
        if (!data.success && !data.token) { 
          // Note: Some backends might not send 'success: true' explicitly if using standard JWT responses,
          // but checking for token is the most important part.
          return { success: false, message: data.message || 'Login failed' };
        }

        userData = data.user;
        token = data.token;
      } 
      // Scenario 2: Direct Object Login (Manual set)
      else if (typeof emailOrUser === 'object') {
        userData = emailOrUser;
        token = password;
      } 
      else {
        return { success: false, message: 'Invalid login parameters' };
      }

      if (!token || token === "null" || token === "undefined") {
          return { success: false, message: "Invalid token received." };
      }

      // Store user data
      setUser(userData);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      // Set default axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, user: userData, message: 'Login successful' };

    } catch (error) {
      console.error('🚨 Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed.' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      // FIXED: Changed endpoint to '/api/auth/signup' to match UserRoutes.js
      const response = await api.post('/api/auth/signup', userData);
      const { data } = response;
      
      // Check for success flag or success message
      if (data.success || data.message?.includes('success')) {
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed.' };
    }
  };

  // Update Profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/users/profile', userData);
      const { data } = response;
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/api/users/change-password', { currentPassword, newPassword });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Change password failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      // Matches UserRoutes.js
      const response = await api.post('/api/auth/forgot-password', { email });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      console.log("Forgot password error:", error);
      // Always return success to prevent email enumeration (security best practice)
      return { success: true, message: 'If account exists, email sent.' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      // Matches UserRoutes.js
      const response = await api.post('/api/auth/reset-password', { token, newPassword });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Reset failed' };
    }
  };

  const hasRole = (role) => user && (user.role === role || user.role === 'admin');
  const getToken = () => localStorage.getItem('token');
  const setToken = (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const refreshUser = async () => {
    try {
      // Note: Ensure you have a route for this in your backend user routes
      const response = await api.get('/api/users/profile');
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
    return { success: false };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    hasRole,
    getToken,
    setToken,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};