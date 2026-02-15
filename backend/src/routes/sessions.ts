import { readConfig, writeConfig } from '../utils/config';
import { Router } from 'express';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const router = Router();
const SESSIONS_DIR = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions');

// 从消息文本中提取 conversation_label
function extractChannel(text: string): string | null {
  const match = text.match(/"conversation_label"\s*:\s*"([^"]+)"/);
  if (!match) return null;
  const label = match[1];
  // "openclaw-tui" → webchat, "telegram:xxx" → telegram, "Small Rookie ... id:xxx" → telegram
  if (label === 'openclaw-tui') return 'webchat';
  if (label.startsWith('telegram:')) return 'telegram';
  if (/id:\d+/.test(label)) return 'telegram';
  if (label.startsWith('discord:')) return 'discord';
  if (label.startsWith('whatsapp:')) return 'whatsapp';
  if (label.startsWith('signal:')) return 'signal';
  return label;
}

// GET /api/sessions — 会话列表
router.get('/', async (req, res) => {
  try {
    const sessionsJsonPath = path.join(SESSIONS_DIR, 'sessions.json');
    if (!await fs.pathExists(sessionsJsonPath)) {
      return res.json({ sessions: [] });
    }

    const sessionsData = await fs.readJSON(sessionsJsonPath);
    const now = Date.now();
    const activeThreshold = 30 * 60 * 1000;
    const sessions = [];

    for (const [key, meta] of Object.entries(sessionsData) as [string, any][]) {
      const sessionFile = path.join(SESSIONS_DIR, `${meta.sessionId}.jsonl`);
      let messageCount = 0;
      let tokenCount = 0;
      let fileSize = 0;
      let firstMessageAt: string | null = null;
      let lastMessageAt: string | null = null;
      const channelsSet = new Set<string>();

      if (await fs.pathExists(sessionFile)) {
        try {
          const stat = await fs.stat(sessionFile);
          fileSize = stat.size;
          const content = await fs.readFile(sessionFile, 'utf-8');
          const lines = content.trim().split('\n').filter((l: string) => l.length > 0);
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              if (entry.message?.role === 'user' || entry.message?.role === 'assistant') {
                messageCount++;
                const ts = entry.message?.timestamp || entry.timestamp;
                if (ts) {
                  if (!firstMessageAt) firstMessageAt = ts;
                  lastMessageAt = ts;
                }
              }
              if (entry.message?.usage?.totalTokens) {
                tokenCount += entry.message.usage.totalTokens;
              }
              // 提取渠道
              if (entry.message?.role === 'user') {
                let text = '';
                if (typeof entry.message.content === 'string') {
                  text = entry.message.content;
                } else if (Array.isArray(entry.message.content)) {
                  text = entry.message.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n');
                }
                const ch = extractChannel(text);
                if (ch) channelsSet.add(ch);
              }
            } catch {}
          }
        } catch {}
      }

      // fallback: 如果没扫到任何渠道，用 meta 里的
      if (channelsSet.size === 0) {
        const fallbackCh = meta.deliveryContext?.channel || meta.origin?.provider || 'unknown';
        channelsSet.add(fallbackCh);
      }

      sessions.push({
        key,
        sessionId: meta.sessionId || '',
        kind: meta.kind || 'main',
        chatType: meta.chatType || 'unknown',
        channel: meta.deliveryContext?.channel || meta.origin?.provider || 'unknown',
        channels: [...channelsSet],
        label: meta.label || '',
        lastTo: meta.lastTo || '',
        updatedAt: meta.updatedAt || 0,
        compactionCount: meta.compactionCount || 0,
        active: meta.updatedAt ? (now - meta.updatedAt < activeThreshold) : false,
        messageCount,
        tokenCount,
        fileSize,
        firstMessageAt,
        lastMessageAt
      });
    }

    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    res.json({ sessions });
  } catch (error) {
    console.error('Failed to get sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// GET /api/sessions/:sessionId/messages — 会话消息历史
router.get('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const filter = (req.query.filter as string) || 'chat'; // chat | all
    const channelFilter = (req.query.channel as string) || ''; // 按渠道过滤

    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.jsonl`);
    if (!await fs.pathExists(sessionFile)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const content = await fs.readFile(sessionFile, 'utf-8');
    const lines = content.trim().split('\n').filter((l: string) => l.length > 0);

    // 先扫一遍建立 user 消息的渠道映射，assistant 消息继承前一个 user 的渠道
    let currentChannel = 'unknown';
    const messages: any[] = [];

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const role = entry.message?.role;

        if (filter === 'chat') {
          if (role !== 'user' && role !== 'assistant') continue;
          if (role === 'assistant' && Array.isArray(entry.message?.content)) {
            const hasText = entry.message.content.some((c: any) => c.type === 'text' && c.text?.trim());
            if (!hasText) continue;
          }
        } else {
          if (!role) continue;
        }

        let text = '';
        if (typeof entry.message?.content === 'string') {
          text = entry.message.content;
        } else if (Array.isArray(entry.message?.content)) {
          text = entry.message.content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join('\n');
        }

        // 提取渠道
        if (role === 'user') {
          const ch = extractChannel(text);
          if (ch) currentChannel = ch;
        }

        // 从 user 消息中去掉 metadata 头部，只保留实际内容
        let displayText = text;
        if (role === 'user') {
          // 去掉 "Conversation info..." 和 heartbeat 前缀
          const cleanMatch = text.match(/\n\n\[.*?\]\s*([\s\S]*)/);
          if (cleanMatch) {
            displayText = cleanMatch[1].trim();
          } else {
            // 尝试去掉 conversation_label json block
            const altMatch = text.match(/```json[\s\S]*?```\s*\n*([\s\S]*)/);
            if (altMatch && altMatch[1].trim()) {
              displayText = altMatch[1].trim();
            }
          }
        }

        // 渠道过滤
        if (channelFilter && currentChannel !== channelFilter) continue;

        messages.push({
          id: entry.id,
          role,
          text: displayText.substring(0, 2000),
          fullLength: displayText.length,
          timestamp: entry.message?.timestamp || entry.timestamp,
          usage: entry.message?.usage || null,
          model: entry.message?.model || null,
          channel: currentChannel
        });
      } catch {}
    }

    const total = messages.length;
    const sliced = messages.slice(offset, offset + limit);

    res.json({ messages: sliced, total, offset, limit });
  } catch (error) {
    console.error('Failed to get session messages:', error);
    res.status(500).json({ error: 'Failed to get session messages' });
  }
});

// DELETE /api/sessions/:sessionKey — 删除会话
router.delete('/:sessionKey', async (req, res) => {
  try {
    const sessionKey = decodeURIComponent(req.params.sessionKey);
    const sessionsJsonPath = path.join(SESSIONS_DIR, 'sessions.json');

    if (!await fs.pathExists(sessionsJsonPath)) {
      return res.status(404).json({ error: 'Sessions file not found' });
    }

    const sessionsData = await fs.readJSON(sessionsJsonPath);
    const meta = sessionsData[sessionKey];
    if (!meta) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (sessionKey === 'agent:main:main') {
      return res.status(403).json({ error: '不能删除主会话' });
    }

    const sessionFile = path.join(SESSIONS_DIR, `${meta.sessionId}.jsonl`);
    if (await fs.pathExists(sessionFile)) {
      await fs.remove(sessionFile);
    }

    delete sessionsData[sessionKey];
    await fs.writeJSON(sessionsJsonPath, sessionsData, { spaces: 2 });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
