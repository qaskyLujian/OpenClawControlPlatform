import { Row, Col, Button } from 'antd';

export default function ModelsPage() {
  const models = [
    {
      id: 'claude-sonnet-4-5',
      provider: 'wj-1',
      alias: 'Claude',
      status: 'active',
      usage: 65,
      requests: 847,
      tokens: 12456789,
    },
    {
      id: 'claude-opus-4-6',
      provider: 'wj-2',
      alias: 'claude-opus-4-6',
      status: 'active',
      usage: 35,
      requests: 234,
      tokens: 5678901,
    },
    {
      id: 'gpt-5.2-codex',
      provider: 'wj-7',
      alias: 'gpt-5.2-codex',
      status: 'active',
      usage: 20,
      requests: 156,
      tokens: 2345678,
    },
  ];

  return (
    <div>
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">提供商</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-purple)' }}>3</div>
          </div>
        </Col>
        <Col span={8}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">活跃模型</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-blue)' }}>3</div>
          </div>
        </Col>
        <Col span={8}>
          <div className="figma-card figma-stat">
            <div className="figma-stat-label">总请求</div>
            <div className="figma-stat-value" style={{ color: 'var(--figma-green)' }}>1,237</div>
          </div>
        </Col>
      </Row>

      {/* Models List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {models.map(model => (
          <div key={model.id} className="figma-panel">
            <div className="figma-panel-header">
              <div>
                <div className="figma-panel-title">{model.alias}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {model.id}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <span className="figma-badge figma-badge-purple">{model.provider}</span>
                <span className="figma-badge figma-badge-green">活跃</span>
              </div>
            </div>
            <div className="figma-panel-body">
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--text-tertiary)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      使用率
                    </div>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: 'var(--figma-purple)'
                    }}>
                      {model.usage}%
                    </div>
                  </div>
                  <div className="figma-progress">
                    <div 
                      className="figma-progress-bar"
                      style={{ width: `${model.usage}%` }}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    请求次数
                  </div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {model.requests}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    Token 数
                  </div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {(model.tokens / 1000000).toFixed(2)}M
                  </div>
                </Col>
              </Row>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Button className="figma-btn figma-btn-secondary" size="small">
                  配置
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
