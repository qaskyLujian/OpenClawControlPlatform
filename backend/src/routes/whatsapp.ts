import express from 'express';
import { spawn } from 'child_process';
import sharp from 'sharp';

const router = express.Router();

let authProcess: any = null;
let qrCodeImageUrl: string | null = null;
let authStatus: 'idle' | 'waiting' | 'success' | 'failed' | 'timeout' = 'idle';

// 将 wacli 输出的 Unicode 方块字符二维码解析为像素矩阵
// █ = 上下都黑, ▀ = 上黑下白, ▄ = 上白下黑, 空格 = 上下都白
function parseBlockQR(text: string): number[][] {
  const lines = text.split('\n').filter(l => l.includes('█') || l.includes('▄') || l.includes('▀'));
  if (lines.length === 0) return [];

  const matrix: number[][] = [];
  for (const line of lines) {
    const topRow: number[] = [];
    const bottomRow: number[] = [];
    for (const ch of line) {
      switch (ch) {
        case '█': topRow.push(1); bottomRow.push(1); break;
        case '▀': topRow.push(1); bottomRow.push(0); break;
        case '▄': topRow.push(0); bottomRow.push(1); break;
        case ' ': topRow.push(0); bottomRow.push(0); break;
        default: topRow.push(0); bottomRow.push(0); break;
      }
    }
    matrix.push(topRow);
    matrix.push(bottomRow);
  }
  return matrix;
}

// 将像素矩阵生成 PNG 图片（data URL）
async function matrixToPng(matrix: number[][], scale: number = 6): Promise<string> {
  const height = matrix.length;
  const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  
  // 添加白色边距
  const margin = 4;
  const imgW = (width + margin * 2) * scale;
  const imgH = (height + margin * 2) * scale;
  
  // 创建 RGBA 像素数据
  const pixels = Buffer.alloc(imgW * imgH * 4, 255); // 全白
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < (matrix[y]?.length || 0); x++) {
      if (matrix[y][x] === 1) {
        // 黑色像素，按 scale 放大
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = (x + margin) * scale + sx;
            const py = (y + margin) * scale + sy;
            const idx = (py * imgW + px) * 4;
            pixels[idx] = 0;     // R
            pixels[idx + 1] = 0; // G
            pixels[idx + 2] = 0; // B
            pixels[idx + 3] = 255; // A
          }
        }
      }
    }
  }
  
  const png = await sharp(pixels, { raw: { width: imgW, height: imgH, channels: 4 } })
    .png()
    .toBuffer();
  
  return `data:image/png;base64,${png.toString('base64')}`;
}

// 启动 wacli 认证并捕获二维码
router.post('/auth/start', async (req, res) => {
  try {
    if (authProcess) {
      authProcess.kill();
      authProcess = null;
    }

    authStatus = 'waiting';
    qrCodeImageUrl = null;

    let allOutput = '';
    let qrGenerated = false;

    authProcess = spawn('wacli', ['auth'], { env: { ...process.env } });

    const handleOutput = async (data: Buffer) => {
      const text = data.toString();
      allOutput += text;

      // 检测认证成功
      if (text.includes('Authenticated') || text.includes('successfully') || text.includes('logged in')) {
        authStatus = 'success';
        if (authProcess) { authProcess.kill(); authProcess = null; }
        return;
      }

      // 检测超时
      if (text.includes('timed out') || text.includes('timeout')) {
        authStatus = 'timeout';
        if (authProcess) { authProcess.kill(); authProcess = null; }
        return;
      }

      // 尝试解析二维码
      if (!qrGenerated && (text.includes('█') || text.includes('▄') || text.includes('▀'))) {
        const matrix = parseBlockQR(allOutput);
        if (matrix.length > 20) {
          try {
            qrCodeImageUrl = await matrixToPng(matrix);
            qrGenerated = true;
            console.log('QR code image generated from wacli output');
          } catch (err) {
            console.error('Failed to generate QR image:', err);
          }
        }
      }
    };

    authProcess.stdout.on('data', handleOutput);
    authProcess.stderr.on('data', handleOutput);

    authProcess.on('close', (code: number) => {
      if (authStatus === 'waiting') {
        // 进程结束后再检查一次 wacli doctor
        try {
          const { execSync } = require('child_process');
          const doc = execSync('wacli doctor 2>&1', { encoding: 'utf-8', timeout: 5000 });
          if (doc.includes('AUTHENTICATED  true')) {
            authStatus = 'success';
          } else {
            authStatus = code === 0 ? 'success' : 'failed';
          }
        } catch {
          authStatus = code === 0 ? 'success' : 'failed';
        }
      }
      authProcess = null;
    });

    // 等待二维码生成
    await new Promise(resolve => setTimeout(resolve, 5000));

    res.json({
      status: authStatus,
      qrCode: qrCodeImageUrl,
      message: qrCodeImageUrl ? '请扫描二维码' :
               authStatus === 'success' ? '认证成功！' :
               '正在生成二维码...'
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
router.post('/auth/cancel', (req, res) => {
  if (authProcess) {
    authProcess.kill();
    authProcess = null;
  }
  authStatus = 'idle';
  qrCodeImageUrl = null;
  res.json({ status: 'cancelled' });
});

export default router;
