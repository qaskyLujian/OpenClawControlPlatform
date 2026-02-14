import { Router } from 'express';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const router = Router();
const CRON_DIR = path.join(os.homedir(), '.openclaw');

// 读取 openclaw.json 中的 cron jobs 配置
async function getCronConfig() {
  const configPath = path.join(CRON_DIR, 'openclaw.json');
  if (!await fs.pathExists(configPath)) return { jobs: [] };
  const config = await fs.readJSON(configPath);
  return { jobs: config.cron?.jobs || [] };
}

// 读取 cron 运行状态（从 session 日志推断）
async function getCronState() {
  const statePath = path.join(CRON_DIR, 'cron-state.json');
  if (await fs.pathExists(statePath)) {
    return await fs.readJSON(statePath);
  }
  return {};
}

// GET /api/tasks - 获取所有定时任务
router.get('/', async (req, res) => {
  try {
    const { jobs } = await getCronConfig();
    const state = await getCronState();

    // 也扫描 sessions.json 中的子代理任务
    const sessionsPath = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    const subagentTasks: any[] = [];

    if (await fs.pathExists(sessionsPath)) {
      const sessions = await fs.readJSON(sessionsPath);
      for (const [key, meta] of Object.entries(sessions) as [string, any][]) {
        if (key.includes('subagent')) {
          subagentTasks.push({
            id: key,
            type: 'subagent',
            label: meta.label || key.split(':').pop()?.substring(0, 8),
            status: meta.abortedLastRun ? 'failed' : (Date.now() - (meta.updatedAt || 0) < 30 * 60 * 1000 ? 'running' : 'completed'),
            model: meta.model || 'unknown',
            updatedAt: meta.updatedAt || 0,
            sessionId: meta.sessionId || ''
          });
        }
      }
    }

    // 格式化 cron jobs
    const cronJobs = jobs.map((job: any, index: number) => ({
      id: job.id || `cron-${index}`,
      type: 'cron',
      name: job.name || `定时任务 ${index + 1}`,
      schedule: job.schedule || {},
      payload: job.payload || {},
      enabled: job.enabled !== false,
      sessionTarget: job.sessionTarget || 'isolated',
      lastRun: state[job.id]?.lastRun || null,
      lastStatus: state[job.id]?.lastStatus || null
    }));

    res.json({ cronJobs, subagentTasks });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// POST /api/tasks/cron - 添加定时任务
router.post('/cron', async (req, res) => {
  try {
    const { name, schedule, payload, sessionTarget, enabled } = req.body;
    if (!schedule || !payload) {
      return res.status(400).json({ error: 'schedule and payload are required' });
    }

    const configPath = path.join(CRON_DIR, 'openclaw.json');
    const config = await fs.readJSON(configPath);
    if (!config.cron) config.cron = {};
    if (!config.cron.jobs) config.cron.jobs = [];

    const newJob = {
      id: `job-${Date.now()}`,
      name: name || '新任务',
      schedule,
      payload,
      sessionTarget: sessionTarget || 'isolated',
      enabled: enabled !== false
    };

    config.cron.jobs.push(newJob);
    await fs.writeJSON(configPath, config, { spaces: 2 });
    res.json({ ok: true, job: newJob });
  } catch (error) {
    console.error('Failed to create cron job:', error);
    res.status(500).json({ error: 'Failed to create cron job' });
  }
});

// PUT /api/tasks/cron/:id - 更新定时任务
router.put('/cron/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const configPath = path.join(CRON_DIR, 'openclaw.json');
    const config = await fs.readJSON(configPath);
    const jobs = config.cron?.jobs || [];
    const index = jobs.findIndex((j: any) => j.id === id);

    if (index === -1) return res.status(404).json({ error: 'Job not found' });

    jobs[index] = { ...jobs[index], ...updates };
    config.cron.jobs = jobs;
    await fs.writeJSON(configPath, config, { spaces: 2 });
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update cron job:', error);
    res.status(500).json({ error: 'Failed to update cron job' });
  }
});

// DELETE /api/tasks/cron/:id - 删除定时任务
router.delete('/cron/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const configPath = path.join(CRON_DIR, 'openclaw.json');
    const config = await fs.readJSON(configPath);

    const jobs = config.cron?.jobs || [];
    config.cron.jobs = jobs.filter((j: any) => j.id !== id);
    await fs.writeJSON(configPath, config, { spaces: 2 });
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete cron job:', error);
    res.status(500).json({ error: 'Failed to delete cron job' });
  }
});

export default router;
