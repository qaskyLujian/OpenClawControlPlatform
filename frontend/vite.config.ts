import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 5173,
    strictPort: true, // 端口被占用时报错而不是自动尝试下一个
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
  }
})
