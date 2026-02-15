import express from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

let authProcess: any = null;
let authStatus: 'idle' | 'waiting' | 'success' | 'failed' | 'timeout' = 'idle';

// 打开终端窗口显示二维码
router.post('/auth/start', async (req, res) => {
  try {
    // 如果已有进程在运行，先清理
    if (authProcess) {
      authProcess.kill();
      authProcess = null;
    }

    authStatus = 'waiting';

    // 使用 osascript 打开新的终端窗口并运行 wacli auth
    const script = `
      tell application "Terminal"
        activate
        set newTab to do script "clear && echo '═══════════════════════════════════════' && echo '   WhatsApp 扫码连接' && echo '═══════════════════════════════════════' && echo '' && echo '请用手机 WhatsApp 扫描下方二维码：' && echo '' && wacli auth && echo '' && echo '扫码完成后可关闭此窗口'"
        set custom title of newTab to "WhatsApp 扫码"
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error) => {
      if (error) {
        console.error('Failed to open terminal:', error);
        authStatus = 'failed';
      }
    });

    // 启动后台进程监听认证状态
    setTimeout(() => {
      authProcess = spawn('wacli', ['doctor'], {
        env: { ...process.env }
      });

      let output = '';
      authProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      authProcess.on('close', () => {
        if (output.includes('authenticated') || output.includes('✓') || output.includes('OK')) {
          authStatus = 'success';
        }
        authProcess = null;
      });
    }, 5000);

    res.json({
      status: 'opened',
      message: '已打开终端窗口，请在终端中扫描二维码'
    });
  } catch (error: any) {
    console.error('WhatsApp auth error:', error);
    authStatus = 'failed';
    res.status(500).json({ error: error.message });
  }
});

// 获取认证状态
router.get('/auth/status', async (req, res) => {
  try {
    // 实时检查 wacli 状态
    const { stdout } = await execAsync('wacli doctor 2>&1');
    const isAuthenticated = stdout.includes('authenticated') || stdout.includes('✓') || stdout.includes('OK');
    
    if (isAuthenticated) {
      authStatus = 'success';
    }

    res.json({
      status: authStatus,
      authenticated: isAuthenticated,
      message: authStatus === 'waiting' ? '等待扫码...' :
               authStatus === 'success' ? '认证成功！' :
               authStatus === 'failed' ? '认证失败' :
               '未开始'
    });
  } catch (error) {
    res.json({
      status: authStatus,
      authenticated: false,
      message: '检查状态失败'
    });
  }
});

// 取消认证
router.post('/auth/cancel', (req, res) => {
  if (authProcess) {
    authProcess.kill();
    authProcess = null;
  }
  authStatus = 'idle';
  res.json({ status: 'cancelled' });
});

export default router;
