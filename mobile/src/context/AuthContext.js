import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../services/api';
import { joinUserRoom } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadStoredUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('campus_drivers_token');
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          joinUserRoom(res.data.user._id);
          try {
            const nRes = await api.get('/notifications');
            if (nRes.data?.success && typeof nRes.data.unreadCount === 'number') {
              setUnreadNotifications(nRes.data.unreadCount);
            }
          } catch (ignored) {}
        }
      }
    } catch (e) {
      console.warn('Failed to load user session', e);
      await AsyncStorage.removeItem('campus_drivers_token');
      setAuthToken(null);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoredUser();
  }, []);

  const login = async (loginId, password) => {
    const res = await api.post('/auth/login', { loginId, password });
    if (res.data.success) {
      await AsyncStorage.setItem('campus_drivers_token', res.data.token);
      setAuthToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      joinUserRoom(res.data.user._id);
      try {
        const nRes = await api.get('/notifications');
        if (nRes.data?.success && typeof nRes.data.unreadCount === 'number') {
          setUnreadNotifications(nRes.data.unreadCount);
        }
      } catch (ignored) {}
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      await AsyncStorage.setItem('campus_drivers_token', res.data.token);
      setAuthToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      joinUserRoom(res.data.user._id);
      try {
        const nRes = await api.get('/notifications');
        if (nRes.data?.success && typeof nRes.data.unreadCount === 'number') {
          setUnreadNotifications(nRes.data.unreadCount);
        }
      } catch (ignored) {}
      return res.data;
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (e) {
      console.warn('Error refreshing profile', e);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('campus_drivers_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const isVerifiedStudent = user?.verification_status === 'verified';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isVerifiedStudent,
        login,
        register,
        logout,
        refreshProfile,
        unreadNotifications,
        setUnreadNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
