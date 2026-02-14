import { Form, Input, Switch, Button, Select, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export default function SettingsPage() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* System Configuration */}
        <Col span={12}>
          <div className="figma-panel">
            <div className="figma-panel-header">
              <div className="figma-panel-title">系统配置</div>
            </div>
            <div className="figma-panel-body">
              <Form layout="vertical">
                <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500 }}>网关端口</span>}>
                  <Input
                    defaultValue="7749"
                    className="figma-input"
                  />
                </Form.Item>

                <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500 }}>默认模型</span>}>
                  <Select
                    defaultValue="claude-sonnet-4-5"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
                      { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
                      { value: 'gpt-5.2-codex', label: 'GPT-5.2 Codex' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label={<span style={{ fontSize: 12, fontWeight: 500 }}>日志级别</span>}>
                  <Select
                    defaultValue="info"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'debug', label: 'DEBUG' },
                      { value: 'info', label: 'INFO' },
                      { value: 'warning', label: 'WARNING' },
                      { value: 'error', label: 'ERROR' },
                    ]}
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
        </Col>

        {/* Feature Toggles */}
        <Col span={12}>
          <div className="figma-panel">
            <div className="figma-panel-header">
              <div className="figma-panel-title">功能开关</div>
            </div>
            <div className="figma-panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { label: '启用心跳', key: 'heartbeat', default: true },
                  { label: '自动更新仪表盘', key: 'autoupdate', default: true },
                  { label: '启用通知', key: 'notifications', default: false },
                  { label: '显示系统指标', key: 'metrics', default: true },
                  { label: '启用调试模式', key: 'debug', default: false },
                ].map(item => (
                  <div key={item.key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-2)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text-primary)'
                    }}>
                      {item.label}
                    </span>
                    <Switch defaultChecked={item.default} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>

        {/* System Information */}
        <Col span={24}>
          <div className="figma-panel">
            <div className="figma-panel-header">
              <div className="figma-panel-title">系统信息</div>
            </div>
            <div className="figma-panel-body">
              <Row gutter={[16, 16]}>
                {[
                  { label: '版本', value: '1.0.0' },
                  { label: 'Node 版本', value: 'v24.0.2' },
                  { label: '平台', value: 'Darwin 24.3.0 (arm64)' },
                  { label: '工作区', value: '~/.openclaw/workspace' },
                  { label: '配置路径', value: '~/.openclaw/openclaw.json' },
                  { label: '运行时间', value: '42:15:30' },
                ].map(item => (
                  <Col span={8} key={item.label}>
                    <div style={{
                      padding: 'var(--space-3)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        {item.value}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </Col>

        {/* Actions */}
        <Col span={24}>
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            justifyContent: 'flex-end'
          }}>
            <Button className="figma-btn figma-btn-secondary">
              重置
            </Button>
            <Button
              icon={<SaveOutlined />}
              className="figma-btn figma-btn-primary"
            >
              保存更改
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
