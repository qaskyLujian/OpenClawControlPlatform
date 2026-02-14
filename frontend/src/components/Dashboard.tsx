import { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { getDashboardData } from '../services/api';
import { socket } from '../services/socket';

interface DashboardData {
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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    socket.emit('subscribe:dashboard');
    socket.on('dashboard:update', (newData: DashboardData) => {
      setData(newData);
    });

    return () => {
      socket.off('dashboard:update');
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboardData();
      setData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: 13,
        color: 'var(--text-secondary)'
      }}>
        加载中...
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 24, color: 'var(--text-secondary)' }}>暂无数据</div>;
  }

  const stats = [
    {
      label: '网关状态',
      value: data.gateway.status === 'running' ? '运行中' : '已停止',
      subtext: `运行时间 ${data.gateway.uptime}`,
      color: data.gateway.status === 'running' ? 'var(--figma-green)' : 'var(--figma-red)'
    },
    {
      label: '会话总数',
      value: data.sessions.total.toString(),
      subtext: `${data.sessions.active} 个活跃`,
      color: 'var(--figma-purple)'
    },
    {
      label: '今日 Token',
      value: `${(data.usage.tokensToday / 1000000).toFixed(2)}M`,
      subtext: `${data.usage.requestsToday} 次请求`,
      color: 'var(--figma-blue)'
    },
    {
      label: '子代理',
      value: data.sessions.subagents.toString(),
      subtext: '正在运行',
      color: 'var(--figma-orange)'
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <div className="figma-card figma-stat">
              <div className="figma-stat-label">{stat.label}</div>
              <div className="figma-stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="figma-stat-subtext">
                {stat.subtext}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* System Resources */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div className="figma-panel">
            <div className="figma-panel-header">
              <div className="figma-panel-title">CPU 使用率</div>
              <span className={`figma-badge figma-badge-${data.system.cpu > 80 ? 'red' : 'green'}`}>
                {data.system.cpu > 80 ? '高负载' : '正常'}
              </span>
            </div>
            <div className="figma-panel-body">
              <div style={{
                fontSize: 36,
                fontWeight: 600,
                marginBottom: 'var(--space-4)',
                color: 'var(--figma-purple)'
              }}>
                {data.system.cpu}%
              </div>
              <div className="figma-progress">
                <div 
                  className="figma-progress-bar"
                  style={{ 
                    width: `${data.system.cpu}%`,
                    background: data.system.cpu > 80 ? 'var(--figma-red)' : 'var(--figma-purple)'
                  }}
                />
              </div>
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div className="figma-panel">
            <div className="figma-panel-header">
              <div className="figma-panel-title">内存使用率</div>
              <span className={`figma-badge figma-badge-${data.system.memory > 80 ? 'red' : 'green'}`}>
                {data.system.memory > 80 ? '高占用' : '正常'}
              </span>
            </div>
            <div className="figma-panel-body">
              <div style={{
                fontSize: 36,
                fontWeight: 600,
                marginBottom: 'var(--space-4)',
                color: 'var(--figma-blue)'
              }}>
                {data.system.memory}%
              </div>
              <div className="figma-progress">
                <div 
                  className="figma-progress-bar"
                  style={{ 
                    width: `${data.system.memory}%`,
                    background: data.system.memory > 80 ? 'var(--figma-red)' : 'var(--figma-blue)'
                  }}
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Info Footer */}
      <div className="figma-card" style={{
        marginTop: 16,
        padding: 'var(--space-3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        color: 'var(--text-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--figma-green)',
            boxShadow: '0 0 8px var(--figma-green)'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>系统运行正常</span>
        </div>
        <span>自动刷新: 5秒</span>
        <span>最后更新: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
