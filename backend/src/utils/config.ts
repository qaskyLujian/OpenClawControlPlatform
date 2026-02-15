import fs from 'fs-extra';
import JSON5 from 'json5';
import os from 'os';

export const CONFIG_PATH = `${os.homedir()}/.openclaw/openclaw.json`;

// 读取配置（支持 json5 格式，兼容 trailing comma）
export async function readConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
  return JSON5.parse(raw);
}

// 写入配置（标准 JSON）
export async function writeConfig(config: any) {
  await fs.writeJSON(CONFIG_PATH, config, { spaces: 2 });
}
