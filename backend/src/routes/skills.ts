import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = Router();

const SYSTEM_SKILLS_DIR = '/root/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/skills';
const CUSTOM_SKILLS_DIR = '/root/.openclaw/workspace/skills';

async function scanSkillsDir(dir: string, source: string) {
  const skills: any[] = [];
  if (!await fs.pathExists(dir)) return skills;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;

    const skillMdPath = path.join(dir, entry.name, 'SKILL.md');
    const hasSkillMd = await fs.pathExists(skillMdPath);
    let description = '';

    if (hasSkillMd) {
      try {
        const content = await fs.readFile(skillMdPath, 'utf-8');
        // 解析 YAML frontmatter 中的 description
        const descMatch = content.match(/description:\s*"?([^"\n]+)"?/);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      } catch {}
    }

    skills.push({
      name: entry.name,
      description,
      source,
      hasSkillMd
    });
  }

  return skills;
}

router.get('/', async (req, res) => {
  try {
    const [systemSkills, customSkills] = await Promise.all([
      scanSkillsDir(SYSTEM_SKILLS_DIR, 'system'),
      scanSkillsDir(CUSTOM_SKILLS_DIR, 'custom')
    ]);

    // 去重：如果系统目录里有符号链接指向自定义目录，优先标记为 custom
    const customNames = new Set(customSkills.map(s => s.name));
    const deduped = systemSkills.filter(s => !customNames.has(s.name));
    const skills = [...deduped, ...customSkills].sort((a, b) => a.name.localeCompare(b.name));
    res.json({ skills });
  } catch (error) {
    console.error('Failed to get skills:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

export default router;
