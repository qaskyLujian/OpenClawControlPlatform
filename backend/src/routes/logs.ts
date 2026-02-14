import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const router = Router();

interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}

function parseGatewayLog(content: string): LogEntry[] {
  const logs: LogEntry[] = [];
  const lines = content.trim().split('\n').filter(l => l.length > 0);

  for (const line of lines) {
    // 格式: 2026-02-14T15:44:14.546Z [subsystem] message
    const match = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s+\[([^\]]+)\]\s+(.+)$/);
    if (match) {
      const message = match[3];
      let level = 'info';
      if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fail')) {
        level = 'error';
      } else if (message.toLowerCase().includes('warn')) {
        level = 'warn';
      }

      logs.push({
        timestamp: match[1],
        level,
        source: match[2],
        message: match[3]
      });
    }
  }

  return logs;
}

function parseErrLog(content: string): LogEntry[] {
  const logs: LogEntry[] = [];
  const lines = content.trim().split('\n').filter(l => l.length > 0);

  for (const line of lines) {
    // 过滤掉无用的行
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('Usage:') || trimmed.startsWith('Commands:') || trimmed.startsWith('Options:') || trimmed.match(/^\s/) || trimmed.length < 10) continue;

    const match = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s+(.+)$/);
    if (match) {
      logs.push({
        timestamp: match[1],
        level: 'error',
        source: 'stderr',
        message: match[2]
      });
    }
  }

  return logs;
}

router.get('/', async (req, res) => {
  try {
    const allLogs: LogEntry[] = [];

    // 读取 gateway.log
    const gatewayLogPath = path.join(os.homedir(), '.openclaw', 'logs', 'gateway.log');
    if (await fs.pathExists(gatewayLogPath)) {
      try {
        const content = await fs.readFile(gatewayLogPath, 'utf-8');
        // 只读取最后 200 行以提高性能
        const lines = content.trim().split('\n');
        const recentLines = lines.slice(-200).join('\n');
        allLogs.push(...parseGatewayLog(recentLines));
      } catch {}
    }

    // 读取 gateway.err.log
    const errLogPath = path.join(os.homedir(), '.openclaw', 'logs', 'gateway.err.log');
    if (await fs.pathExists(errLogPath)) {
      try {
        const content = await fs.readFile(errLogPath, 'utf-8');
        const lines = content.trim().split('\n');
        const recentLines = lines.slice(-50).join('\n');
        allLogs.push(...parseErrLog(recentLines));
      } catch {}
    }

    // 按时间降序排列，取最近 50 条
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const logs = allLogs.slice(0, 50);

    res.json({ logs });
  } catch (error) {
    console.error('Failed to get logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

export default router;
