# 部署指南

## 快速开始

### 方式一：单端口部署（推荐）

适用于生产环境，只需一个端口即可访问完整应用。

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd openclaw-admin

# 2. 安装依赖
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. 打包前端
cd frontend && npm run build && cd ..

# 4. 复制静态文件到后端
rm -rf backend/dist-frontend
cp -r frontend/dist backend/dist-frontend

# 5. 启动后端服务
cd backend && npm run dev

# 6. 访问应用
# 浏览器打开：http://localhost:16116
# 或局域网访问：http://<your-ip>:16116
```

### 方式二：开发模式（双端口）

适用于开发环境，支持前端热更新。

```bash
# 终端 1：启动后端
cd backend
npm run dev
# 后端运行在：http://localhost:16116

# 终端 2：启动前端
cd frontend
npm run dev
# 前端运行在：http://localhost:5173

# 访问前端开发服务器
# 浏览器打开：http://localhost:5173
```

## 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 16116 | 后端 API + 前端静态文件 | 生产环境使用此端口 |
| 5173 | 前端开发服务器 | 仅开发环境，支持热更新 |

## 更新前端代码后的部署

如果修改了前端代码，需要重新打包并部署：

```bash
# 1. 打包前端
cd frontend
npm run build

# 2. 复制到后端
cd ..
rm -rf backend/dist-frontend
cp -r frontend/dist backend/dist-frontend

# 3. 重启后端服务
# 如果使用 pm2：
pm2 restart openclaw-admin-backend

# 如果手动运行：
# 按 Ctrl+C 停止，然后重新运行
cd backend && npm run dev
```

## 生产环境部署（systemd）

### 1. 创建 systemd 服务文件

```bash
sudo nano /etc/systemd/system/openclaw-admin.service
```

内容：
```ini
[Unit]
Description=OpenClaw Admin Backend
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/openclaw-admin/backend
ExecStart=/usr/bin/npm run dev
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 2. 启用并启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw-admin
sudo systemctl start openclaw-admin

# 查看状态
sudo systemctl status openclaw-admin

# 查看日志
sudo journalctl -u openclaw-admin -f
```

## 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start npm --name "openclaw-admin-backend" -- run dev

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

## 环境变量配置

后端支持以下环境变量（可选）：

```bash
# .env 文件示例
PORT=16116
NODE_ENV=production
AUTH_TOKEN=your-custom-token
```

## 防火墙配置

如果需要外网访问，需要开放端口：

```bash
# Ubuntu/Debian
sudo ufw allow 16116/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=16116/tcp
sudo firewall-cmd --reload
```

## 反向代理配置（可选）

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:16116;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy

```
your-domain.com {
    reverse_proxy localhost:16116
}
```

## 故障排查

### 问题：页面全黑或无法加载

**解决方案**：
1. 确认前端已打包：`ls backend/dist-frontend`
2. 确认后端正在运行：`ps aux | grep node`
3. 检查后端日志：`tail -f /tmp/backend.log`

### 问题：加粗功能不生效

**解决方案**：
1. 确认访问的是最新部署的版本
2. 清除浏览器缓存（Ctrl+Shift+R）
3. 检查浏览器控制台是否有 JavaScript 错误

### 问题：WebSocket 连接失败

**解决方案**：
1. 确认后端服务正常运行
2. 检查防火墙是否阻止了 WebSocket 连接
3. 如果使用反向代理，确认 WebSocket 升级配置正确

## 性能优化建议

1. **使用生产构建**：
   ```bash
   cd frontend
   npm run build
   ```

2. **启用 Gzip 压缩**（Nginx）：
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

3. **使用 PM2 集群模式**：
   ```bash
   pm2 start npm --name "openclaw-admin" -i max -- run dev
   ```

## 安全建议

1. 修改默认 Token：在后端代码中修改 `AUTH_TOKEN`
2. 使用 HTTPS：配置 SSL 证书
3. 限制访问 IP：使用防火墙或 Nginx 配置
4. 定期更新依赖：`npm audit fix`
