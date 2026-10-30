import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api';
import { socketService } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    // Load initial user session
    const initAuth = async () => {
      // 1. Check URL for incoming SSO token or persona switch from TaskToggle
      let urlToken = null;
      let urlEmpId = null;
      let urlEmail = null;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        urlToken = urlParams.get('token');
        urlEmpId = urlParams.get('empId');
        urlEmail = urlParams.get('email');
        if (urlToken) {
          setToken(urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {}

      const token = getToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            // Guard: If URL explicitly specifies a different employee ID or email without new token,
            // prevent opening the wrong staff persona from a stale browser cache
            const mismatch = (urlEmpId && res.user.employeeId && res.user.employeeId !== urlEmpId) ||
                             (urlEmail && res.user.email && res.user.email.toLowerCase() !== urlEmail.toLowerCase());
            if (mismatch && !urlToken) {
              console.warn('[Auth] Cached session mismatch for requested staff, resetting session');
              removeToken();
              setUser(null);
            } else {
              setUser(res.user);
              socketService.connect(res.user._id);
            }
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid:', err.message);
          removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    const fetchDemo = async () => {
      try {
        const res = await api.getDemoAccounts();
        if (res.success) {
          setDemoAccounts(res.accounts || []);
        }
      } catch (err) {
        console.warn('[Auth] Failed to load demo accounts:', err.message);
      }
    };

    initAuth();
    fetchDemo();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      socketService.connect(res.user._id);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      socketService.connect(res.user._id);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    socketService.disconnect();
    removeToken();
    setUser(null);
  };

  const updateStatus = async (status, statusMessage) => {
    try {
      const res = await api.updateStatus(status, statusMessage);
      if (res.success && res.user) {
        setUser(res.user);
        socketService.changeStatus(res.user._id, status, statusMessage);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoAccounts,
        login,
        register,
        logout,
        updateStatus,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
