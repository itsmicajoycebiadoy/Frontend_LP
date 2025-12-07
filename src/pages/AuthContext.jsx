import React, { createContext, useState, useContext, useEffect } from 'react';
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

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Verify token with backend
          try {
            await api.get('/api/auth/verify', {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
          } catch (error) {
            console.log('Token verification failed, clearing storage');
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function - WITH SAFETY CHECK
  const login = async (emailOrUser, password = null) => {
    try {
      console.log('🔐 Attempting login...');
      let userData, token;
      
      // Scenario 1: Called with email and password (normal login)
      if (typeof emailOrUser === 'string' && password) {
        // ... (API Call logic is fine, keep it) ...
        const response = await api.post('/api/auth/login', { 
          email: emailOrUser, 
          password 
        });
        
        const { data } = response;
        if (!data.success || !data.user || !data.token) {
          return { success: false, message: data.message || 'Login failed' };
        }
        
        userData = data.user;
        token = data.token;
      } 
      // Scenario 2: Called with user data from direct API call (Auth.jsx)
      else if (typeof emailOrUser === 'object') {
        userData = emailOrUser;
        token = password; // token is passed as 2nd arg
      } 
      else {
        return { success: false, message: 'Invalid login parameters' };
      }
      
      // 🛑 SAFETY CHECK: Huwag i-save kapag walang token o "null" ang value
      if (!token || token === "null" || token === "undefined") {
          console.error("❌ BLOCKED: Attempted to save invalid token:", token);
          return { success: false, message: "Invalid token received." };
      }

      // Store user data
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token); // ✅ Safe na ito ngayon
      
      // Set default axios header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Login successful');
      return { 
        success: true, 
        user: userData,
        message: 'Login successful' 
      };
      
    } catch (error) {
      console.error('🚨 Login error:', error);
      // ... (Keep your error handling) ...
      return { success: false, message: 'Login failed.' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      
      const response = await api.post('/api/auth/register', userData);
      const { data } = response;
      
      if (data.success) {
        console.log('✅ Registration successful');
        return { 
          success: true, 
          message: data.message,
          user: data.user 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('🚨 Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Optional: Call backend logout endpoint
      await api.post('/api/auth/logout');
    } catch (error) {
      console.log('Backend logout failed, proceeding with client cleanup');
    } finally {
      // Clear client state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      localStorage.removeItem('userReservations');
      
      // Remove axios header
      delete api.defaults.headers.common['Authorization'];
      
      console.log('👋 Logout successful');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/users/profile', userData);
      const { data } = response;
      
      if (data.success && data.user) {
        // Update local state
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return { 
          success: true, 
          user: data.user,
          message: data.message 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Update failed' 
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Update failed. Please try again.';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/api/users/change-password', {
        currentPassword,
        newPassword
      });
      
      const { data } = response;
      
      return { 
        success: data.success || false, 
        message: data.message 
      };
    } catch (error) {
      console.error('Change password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Password change failed';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      const { data } = response;
      
      return { 
        success: data.success || false, 
        message: data.message 
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Always return success for security (don't reveal if email exists)
      return { 
        success: true, 
        message: 'If an account exists with this email, you will receive reset instructions.' 
      };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      
      const { data } = response;
      
      return { 
        success: data.success || false, 
        message: data.message 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Password reset failed. The link may have expired.';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  };

  // Get current token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Set token for API calls (useful when token is updated)
  const setToken = (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      const response = await api.get('/api/users/profile');
      const { data } = response;
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
    return { success: false };
  };

  // Context value
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