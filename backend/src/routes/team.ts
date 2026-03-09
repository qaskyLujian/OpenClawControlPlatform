import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const router = Router();
const TEAM_CACHE_TTL_MS = 15000;
let teamCache: { timestamp: number; data: { agents: AgentStatus[]; timestamp: number } } | null = null;

interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  model: string;
  workspace: string;
  online: boolean;
  lastActive: number;
  currentTask: string;
  totalTokens: number;
  sessionCount: number;
  recentSessions: {
    label: string;
    updatedAt: number;
    tokenCount: number;
    status: string;
  }[];
}

const AGENTS = [
  {
    id: 'main',
    name: '全能小助手',
    emoji: '🤖',
    workspace: '~/.openclaw/workspace',
    sessionsPath: '~/.openclaw/agents/main/sessions'
  },
  {
    id: 'pm',
    name: '0号-经理',
    emoji: '0️⃣',
    workspace: '~/.openclaw/workspace-pm',
    sessionsPath: '~/.openclaw/agents/pm/sessions'
  },
  {
    id: 'dev',
    name: '1号-开发',
    emoji: '1️⃣',
    workspace: '~/.openclaw/workspace-dev',
    sessionsPath: '~/.openclaw/agents/dev/sessions'
  },
  {
    id: 'qa',
    name: '2号-测试',
    emoji: '2️⃣',
    workspace: '~/.openclaw/workspace-qa',
    sessionsPath: '~/.openclaw/agents/qa/sessions'
  }
];

function expandPath(p: string): string {
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

async function readSessionsJson(sessionsPath: string): Promise<Record<string, any>> {
  try {
    const fullPath = path.join(expandPath(sessionsPath), 'sessions.json');
    const content = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function getSessionTokens(session: any): number {
  if (typeof session.totalTokens === 'number') return session.totalTokens;
  if (typeof session.tokenCount === 'number') return session.tokenCount;
  const input = typeof session.inputTokens === 'number' ? session.inputTokens : 0;
  const output = typeof session.outputTokens === 'number' ? session.outputTokens : 0;
  return input + output;
}

async function checkSystemdService(serviceName: string): Promise<boolean> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { stdout } = await execAsync(`systemctl is-active ${serviceName}.service`);
    return stdout.trim() === 'active';
  } catch {
    return false;
  }
}

async function getAgentStatus(agentConfig: typeof AGENTS[0]): Promise<AgentStatus> {
  const sessionsData = await readSessionsJson(agentConfig.sessionsPath);
  const sessions = Object.entries(sessionsData).map(([key, meta]) => ({ key, ...(meta as any) }));

  sessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  const totalTokens = sessions.reduce((sum, session) => sum + getSessionTokens(session), 0);
  const recentSessions = sessions.slice(0, 5).map((session) => {
    const updatedAt = session.updatedAt || 0;
    return {
      label: session.label || session.key || 'Unnamed Session',
      updatedAt,
      tokenCount: getSessionTokens(session),
      status: updatedAt > fiveMinutesAgo ? 'active' : 'completed'
    };
  });

  const latestSession = sessions[0];
  
  // 检查 systemd 服务状态（pm/dev/qa 有独立服务）
  let online = !!latestSession && (latestSession.updatedAt || 0) > fiveMinutesAgo;
  if (agentConfig.id === 'pm') {
    online = await checkSystemdService('discord-bot0');
  } else if (agentConfig.id === 'dev') {
    online = await checkSystemdService('discord-bot1');
  } else if (agentConfig.id === 'qa') {
    online = await checkSystemdService('discord-bot2');
  }

  return {
    id: agentConfig.id,
    name: agentConfig.name,
    emoji: agentConfig.emoji,
    model: latestSession?.model || 'unknown',
    workspace: agentConfig.workspace,
    online,
    lastActive: latestSession?.updatedAt || 0,
    currentTask: latestSession?.label || latestSession?.key || 'No active task',
    totalTokens,
    sessionCount: sessions.length,
    recentSessions
  };
}

router.get('/', async (_req, res) => {
  try {
    if (teamCache && Date.now() - teamCache.timestamp < TEAM_CACHE_TTL_MS) {
      return res.json(teamCache.data);
    }

    const statuses = await Promise.all(AGENTS.map(agent => getAgentStatus(agent)));
    const data = {
      agents: statuses,
      timestamp: Date.now()
    };

    teamCache = { timestamp: Date.now(), data };
    return res.json(data);
  } catch (error) {
    console.error('Team status error:', error);
    return res.status(500).json({ error: 'Failed to get team status' });
  }
});

router.post('/control', async (req, res) => {
  try {
    const { agentId, action } = req.body;
    
    if (!agentId || !action) {
      return res.status(400).json({ error: 'Missing agentId or action' });
    }

    if (!['start', 'stop', 'restart'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // 映射 agentId 到 systemd 服务名
    const serviceMap: Record<string, string> = {
      'pm': 'discord-bot0',
      'dev': 'discord-bot1',
      'qa': 'discord-bot2'
    };

    const serviceName = serviceMap[agentId];
    if (!serviceName) {
      return res.status(400).json({ error: `Agent ${agentId} does not have a systemd service` });
    }

    // 执行 systemctl 命令
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const command = `systemctl ${action} ${serviceName}.service`;
    await execAsync(command);

    // 清除缓存，强制刷新
    teamCache = null;

    return res.json({ success: true, message: `${action} ${serviceName} successfully` });
  } catch (error) {
    console.error('Control error:', error);
    return res.status(500).json({ error: `Failed to ${req.body.action} agent` });
  }
});

export default router;
