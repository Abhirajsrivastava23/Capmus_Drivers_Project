import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Smart URL configuration depending on environment
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator alias for host machine localhost
    return 'http://10.0.2.2:5001/api';
  }
  // For web, iOS simulator, or local network
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

export default api;
