/**
 * @file socket.ts - WebSocket 客户端服务
 * @description 基于 Socket.IO 的实时通信客户端，用于 Dashboard 数据推送
 * @author OpenClaw Team
 */

import { io, Socket } from 'socket.io-client';

/**
 * WebSocket 服务器 URL
 * 与前端页面同 host 和端口
 */
const SOCKET_URL = `${window.location.protocol}//${window.location.host}`;

console.log('🔌 Socket URL:', SOCKET_URL);

/**
 * 获取认证 token
 * 从 localStorage 读取，如果不存在则使用默认 token
 * @returns 认证 token 字符串
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || 'wj12345';
};

/**
 * 创建 Socket.IO 连接实例
 * 配置：
 * - auth.token: 认证 token，用于服务端验证
 * - autoConnect: 自动连接，实例化后立即尝试连接
 */
export const socket: Socket = io(SOCKET_URL, {
  auth: {
    token: getAuthToken()
  },
  autoConnect: true
});

// ============================================
// 连接事件监听
// ============================================

/**
 * 连接成功事件
 * 当与后端建立 WebSocket 连接时触发
 */
socket.on('connect', () => {
  console.log('✅ Connected to OpenClaw Admin Backend');
  console.log(`🔌 Socket ID: ${socket.id}`);
});

/**
 * 连接断开事件
 * 当 WebSocket 连接断开时触发（网络问题、服务端重启等）
 */
socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend');
  console.log('🔄 将自动尝试重连...');
});

/**
 * 连接错误事件
 * 当连接失败时触发（认证失败、网络错误等）
 * @param error - 错误对象，包含错误信息
 */
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  
  // 如果是认证错误，提示用户
  if (error.message.includes('Unauthorized') || error.message.includes('auth')) {
    console.warn('⚠️  认证失败，请检查 token 是否有效');
  }
});

/**
 * 重连事件
 * 当 Socket.IO 自动重连时触发
 */
socket.on('reconnect', (attemptNumber: number) => {
  console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
});

/**
 * 重连错误事件
 * 当重连尝试失败时触发
 */
socket.on('reconnect_error', (error) => {
  console.error('🔄 Reconnect error:', error.message);
});

// ============================================
// 使用说明
// ============================================

/**
 * 订阅 Dashboard 实时更新
 * 
 * 示例用法：
 * ```typescript
 * import { socket } from './socket';
 * 
 * // 订阅 Dashboard
 * socket.emit('subscribe:dashboard');
 * 
 * // 监听更新
 * socket.on('dashboard:update', (data) => {
 *   console.log('Dashboard 数据更新:', data);
 *   // 更新 UI...
 * });
 * 
 * // 取消订阅（组件卸载时）
 * socket.off('dashboard:update');
 * ```
 */

// ============================================
// 事件类型定义（供 TypeScript 使用）
// ============================================

/**
 * 客户端 -> 服务端事件
 * - subscribe:dashboard: 订阅 Dashboard 实时更新
 * 
 * 服务端 -> 客户端事件
 * - dashboard:update: Dashboard 数据更新（每 5 秒推送）
 */
