/**
 * @file server.ts - OpenClaw Admin 后端主服务器
 * @description Express + Socket.IO 服务器，提供 REST API 和实时 WebSocket 通信
 * @author OpenClaw Team
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 导入路由模块
import statusRouter from './routes/status';      // 系统状态接口
import sessionsRouter from './routes/sessions';  // 会话管理接口
import modelsRouter from './routes/models';      // 模型配置接口
import skillsRouter from './routes/skills';      // 技能管理接口
import logsRouter from './routes/logs';          // 日志查询接口
import providersRouter from './routes/providers';// 提供商配置接口
import tasksRouter from './routes/tasks';        // 定时任务接口
import channelsRouter from './routes/channels';  // 渠道管理接口
import whatsappRouter from './routes/whatsapp';  // WhatsApp 集成接口
import chatRouter from './routes/chat';          // 聊天接口
import teamRouter from './routes/team';          // 团队管理接口
import systemRouter from './routes/system';      // 系统控制接口
import uploadRouter from './routes/upload';      // 文件上传接口

// 创建 Express 应用和 HTTP 服务器
const app = express();
const httpServer = createServer(app);

// 初始化 Socket.IO 服务器，支持跨域连接
const io = new Server(httpServer, {
  cors: {
    origin: '*', // 允许所有来源（生产环境应该限制为特定域名）
    credentials: true // 允许携带凭证（cookies、authorization headers）
  }
});

// 服务器配置：端口和主机
const PORT = Number(process.env.PORT) || 16116;  // 默认端口 16116
const HOST = process.env.HOST || '0.0.0.0';      // 监听所有网络接口

// ============================================
// 中间件配置
// ============================================

// CORS 中间件：允许跨域请求
app.use(cors({
  origin: '*', // 允许所有来源
  credentials: true
}));

// JSON 解析中间件：支持最大 50MB 的 JSON 负载
app.use(express.json({ limit: '50mb' }));

// URL 编码解析中间件：支持扩展模式和 50MB 限制
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// 静态文件服务
// ============================================

import path from 'path';

// 前端静态文件服务（禁用缓存以确保实时更新）
app.use(express.static(path.join(__dirname, '../dist-frontend'), {
  etag: false, // 禁用 ETag
  lastModified: false, // 禁用 Last-Modified
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// 上传文件服务：提供 /uploads 路径访问上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// 认证中间件
// ============================================

// 从环境变量读取认证 token，默认值为 'wj12345'
const AUTH_TOKEN = process.env.ADMIN_TOKEN || 'wj12345';

// 简单认证中间件：验证 Bearer Token
app.use((req, res, next) => {
  // 健康检查接口跳过认证
  if (req.path === '/health') return next();
  
  // 支持两种 token 传递方式：
  // 1. Authorization Header: "Bearer <token>"
  // 2. Query Parameter: ?token=<token>（用于文件下载等场景）
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token as string;
  
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ============================================
// API 路由注册
// ============================================

// 健康检查接口（无需认证）
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 注册所有 API 路由
app.use('/api/status', statusRouter);        // GET /api/status - 获取系统状态
app.use('/api/sessions', sessionsRouter);    // 会话管理 CRUD
app.use('/api/models', modelsRouter);        // 模型配置管理
app.use('/api/skills', skillsRouter);        // 技能列表和状态
app.use('/api/logs', logsRouter);            // 日志查询和过滤
app.use('/api/providers', providersRouter);  // 提供商配置管理
app.use('/api/tasks', tasksRouter);          // 定时任务（Cron）管理
app.use('/api/channels', channelsRouter);    // 消息渠道管理
app.use('/api/whatsapp', whatsappRouter);    // WhatsApp 认证和消息
app.use('/api/chat', chatRouter);            // 聊天消息发送
app.use('/api/team', teamRouter);            // 团队配置管理
app.use('/api/system', systemRouter);        // 系统重启、更新等操作
app.use('/api/upload', uploadRouter);        // 文件上传处理

// ============================================
// WebSocket 连接处理
// ============================================

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // 客户端订阅 Dashboard 实时更新
  socket.on('subscribe:dashboard', () => {
    console.log(`📊 Client ${socket.id} subscribed to dashboard updates`);
    
    // 每 5 秒推送一次 Dashboard 数据
    const interval = setInterval(async () => {
      try {
        const dashboardData = await getDashboardData();
        socket.emit('dashboard:update', dashboardData);
      } catch (error) {
        console.error('Dashboard update error:', error);
      }
    }, 5000);
    
    // 客户端断开时清理定时器
    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log(`🔌 Client ${socket.id} unsubscribed from dashboard`);
    });
  });
  
  // 客户端断开连接
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// 导入 Dashboard 数据获取函数
import { getDashboardData } from './services/system';

// ============================================
// SPA 回退路由
// ============================================

// 所有未匹配的路由返回前端 index.html（支持前端路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist-frontend/index.html'));
});

// ============================================
// 启动服务器
// ============================================

httpServer.listen(PORT, HOST, () => {
  console.log(`🦞 OpenClaw Admin Backend running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://10.168.1.155:${PORT}`);
  console.log(`🔑 Auth token: ${AUTH_TOKEN}`);
  console.log(`⚠️  生产环境请修改 ADMIN_TOKEN 并限制 CORS 来源`);
});

// 导出 Socket.IO 实例供其他模块使用
export { io };
