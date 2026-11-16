import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getBaseUrl = () => {
  // 1. If explicit env variable is set, use it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser environment
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      // If served via Vite (port 3000) or any web server / Vercel, use same-origin /api
      // Vite automatically proxies /api to port 5001; production hosts route /api to backend
      if (window.location.port === '3000' || !window.location.port || window.location.protocol.startsWith('https')) {
        return `${window.location.origin}/api`;
      }
      // If served via Expo web dev server (e.g. port 8081 / 19006)
      if (window.location.port === '8081' || window.location.port === '19006') {
        const host = window.location.hostname || 'localhost';
        return `http://${host}:5001/api`;
      }
      return `${window.location.origin}/api`;
    }
    return 'http://localhost:5001/api';
  }

  // 3. Android Native Emulator vs Device
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }

  // 4. iOS / Default
  return 'http://localhost:5001/api';
};

export const API_BASE = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('campus_drivers_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('Error reading token from AsyncStorage', e);
  }
  return config;
});

// Resilient fallback interceptor: if relative /api fails on dev, retry direct port 5001
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest &&
      !originalRequest._retry &&
      (error.code === 'ERR_NETWORK' || !error.response)
    ) {
      originalRequest._retry = true;
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // If relative URL failed, try direct localhost:5001
        if (originalRequest.baseURL.includes(window.location.host) && window.location.port !== '5001') {
          originalRequest.baseURL = `http://${window.location.hostname}:5001/api`;
          return api.request(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
