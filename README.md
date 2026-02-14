# OpenClaw Admin System

OpenClaw 管理系统 - 可视化管理 OpenClaw Gateway、会话、模型和 Skills

## 🚀 快速开始

### 启动系统

```bash
cd ~/.openclaw/workspace/openclaw-admin
./start.sh
```

访问：http://localhost:5173

### 手动启动

**后端：**
```bash
cd backend
npm run dev  # Port 7749
```

**前端：**
```bash
cd frontend
npm run dev  # Port 5173
```

## 📊 功能特性

### ✅ 已实现（MVP）

- **系统监控面板**
  - Gateway 运行状态
  - 会话统计
  - Token 使用情况
  - 系统资源监控（CPU、内存）
  - 实时更新（WebSocket）

### 🚧 开发中

- 会话管理（列表、详情、终止）
- 模型配置管理
- Skills 管理
- 日志查看器
- 配置编辑器

## 🏗️ 技术栈

**前端：**
- React 18 + TypeScript
- Vite
- Ant Design
- Socket.io-client
- Axios
- Zustand

**后端：**
- Express.js + TypeScript
- Socket.io
- fs-extra

## 📁 项目结构

```
openclaw-admin/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── backend/           # Express 后端
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── package.json
└── start.sh          # 启动脚本
```

## 🔐 认证

默认 Token: `openclaw-admin-2026`

修改方法：
1. 编辑 `frontend/.env` 中的 `VITE_AUTH_TOKEN`
2. 编辑 `backend/src/server.ts` 中的 `AUTH_TOKEN`

## 🛠️ 开发

### 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd frontend && npm install
```

### 构建生产版本

```bash
# 前端
cd frontend && npm run build

# 后端
cd backend && npm run build
```

## 📝 API 文档

### 端点

- `GET /api/status` - 获取系统状态
- `GET /api/sessions` - 获取会话列表
- `GET /api/models` - 获取模型配置
- `GET /api/skills` - 获取 Skills 列表
- `GET /api/logs` - 获取日志

### WebSocket 事件

- `subscribe:dashboard` - 订阅仪表盘实时更新
- `dashboard:update` - 接收仪表盘数据更新

## 🎯 下一步计划

1. 完善会话管理功能
2. 实现模型配置 CRUD
3. 添加 Skills 安装/卸载
4. 实时日志查看
5. 配置文件可视化编辑

## 📄 License

MIT
