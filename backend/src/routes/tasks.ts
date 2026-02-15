import { Router } from 'express';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const router = Router();
const CRON_FILE = path.join(os.homedir(), '.openclaw', 'admin-cron-jobs.json');

// 读写独立的 cron 配置文件（不写入 openclaw.json）
async function readCronJobs(): Promise<any[]> {
  if (await fs.pathExists(CRON_FILE)) {
    return await fs.readJSON(CRON_FILE);
  }
  return [];
}

async function writeCronJobs(jobs: any[]) {
  await fs.writeJSON(CRON_FILE, jobs, { spaces: 2 });
}

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const cronJobs = (await readCronJobs()).map((job: any, i: number) => ({
      id: job.id || `cron-${i}`,
      type: 'cron',
      name: job.name || '未命名任务',
      schedule: job.schedule || {},
      payload: job.payload || {},
      enabled: job.enabled !== false,
      sessionTarget: job.sessionTarget || 'isolated',
      lastRun: job.lastRun || null,
      lastStatus: job.lastStatus || null
    }));

    // 子代理任务
    const sessionsPath = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    const subagentTasks: any[] = [];
    if (await fs.pathExists(sessionsPath)) {
      const sessions = await fs.readJSON(sessionsPath);
      for (const [key, meta] of Object.entries(sessions) as [string, any][]) {
        if (key.includes('subagent')) {
          subagentTasks.push({
            id: key, type: 'subagent',
            label: meta.label || key.split(':').pop()?.substring(0, 8),
            status: meta.abortedLastRun ? 'failed' : (Date.now() - (meta.updatedAt || 0) < 30 * 60 * 1000 ? 'running' : 'completed'),
            model: meta.model || 'unknown',
            updatedAt: meta.updatedAt || 0,
            sessionId: meta.sessionId || ''
          });
        }
      }
    }

    res.json({ cronJobs, subagentTasks });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// POST /api/tasks/cron
router.post('/cron', async (req, res) => {
  try {
    const { name, schedule, payload, sessionTarget, enabled } = req.body;
    if (!schedule || !payload) {
      return res.status(400).json({ error: 'schedule and payload are required' });
    }

    const jobs = await readCronJobs();
    const newJob = {
      id: `job-${Date.now()}`,
      name: name || '新任务',
      schedule, payload,
      sessionTarget: sessionTarget || 'isolated',
      enabled: enabled !== false
    };
    jobs.push(newJob);
    await writeCronJobs(jobs);
    res.json({ ok: true, job: newJob });
  } catch (error) {
    console.error('Failed to create cron job:', error);
    res.status(500).json({ error: 'Failed to create cron job' });
  }
});

// PUT /api/tasks/cron/:id
router.put('/cron/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const jobs = await readCronJobs();
    const index = jobs.findIndex((j: any) => j.id === id);
    if (index === -1) return res.status(404).json({ error: 'Job not found' });

    jobs[index] = { ...jobs[index], ...updates };
    await writeCronJobs(jobs);
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update cron job:', error);
    res.status(500).json({ error: 'Failed to update cron job' });
  }
});

// DELETE /api/tasks/cron/:id
router.delete('/cron/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await readCronJobs();
    await writeCronJobs(jobs.filter((j: any) => j.id !== id));
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete cron job:', error);
    res.status(500).json({ error: 'Failed to delete cron job' });
  }
});

export default router;
