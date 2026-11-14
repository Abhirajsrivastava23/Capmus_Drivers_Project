import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  // Require fresh ID and password entry whenever Admin Portal is opened
  useEffect(() => {
    localStorage.removeItem('campus_drivers_admin_token');
    setAdmin(null);
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    const clean = (loginId || '').trim().toLowerCase();
    const validIds = ['campusdrivers000', 'campusdrivers000.', 'campusdrivers000@campusdrivers.cu.ac.in'];
    
    // Enforce strict dedicated admin credential requirement
    if (!validIds.includes(clean)) {
      throw new Error('Access restricted: Only authorized admin credential (campusdrivers000) is permitted to access the Admin Portal.');
    }
    if (password !== 'campus1010') {
      throw new Error('Incorrect password. Please enter the authorized admin password.');
    }

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
