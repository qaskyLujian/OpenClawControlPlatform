import { readConfig, writeConfig } from '../utils/config';
import { Router } from 'express';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    if (!await fs.pathExists(configPath)) {
      return res.json({ providers: [] });
    }

    const config = await readConfig();
    const providerEntries = Object.entries(config.models?.providers || {});

    // 统计每个 provider 的 token 使用量
    const usageByProvider: Record<string, { tokens: number; requests: number }> = {};
    const sessionsDir = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions');

    if (await fs.pathExists(sessionsDir)) {
      const files = await fs.readdir(sessionsDir);
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));

      for (const file of jsonlFiles) {
        try {
          const content = await fs.readFile(path.join(sessionsDir, file), 'utf-8');
          const lines = content.trim().split('\n').filter((l: string) => l.length > 0);
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              const provider = entry.message?.provider;
              const tokens = entry.message?.usage?.totalTokens;
              if (provider && tokens) {
                if (!usageByProvider[provider]) {
                  usageByProvider[provider] = { tokens: 0, requests: 0 };
                }
                usageByProvider[provider].tokens += tokens;
                usageByProvider[provider].requests++;
              }
            } catch {}
          }
        } catch {}
      }
    }

    const providers = providerEntries.map(([name, data]: [string, any]) => ({
      name,
      baseUrl: data.baseUrl || '',
      api: data.api || '',
      models: (data.models || []).map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        contextWindow: m.contextWindow || 0,
        maxTokens: m.maxTokens || 0,
        reasoning: m.reasoning || false,
        cost: m.cost || null
      })),
      totalTokens: usageByProvider[name]?.tokens || 0,
      totalRequests: usageByProvider[name]?.requests || 0
    }));

    res.json({ providers });
  } catch (error) {
    console.error('Failed to get models:', error);
    res.status(500).json({ error: 'Failed to get models' });
  }
});

export default router;
