import {
  DashboardOutlined,
  SettingOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  setShowThemePanel: (show: boolean) => void;
}

export default function Sidebar({ currentPage, onPageChange, setShowThemePanel }: SidebarProps) {
  const menuItems = [
    {
      key: 'monitor',
      icon: <DashboardOutlined />,
      label: '监控中心',
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: '团队状态',
    },
    {
      key: 'manage',
      icon: <SettingOutlined />,
      label: '管理中心',
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '对话中心',
    },
  ];

  return (
    <div className="figma-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="figma-sidebar-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #a259ff 0%, #c77dff 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16
          }}>
            🦞
          </div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.5px'
            }}>
              小汐 AI
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="figma-sidebar-nav" style={{ flex: 1 }}>
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`figma-sidebar-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onPageChange(item.key)}
          >
            <span className="figma-sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Theme Settings */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="figma-sidebar-item"
          onClick={() => setShowThemePanel(true)}
          style={{ marginBottom: 0 }}
        >
          <span className="figma-sidebar-item-icon">
            <SettingOutlined />
          </span>
          <span>主题设置</span>
        </div>
      </div>
    </div>
  );
}
