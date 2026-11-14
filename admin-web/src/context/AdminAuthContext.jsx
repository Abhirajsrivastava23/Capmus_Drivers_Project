import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('campus_drivers_admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user.role === 'admin') {
          setAdmin(res.data.user);
        } else {
          localStorage.removeItem('campus_drivers_admin_token');
        }
      } catch (err) {
        localStorage.removeItem('campus_drivers_admin_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (loginId, password) => {
    const res = await api.post('/auth/login', { loginId, password });
    if (res.data.success) {
      if (res.data.user.role !== 'admin') {
        throw new Error('Access denied: Ordinary student accounts cannot access Admin Dashboard.');
      }
      localStorage.setItem('campus_drivers_admin_token', res.data.token);
      setAdmin(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_drivers_admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
