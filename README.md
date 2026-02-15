# 🦞 OpenClaw 剑控系统

OpenClaw 管理中心 — 一个为 [OpenClaw](https://github.com/openclaw/openclaw) AI 助手打造的全功能 Web 管理平台。

提供实时监控、多渠道管理、定时任务调度、AI 对话等一站式管理能力，让你通过浏览器即可掌控 OpenClaw 的一切。

## ✨ 功能特性

### 📊 监控中心
- **系统资源** — CPU / 内存实时监控，动态颜色指示（绿/蓝/橙/红），后台采样零开销
- **会话管理** — 查看所有活跃会话（主会话、子代理、定时任务），友好名称显示，消息历史浏览
- **Provider 状态** — AI 模型提供商一览，模型数量、API Key 配置状态
- **Skills 列表** — 已安装技能展示，描述与依赖信息
- **Channel 连接** — 各消息渠道（Telegram / WhatsApp / Discord 等）实时连接状态
- **Token 用量** — 模型调用量柱状图可视化

### ⚙️ 管理中心
- **Provider 配置** — 添加/编辑/删除 AI 模型提供商，支持 API Key 安全管理（脱敏显示）
- **Channel 接入** — 多渠道配置（Telegram / WhatsApp / Discord / Signal / Slack / IRC），动态表单适配不同渠道字段
- **WhatsApp 扫码** — 网页端直接扫码绑定 WhatsApp，无需终端操作
- **定时任务** — 自然语言调度（每隔 N 分钟 / 每天 / 每周），任务创建/编辑/删除/启停，通过 OpenClaw Cron 引擎执行

### 💬 对话中心
- **共享主会话** — 与 TUI / Telegram / WhatsApp 共享同一会话上下文
- **实时同步** — 每 5 秒轮询会话历史，其他渠道的消息自动出现
- **文件上传** — 支持图片、PDF、CSV、代码等 20+ 种格式，最大 20MB
- **智能滚动** — 查看历史时不被新消息打断，一键回到底部

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| UI | Ant Design + 自定义 Figma Dark 主题 |
| 图表 | Recharts |
| 状态 | Zustand |
| 后端 | Express + TypeScript |
| 实时 | Socket.IO |
| 配置 | JSON5（容错解析） |
| AI 交互 | OpenClaw CLI（`openclaw agent` / `openclaw cron`） |

## 📁 项目结构

```
openclaw-admin/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express 服务入口
│   │   ├── routes/
│   │   │   ├── channels.ts        # 渠道配置 API
│   │   │   ├── chat.ts            # AI 对话 + 历史同步
│   │   │   ├── providers.ts       # Provider 管理
│   │   │   ├── sessions.ts        # 会话管理
│   │   │   ├── tasks.ts           # 定时任务（Cron）
│   │   │   ├── skills.ts          # Skills 列表
│   │   │   ├── whatsapp.ts        # WhatsApp 扫码认证
│   │   │   ├── models.ts          # 模型列表
│   │   │   ├── logs.ts            # 日志查询
│   │   │   └── status.ts          # 系统状态
│   │   ├── services/
│   │   │   └── system.ts          # CPU/内存/渠道后台采样
│   │   └── utils/
│   │       └── config.ts          # openclaw.json 读写（JSON5）
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # 路由 + 布局
│   │   ├── components/
│   │   │   ├── MonitorPage.tsx     # 监控中心
│   │   │   ├── ManagePage.tsx      # 管理中心
│   │   │   ├── ChatPage.tsx        # 对话中心
│   │   │   ├── Sidebar.tsx         # 侧边栏导航
│   │   │   └── Login.tsx           # 登录页
│   │   ├── services/
│   │   │   ├── api.ts             # API 封装
│   │   │   └── socket.ts          # Socket.IO 客户端
│   │   └── figma.css              # Figma Dark 主题样式
│   └── package.json
├── start.sh                       # 一键启动脚本
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- [OpenClaw](https://github.com/openclaw/openclaw) 已安装并运行
- OpenClaw Gateway 已启动（`openclaw gateway start`）

### 安装

```bash
git clone https://github.com/wj-whj/openclaw-admin.git
cd openclaw-admin

# 安装依赖
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 配置

编辑 `backend/src/server.ts` 中的认证 Token：

```typescript
const AUTH_TOKEN = 'your-secret-token';
```

### 启动

```bash
# 一键启动（前端 + 后端）
./start.sh

# 或分别启动
cd backend && npm run dev    # 后端 :7749
cd frontend && npm run dev   # 前端 :5173
```

打开浏览器访问 `http://localhost:5173`，输入 Token 登录。

支持局域网访问：`http://<your-ip>:5173`

## 📸 界面预览

### 监控中心
实时 CPU/内存监控 · 会话列表 · Provider 状态 · Channel 连接 · Token 用量图表

### 管理中心
Provider 配置 · Channel 接入 · WhatsApp 扫码 · 定时任务调度

### 对话中心
多渠道共享会话 · 文件上传 · 实时消息同步

## 🔧 核心设计

### 后台采样架构
CPU 和内存每 3 秒采样一次，Channel 状态每 30 秒检测，数据缓存在内存中。API 请求直接返回缓存值（~20ms），避免每次请求执行系统命令。

### 渠道字段白名单
不同渠道类型有不同的有效字段集（匹配 OpenClaw `additionalProperties: false` 约束），写入配置时严格过滤，防止启动失败。

### 会话共享
对话中心动态读取主会话 ID，与 TUI / Telegram / WhatsApp 共享同一会话上下文和记忆。

### 定时任务
通过 `openclaw cron` CLI 注册到 Gateway 的真实调度器，支持 `every`（间隔）/ `daily`（每天）/ `weekly`（每周）三种调度模式。

## 📄 License

MIT

## 🙏 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) — AI 助手框架
- [Ant Design](https://ant.design/) — UI 组件库
- [Recharts](https://recharts.org/) — 图表库
