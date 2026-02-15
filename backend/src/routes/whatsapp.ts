import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';

const router = express.Router();

let client: any = null;
let qrCodeImageUrl: string | null = null;
let authStatus: 'idle' | 'waiting' | 'success' | 'failed' | 'timeout' = 'idle';
let initPromise: Promise<void> | null = null;

// 启动 WhatsApp 认证
router.post('/auth/start', async (req, res) => {
  try {
    // 如果已有客户端在运行，先清理
    if (client) {
      try { await client.destroy(); } catch {}
      client = null;
    }

    authStatus = 'waiting';
    qrCodeImageUrl = null;

    // 创建 WhatsApp 客户端
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: '/tmp/whatsapp-session'
      }),
      puppeteer: {
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--no-first-run'
        ]
      }
    });

    // 监听二维码事件
    client.on('qr', async (qr: string) => {
      console.log('QR code received, length:', qr.length);
      try {
        qrCodeImageUrl = await QRCode.toDataURL(qr, {
          width: 400,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        authStatus = 'waiting';
        console.log('QR image generated successfully');
      } catch (error) {
        console.error('Failed to generate QR code image:', error);
      }
    });

    client.on('ready', () => {
      console.log('WhatsApp client ready');
      authStatus = 'success';
      qrCodeImageUrl = null;
    });

    client.on('auth_failure', () => {
      authStatus = 'failed';
    });

    client.on('disconnected', () => {
      if (authStatus === 'waiting') authStatus = 'timeout';
    });

    // 非阻塞初始化：不 await，让 QR 事件有机会触发
    initPromise = client.initialize().catch((err: any) => {
      console.error('WhatsApp init error:', err.message);
      // 不设置 failed，因为 QR 可能已经生成了
    });

    // 等待一段时间让 QR 事件触发
    await new Promise((resolve) => setTimeout(resolve, 8000));

    res.json({
      status: authStatus,
      qrCode: qrCodeImageUrl,
      message: qrCodeImageUrl ? '请扫描二维码' : '正在生成二维码...'
    });

  } catch (error: any) {
    console.error('WhatsApp auth error:', error);
    authStatus = 'failed';
    res.status(500).json({ error: error.message });
  }
});

// 获取认证状态（轮询用）
router.get('/auth/status', (req, res) => {
  res.json({
    status: authStatus,
    qrCode: qrCodeImageUrl,
    authenticated: authStatus === 'success',
    message: authStatus === 'waiting' ? (qrCodeImageUrl ? '请扫描二维码' : '正在生成...') :
             authStatus === 'success' ? '认证成功！' :
             authStatus === 'timeout' ? '二维码已超时' :
             authStatus === 'failed' ? '认证失败' :
             '未开始'
  });
});

// 取消认证
router.post('/auth/cancel', async (req, res) => {
  if (client) {
    try { await client.destroy(); } catch {}
    client = null;
  }
  authStatus = 'idle';
  qrCodeImageUrl = null;
  res.json({ status: 'cancelled' });
});

export default router;
