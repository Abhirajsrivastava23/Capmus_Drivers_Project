import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  if (process.env.EXPO_PUBLIC_SOCKET_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_URL;
  }
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.protocol.startsWith('https')) {
        return window.location.origin;
      }
      const host = window.location.hostname || 'localhost';
      return `http://${host}:5001`;
    }
    return 'http://localhost:5001';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }
  return 'http://localhost:5001';
};

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend on socket id:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });
  }
  return socket;
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join_user_room', userId);
  }
};

export const joinRideRoom = (rideId) => {
  const s = getSocket();
  if (s && rideId) {
    s.emit('join_ride_room', rideId);
  }
};

export const leaveRideRoom = (rideId) => {
  const s = getSocket();
  if (s && rideId) {
    s.emit('leave_ride_room', rideId);
  }
};
