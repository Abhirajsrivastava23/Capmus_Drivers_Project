import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Primary cloud production URL + local WiFi fallback
export const CLOUD_API_BASE = 'https://capmusdriversproject.vercel.app/api';
export const LOCAL_WIFI_BASE = 'http://192.168.51.113:5001/api';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return 'http://localhost:5001/api';
    }
    return CLOUD_API_BASE;
  }
  // Android APK on real device
  return CLOUD_API_BASE;
};

export const API_BASE = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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

// Resilient fallback interceptor: if Cloud fails, retry with local WiFi backend
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest &&
      !originalRequest._retry &&
      (error.response?.status === 500 || error.code === 'ERR_NETWORK' || !error.response)
    ) {
      originalRequest._retry = true;
      if (originalRequest.baseURL === CLOUD_API_BASE) {
        console.log('[API] Falling back to local WiFi backend:', LOCAL_WIFI_BASE);
        originalRequest.baseURL = LOCAL_WIFI_BASE;
        return api.request(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
