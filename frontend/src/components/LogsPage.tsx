import { Button, Input, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

export default function LogsPage() {
  const logs = [
    { time: '22:57:15', level: 'info', source: 'gateway', message: 'Session main-001 heartbeat received' },
    { time: '22:57:12', level: 'info', source: 'api', message: 'GET /api/status - 200 OK (45ms)' },
    { time: '22:57:10', level: 'success', source: 'socket', message: 'Client connected: socket-abc123' },
    { time: '22:57:08', level: 'info', source: 'system', message: 'Memory usage: 15% (2.4GB / 16GB)' },
    { time: '22:57:05', level: 'info', source: 'gateway', message: 'Token usage updated: 26.5M tokens today' },
    { time: '22:57:02', level: 'warning', source: 'api', message: 'Rate limit approaching: 85% of quota' },
    { time: '22:57:00', level: 'info', source: 'system', message: 'CPU usage: 100% (high load detected)' },
    { time: '22:56:58', level: 'info', source: 'gateway', message: 'Subagent task-042 completed successfully' },
    { time: '22:56:55', level: 'error', source: 'api', message: 'Failed to connect to model provider: timeout' },
    { time: '22:56:52', level: 'info', source: 'socket', message: 'Broadcasting dashboard update to 3 clients' },
  ];

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      info: 'var(--text-secondary)',
      success: 'var(--figma-green)',
      warning: 'var(--figma-yellow)',
      error: 'var(--figma-red)'
    };
    return colors[level] || 'var(--text-secondary)';
  };

  return (
    <div>
      {/* Controls */}
      <div style={{
        marginBottom: 16,
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center'
      }}>
        <Input
          placeholder="搜索日志..."
          prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
          className="figma-input"
          style={{ width: 300 }}
        />
        <Select
          defaultValue="all"
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '所有级别' },
            { value: 'info', label: 'INFO' },
            { value: 'success', label: 'SUCCESS' },
            { value: 'warning', label: 'WARNING' },
            { value: 'error', label: 'ERROR' },
          ]}
        />
        <div style={{ flex: 1 }} />
        <Button
          icon={<ReloadOutlined />}
          className="figma-btn figma-btn-ghost"
        >
          刷新
        </Button>
      </div>

      {/* Log Console */}
      <div className="figma-panel">
        <div className="figma-panel-header">
          <div className="figma-panel-title">实时日志</div>
          <span className="figma-badge figma-badge-green">实时</span>
        </div>
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--bg-secondary)',
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 12
        }}>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: 'var(--space-2)',
                marginBottom: 2,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'var(--text-tertiary)', minWidth: 60 }}>
                {log.time}
              </span>
              <span style={{
                color: getLevelColor(log.level),
                minWidth: 60,
                fontSize: 11,
                fontWeight: 500
              }}>
                {log.level.toUpperCase()}
              </span>
              <span className="figma-badge figma-badge-gray" style={{ minWidth: 70 }}>
                {log.source}
              </span>
              <span style={{ color: 'var(--text-primary)', flex: 1 }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="figma-card" style={{
        marginTop: 16,
        padding: 'var(--space-3)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        color: 'var(--text-tertiary)'
      }}>
        <span>总日志: 10</span>
        <span>INFO: 7</span>
        <span>SUCCESS: 1</span>
        <span>WARNING: 1</span>
        <span>ERROR: 1</span>
        <span>最后更新: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
