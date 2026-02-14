export interface DashboardData {
  gateway: {
    status: 'running' | 'stopped' | 'error';
    uptime: string;
    pid: number | null;
  };
  sessions: {
    total: number;
    active: number;
    subagents: number;
  };
  usage: {
    tokensToday: number;
    requestsToday: number;
  };
  system: {
    cpu: number;
    memory: number;
  };
}

export interface Session {
  key: string;
  kind: 'direct' | 'subagent';
  age: string;
  model: string;
  tokens: {
    used: number;
    total: number;
    percentage: number;
  };
  lastActive: string;
}

export interface ModelProvider {
  name: string;
  baseUrl: string;
  api: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  alias?: string;
  contextWindow: number;
  maxTokens: number;
  reasoning: boolean;
}

export interface Skill {
  name: string;
  status: 'ready' | 'missing';
  description: string;
  source: string;
  emoji: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  meta?: any;
}
