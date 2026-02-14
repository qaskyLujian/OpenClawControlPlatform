import { io } from 'socket.io-client';

// 自动检测 Socket URL
const getSocketUrl = () => {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:7749`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:7749';
};

const SOCKET_URL = getSocketUrl();

console.log('🔌 Socket URL:', SOCKET_URL);

// 获取 token
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || 'wj12345';
};

export const socket = io(SOCKET_URL, {
  auth: {
    token: getAuthToken()
  },
  autoConnect: true
});

socket.on('connect', () => {
  console.log('✅ Connected to OpenClaw Admin Backend');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});
