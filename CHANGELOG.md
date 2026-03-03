# 更新日志

## [2026-03-03] 加粗功能修复与单端口部署优化

### 🎯 主要更新

#### 1. 修复输入框加粗功能
- **问题**：点击加粗按钮后，输入框文字不显示粗体效果
- **原因**：CSS 中定义了 `.chat-textarea.bold-mode` 类，但 textarea 元素未添加对应的 className
- **修复**：
  - 为 textarea 添加动态 className：`className={`chat-textarea ${isBold ? 'bold-mode' : ''}`}`
  - 利用 CSS 中的 `font-weight: 700 !important;` 样式实现加粗效果
  - 加粗状态通过 localStorage 持久化保存

#### 2. 单端口部署优化
- **问题**：开发环境需要同时运行前端（5173）和后端（16116）两个端口
- **优化**：
  - 前端打包：`npm run build` 生成静态文件到 `frontend/dist`
  - 复制到后端：`backend/dist-frontend` 目录
  - 后端自动提供静态文件服务
  - **现在只需访问 16116 端口即可使用完整应用**

#### 3. Vite 代理配置
为开发环境添加代理配置（`frontend/vite.config.ts`）：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:16116',
    changeOrigin: true,
  },
  '/socket.io': {
    target: 'http://localhost:16116',
    changeOrigin: true,
    ws: true,
  }
}
```

### 📝 使用说明

#### 生产环境（推荐）- 单端口部署
```bash
# 1. 打包前端
cd frontend && npm run build

# 2. 复制静态文件到后端
cd .. && rm -rf backend/dist-frontend && cp -r frontend/dist backend/dist-frontend

# 3. 启动后端（会自动提供前端静态文件）
cd backend && npm run dev

# 4. 访问应用
# http://localhost:16116 或 http://<your-ip>:16116
```

#### 开发环境 - 双端口（支持热更新）
```bash
# 终端 1：启动后端
cd backend && npm run dev    # 端口 16116

# 终端 2：启动前端
cd frontend && npm run dev   # 端口 5173

# 访问前端开发服务器（支持热更新）
# http://localhost:5173
```

### 🔧 技术细节

#### 加粗功能实现
1. **状态管理**：
   ```typescript
   const [isBold, setIsBoldRaw] = useState(() => 
     localStorage.getItem('chat_isBold') === 'true'
   );
   ```

2. **CSS 样式**（`frontend/src/figma.css`）：
   ```css
   .chat-textarea.bold-mode,
   .chat-textarea.bold-mode * {
     font-weight: 700 !important;
   }
   ```

3. **动态 className**：
   ```tsx
   <textarea
     className={`chat-textarea ${isBold ? 'bold-mode' : ''}`}
     // ...
   />
   ```

#### 后端静态文件服务
后端 `server.ts` 配置：
```typescript
// 提供前端静态文件
app.use(express.static(path.join(__dirname, '../dist-frontend')));

// SPA 路由回退
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist-frontend/index.html'));
});
```

### 🐛 已知问题
- 无

### 📦 文件变更
- `frontend/src/components/ChatPage.tsx` - 添加加粗功能 className
- `frontend/vite.config.ts` - 添加代理配置
- `backend/dist-frontend/` - 前端打包文件（新增）
- `frontend/src/figma.css` - 加粗样式已存在，无需修改

### 🚀 下一步计划
- [ ] 添加更多文本格式选项（斜体、下划线等）
- [ ] 优化打包流程，自动化部署脚本
- [ ] 添加生产环境构建配置
