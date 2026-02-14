import { Row, Col, Button, Input } from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined, DownloadOutlined } from '@ant-design/icons';

export default function SessionsPage() {
  // Mock data
  const sessions = [
    {
      key: '1',
      id: 'main-session-001',
      type: 'main',
      status: 'active',
      messages: 1247,
      tokens: 2456789,
      created: '2026-02-14 09:30:15',
      lastActive: '2 分钟前'
    },
    {
      key: '2',
      id: 'subagent-task-042',
      type: 'subagent',
      status: 'active',
      messages: 23,
      tokens: 45678,
      created: '2026-02-14 21:45:30',
      lastActive: '5 分钟前'
    },
    {
      key: '3',
      id: 'isolated-dev-003',
      type: 'isolated',
      status: 'idle',
      messages: 567,
      tokens: 892345,
      created: '2026-02-13 14:20:00',
      lastActive: '2 小时前'
    },
  ];

  const typeNames: Record<string, string> = {
    main: '主会话',
    subagent: '子代理',
    isolated: '隔离会话'
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Input
          placeholder="搜索会话..."
          prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
          className="figma-input"
          style={{ width: 300 }}
        />
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">总会话</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-purple)' }}>3</div>
          </div>
        </Col>
        <Col span={8}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">活跃中</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-green)' }}>2</div>
          </div>
        </Col>
        <Col span={8}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">空闲中</div>
            <div className="figma-stat-value" style={{ color: 'var(--text-tertiary)' }}>1</div>
          </div>
        </Col>
      </Row>

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sessions.map(session => (
          <div key={session.key} className="figma-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-3)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)'
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {session.id}
                  </span>
                  <span className={`figma-badge figma-badge-${session.type === 'main' ? 'purple' : session.type === 'subagent' ? 'blue' : 'gray'}`}>
                    {typeNames[session.type]}
                  </span>
                  <span className={`figma-badge figma-badge-${session.status === 'active' ? 'green' : 'gray'}`}>
                    {session.status === 'active' ? '活跃' : '空闲'}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-6)',
                  fontSize: 12,
                  color: 'var(--text-secondary)'
                }}>
                  <span>消息: {session.messages.toLocaleString()}</span>
                  <span>Token: {(session.tokens / 1000).toFixed(1)}K</span>
                  <span>最后活跃: {session.lastActive}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button
                  icon={<EyeOutlined />}
                  className="figma-btn figma-btn-ghost"
                  size="small"
                >
                  查看
                </Button>
                <Button
                  icon={<StopOutlined />}
                  className="figma-btn figma-btn-ghost"
                  size="small"
                >
                  停止
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  className="figma-btn figma-btn-ghost"
                  size="small"
                >
                  导出
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
