import { io } from 'socket.io-client';

const SOCKET_URL = `${window.location.protocol}//${window.location.host}`;

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
