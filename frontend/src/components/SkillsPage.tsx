import { Row, Col, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default function SkillsPage() {
  const skills = [
    {
      name: 'github',
      description: 'Interact with GitHub using the gh CLI',
      status: 'enabled',
      version: '1.0.0',
      usageCount: 234
    },
    {
      name: 'apple-notes',
      description: 'Manage Apple Notes via the memo CLI',
      status: 'enabled',
      version: '1.2.1',
      usageCount: 89
    },
    {
      name: 'weather',
      description: 'Get current weather and forecasts',
      status: 'enabled',
      version: '2.0.0',
      usageCount: 45
    },
    {
      name: 'summarize',
      description: 'Summarize URLs, podcasts, and local files',
      status: 'disabled',
      version: '1.5.0',
      usageCount: 0
    },
  ];

  return (
    <div>
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">总技能</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-purple)' }}>
              {skills.length}
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">已启用</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-green)' }}>
              {skills.filter(s => s.status === 'enabled').length}
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">已禁用</div>
            <div className="figma-stat-value" style={{ color: 'var(--text-tertiary)' }}>
              {skills.filter(s => s.status === 'disabled').length}
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">总使用</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-blue)' }}>
              {skills.reduce((sum, s) => sum + s.usageCount, 0)}
            </div>
          </div>
        </Col>
      </Row>

      {/* Skills Grid */}
      <Row gutter={[16, 16]}>
        {skills.map(skill => (
          <Col span={12} key={skill.name}>
            <div className="figma-card" style={{ padding: 'var(--space-4)' }}>
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
                    marginBottom: 'var(--space-1)'
                  }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {skill.name}
                    </span>
                    {skill.status === 'enabled' ? (
                      <CheckCircleOutlined style={{ color: 'var(--figma-green)', fontSize: 16 }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: 'var(--text-tertiary)', fontSize: 16 }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    {skill.description}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  fontSize: 11,
                  color: 'var(--text-tertiary)'
                }}>
                  <span>版本: {skill.version}</span>
                  <span>使用: {skill.usageCount}</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    className="figma-btn figma-btn-ghost"
                    size="small"
                  >
                    {skill.status === 'enabled' ? '禁用' : '启用'}
                  </Button>
                  <Button
                    className="figma-btn figma-btn-ghost"
                    size="small"
                  >
                    配置
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
