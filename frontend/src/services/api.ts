/**
 * @file api.ts - API 客户端服务
 * @description 基于 Axios 的 HTTP 客户端，封装所有后端 API 调用
 * @author OpenClaw Team
 */

import axios from 'axios';

/**
 * 自动检测 API 基础 URL
 * 使用当前页面的 host 和端口（前后端同端口部署）
 * @returns API 基础 URL，例如 "http://localhost:16116"
 */
const getApiBaseUrl = () => {
  return `${window.location.protocol}//${window.location.host}`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * 创建 Axios 实例
 * 配置基础 URL 为 /api 路径
 */
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

// ============================================
// 请求拦截器
// ============================================

/**
 * 请求拦截器：自动添加认证 token
 * - 从 localStorage 读取 auth_token
 * - 如果不存在则使用默认 token 'wj12345'
 * - 添加到 Authorization header: "Bearer <token>"
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || 'wj12345';
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// 响应拦截器
// ============================================

/**
 * 响应拦截器：处理认证失败
 * - 检测到 401 Unauthorized 时清除本地 token
 * - 自动刷新页面重新认证
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 认证失败，清除 token 并刷新页面
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ============================================
// Dashboard & 系统状态
// ============================================

/**
 * 获取 Dashboard 数据（系统状态、会话数、任务数等）
 * GET /api/status
 */
export const getDashboardData = () => api.get('/status');

// ============================================
// 会话管理
// ============================================

/**
 * 获取所有会话列表
 * GET /api/sessions
 */
export const getSessions = () => api.get('/sessions');

/**
 * 获取指定会话的消息历史
 * GET /api/sessions/:sessionId/messages
 * @param sessionId - 会话 ID
 * @param params - 可选参数：limit（数量）、offset（偏移）、filter（过滤）
 */
export const getSessionMessages = (sessionId: string, params?: { limit?: number; offset?: number; filter?: string }) =>
  api.get(`/sessions/${sessionId}/messages`, { params });

/**
 * 删除指定会话
 * DELETE /api/sessions/:sessionKey
 * @param sessionKey - 会话密钥（需要 URL 编码）
 */
export const deleteSession = (sessionKey: string) => api.delete(`/sessions/${encodeURIComponent(sessionKey)}`);

// ============================================
// 模型管理
// ============================================

/**
 * 获取所有可用模型列表
 * GET /api/models
 */
export const getModels = () => api.get('/models');

/**
 * 更新模型配置
 * PUT /api/models
 * @param data - 模型配置数据
 */
export const updateModels = (data: any) => api.put('/models', data);

/**
 * 测试提供商连接
 * POST /api/models/test
 * @param provider - 提供商名称
 */
export const testProvider = (provider: string) => api.post('/models/test', { provider });

// ============================================
// 技能管理
// ============================================

/**
 * 获取所有技能列表
 * GET /api/skills
 */
export const getSkills = () => api.get('/skills');

// ============================================
// 日志管理
// ============================================

/**
 * 获取系统日志
 * GET /api/logs
 */
export const getLogs = () => api.get('/logs');

// ============================================
// 提供商管理 (Providers)
// ============================================

/**
 * 获取所有提供商配置
 * GET /api/providers
 */
export const getProviders = () => api.get('/providers');

/**
 * 创建新提供商
 * POST /api/providers
 * @param data - 提供商配置数据
 */
export const createProvider = (data: any) => api.post('/providers', data);

/**
 * 更新指定提供商
 * PUT /api/providers/:name
 * @param name - 提供商名称
 * @param data - 更新数据
 */
export const updateProvider = (name: string, data: any) => api.put(`/providers/${name}`, data);

/**
 * 删除指定提供商
 * DELETE /api/providers/:name
 * @param name - 提供商名称
 */
export const deleteProvider = (name: string) => api.delete(`/providers/${name}`);

/**
 * 设置默认模型
 * PUT /api/providers/default-model
 * @param data - 包含 provider 和 model 的配置
 */
export const setDefaultModel = (data: any) => api.put('/providers/default-model', data);

// ============================================
// 定时任务管理 (Tasks/Cron)
// ============================================

/**
 * 获取所有定时任务
 * GET /api/tasks
 */
export const getTasks = () => api.get('/tasks');

/**
 * 创建新的 Cron 任务
 * POST /api/tasks/cron
 * @param data - 任务配置（schedule、payload、sessionTarget 等）
 */
export const createCronJob = (data: any) => api.post('/tasks/cron', data);

/**
 * 更新指定 Cron 任务
 * PUT /api/tasks/cron/:id
 * @param id - 任务 ID
 * @param data - 更新数据
 */
export const updateCronJob = (id: string, data: any) => api.put(`/tasks/cron/${id}`, data);

/**
 * 删除指定 Cron 任务
 * DELETE /api/tasks/cron/:id
 * @param id - 任务 ID
 */
export const deleteCronJob = (id: string) => api.delete(`/tasks/cron/${id}`);

// ============================================
// 渠道管理 (Channels)
// ============================================

/**
 * 获取所有消息渠道
 * GET /api/channels
 */
export const getChannels = () => api.get('/channels');

/**
 * 创建新渠道
 * POST /api/channels
 * @param data - 渠道配置数据
 */
export const createChannel = (data: any) => api.post('/channels', data);

/**
 * 更新指定渠道
 * PUT /api/channels/:name
 * @param name - 渠道名称
 * @param data - 更新数据
 */
export const updateChannel = (name: string, data: any) => api.put(`/channels/${name}`, data);

/**
 * 删除指定渠道
 * DELETE /api/channels/:name
 * @param name - 渠道名称
 */
export const deleteChannel = (name: string) => api.delete(`/channels/${name}`);

/**
 * 测试渠道连接
 * POST /api/channels/:name/test
 * @param name - 渠道名称
 */
export const testChannel = (name: string) => api.post(`/channels/${name}/test`);

// ============================================
// WhatsApp 集成
// ============================================

/**
 * 启动 WhatsApp 认证流程
 * POST /api/whatsapp/auth/start
 */
export const startWhatsAppAuth = () => api.post('/whatsapp/auth/start');

/**
 * 获取 WhatsApp 认证状态
 * GET /api/whatsapp/auth/status
 */
export const getWhatsAppAuthStatus = () => api.get('/whatsapp/auth/status');

/**
 * 取消 WhatsApp 认证
 * POST /api/whatsapp/auth/cancel
 */
export const cancelWhatsAppAuth = () => api.post('/whatsapp/auth/cancel');

// ============================================
// 聊天功能
// ============================================

/**
 * 发送聊天消息
 * POST /api/chat
 * @param message - 消息内容
 */
export const sendChatMessage = (message: string) => api.post('/chat', { message });

// ============================================
// 系统控制
// ============================================

/**
 * 重启 Gateway 服务
 * POST /api/system/restart
 */
export const restartGateway = () => api.post('/system/restart');
