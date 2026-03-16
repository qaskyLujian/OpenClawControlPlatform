import { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { LogoutOutlined, SunOutlined, MoonOutlined, ExperimentOutlined } from '@ant-design/icons';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MonitorPage from './components/MonitorPage';
import ManagePage from './components/ManagePage';
import ChatPage from './components/ChatPage';
import TeamPage from './components/TeamPage';

function App() {
  const appRootRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('monitor');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token === 'wj12345') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [showThemePanel, setShowThemePanel] = useState(false);
  const [globalBg, setGlobalBgRaw] = useState(() => {
    const saved = localStorage.getItem('global_bg');
    if (saved && !saved.startsWith('data:')) return saved;
    return '';
  });
  const setGlobalBg = (v: string) => { 
    if (v && !v.startsWith('data:')) {
      localStorage.setItem('global_bg', v); 
      // 清空纯色设置，避免冲突
      localStorage.removeItem('solid_color');
      setSolidColorRaw('');
    } else if (!v) {
      localStorage.removeItem('global_bg');
    }
    setGlobalBgRaw(v); 
  };
  const [sidebarBg, setSidebarBgRaw] = useState(() => {
    const saved = localStorage.getItem('sidebar_bg');
    if (saved && !saved.startsWith('data:')) return saved;
    return '';
  });
  const setSidebarBg = (v: string) => { 
    if (v && !v.startsWith('data:')) {
      localStorage.setItem('sidebar_bg', v);
      // 清空纯色设置，避免冲突
      localStorage.removeItem('solid_color');
      setSolidColorRaw('');
    } else if (!v) {
      localStorage.removeItem('sidebar_bg');
    }
    setSidebarBgRaw(v); 
  };
  const [solidColor, setSolidColorRaw] = useState(() => localStorage.getItem('solid_color') || '');
  const setSolidColor = (v: string) => { 
    localStorage.setItem('solid_color', v); 
    setSolidColorRaw(v);
    // 清空图片背景设置，避免冲突
    if (v) {
      localStorage.removeItem('global_bg');
      localStorage.removeItem('sidebar_bg');
      setGlobalBgRaw('');
      setSidebarBgRaw('');
    }
  };
  const [cardOpacity, setCardOpacityRaw] = useState(() => parseFloat(localStorage.getItem('card_opacity') || '0.9'));
  const setCardOpacity = (v: number) => { localStorage.setItem('card_opacity', v.toString()); setCardOpacityRaw(v); };
  const [cardTextColor, setCardTextColorRaw] = useState(() => localStorage.getItem('card_text_color') || '');
  const setCardTextColor = (v: string) => { localStorage.setItem('card_text_color', v); setCardTextColorRaw(v); };
  const [sidebarTextColor, setSidebarTextColorRaw] = useState(() => localStorage.getItem('sidebar_text_color') || '');
  const setSidebarTextColor = (v: string) => { localStorage.setItem('sidebar_text_color', v); setSidebarTextColorRaw(v); };

  // 初始化时应用保存的全局背景和侧边栏背景设置
  useEffect(() => {
    const applyAllBg = () => {
      // 优先级：globalBg/sidebarBg > solidColor
      // 有图片背景时优先使用图片
      
      // 应用全局背景
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        if (globalBg) {
          // 优先使用全局背景（图片或颜色 URL）
          if (globalBg.startsWith('#')) {
            appRoot.style.background = globalBg;
          } else {
            // 图片 URL（包括相对路径 /uploads/... 和绝对路径 http://...）
            appRoot.style.background = `url(${globalBg}) center/cover no-repeat fixed`;
          }
        } else if (solidColor) {
          // 没有全局背景时才使用纯色
          appRoot.style.background = solidColor;
        } else {
          appRoot.style.background = '';
        }
      }
      
      // 应用侧边栏背景
      const sidebar = document.querySelector('.figma-sidebar') as HTMLElement;
      if (sidebar) {
        if (sidebarBg) {
          // 优先使用侧边栏背景（图片或颜色 URL）
          if (sidebarBg.startsWith('#')) {
            sidebar.style.background = sidebarBg;
          } else {
            // 图片 URL（包括相对路径 /uploads/... 和绝对路径 http://...）
            sidebar.style.background = `url(${sidebarBg}) center/cover no-repeat`;
          }
        } else if (solidColor) {
          // 没有侧边栏背景时才使用纯色
          sidebar.style.background = solidColor;
        } else {
          sidebar.style.background = '';
        }
      }
    };
    
    // 等待 DOM 完全渲染
    const timer = setTimeout(applyAllBg, 300);
    return () => clearTimeout(timer);
  }, [globalBg, sidebarBg, solidColor]);

  // 应用卡片透明度
  useEffect(() => {
    const applyCardOpacity = () => {
      // 设置 CSS 变量
      document.documentElement.style.setProperty('--bg-secondary', `rgba(30, 30, 30, ${cardOpacity})`);
      document.documentElement.style.setProperty('--bg-card', `rgba(30, 30, 30, ${cardOpacity})`);
      // 应用到所有卡片
      document.querySelectorAll('.figma-card').forEach(card => {
        (card as HTMLElement).style.background = `rgba(30, 30, 30, ${cardOpacity})`;
      });
    };
    setTimeout(applyCardOpacity, 150);
  }, [cardOpacity]);

  // 应用卡片文字颜色（只影响卡片本身，不影响内部消息气泡）
  useEffect(() => {
    if (cardTextColor) {
      // 不设置全局 CSS 变量，避免影响 ChatPage
      // document.documentElement.style.setProperty('--text-primary', cardTextColor);
      // 只设置卡片容器的颜色，不设置子元素（避免覆盖消息气泡的样式）
      document.querySelectorAll('.figma-card').forEach(card => {
        (card as HTMLElement).style.color = cardTextColor;
      });
    }
  }, [cardTextColor]);

  // 应用菜单栏文字颜色（只影响菜单项，不影响内部消息气泡）
  useEffect(() => {
    if (sidebarTextColor) {
      // 只设置侧边栏容器和菜单项的颜色
      document.querySelectorAll('.figma-sidebar, .figma-sidebar-item, .figma-sidebar-item *').forEach(el => {
        (el as HTMLElement).style.color = sidebarTextColor;
      });
    }
  }, [sidebarTextColor]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleLogin = (_token: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'monitor':
        return <MonitorPage />;
      case 'team':
        return <TeamPage />;
      case 'manage':
        return <ManagePage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <MonitorPage />;
    }
  };

  const pageTitle = {
    monitor: '监控中心',
    team: '团队状态',
    manage: '管理中心',
    chat: '对话中心'
  }[currentPage];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-primary)',
        fontSize: 12,
        color: 'var(--text-secondary)'
      }}>
        加载中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div id="app-root" ref={appRootRef} style={{ 
      display: 'flex',
      width: '100vw',
      height: '100vh'
    }}>
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        theme={theme}
        onToggleTheme={toggleTheme}
        setShowThemePanel={setShowThemePanel}
      />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        width: 'calc(100vw - 240px)'
      }}>
        {/* Toolbar */}
        <div className="figma-toolbar">
          <div className="figma-toolbar-title">
            {pageTitle}
          </div>
          
          <div className="figma-toolbar-actions">
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="figma-btn figma-btn-ghost"
            >
              退出
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: currentPage === 'chat' ? 0 : 'var(--space-4)',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="fade-in-up" style={{ 
            ...(currentPage === 'chat' ? { height: '100%', display: 'flex', flexDirection: 'column' } : {})
          }}>
            {renderPage()}
          </div>
        </div>
      </div>

      {/* 主题设置面板 */}
      {showThemePanel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowThemePanel(false)}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            padding: 24,
            width: 400,
            maxWidth: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
                <ExperimentOutlined style={{ color: '#f0a020' }} />
                主题设置
              </div>
              <button onClick={() => setShowThemePanel(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                color: 'var(--text-tertiary)',
                cursor: 'pointer'
              }}>✕</button>
            </div>

            {/* 全局背景设置 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>🌍 全局背景</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input type="text" value={globalBg} onChange={e => {
                  const val = e.target.value;
                  setGlobalBg(val);
                  setTimeout(() => {
                    const appRoot = document.getElementById('app-root');
                    console.log('全局背景 input onChange:', val, appRoot);
                    if (appRoot) {
                      if (val) {
                        if (val.startsWith('#')) {
                          appRoot.style.background = val;
                        } else {
                          appRoot.style.background = `url(${val}) center/cover no-repeat fixed`;
                        }
                      } else {
                        appRoot.style.background = '';
                      }
                    }
                  }, 50);
                }} placeholder="图片 URL 或纯色值"
                  style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
              </div>
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    // 上传到后端
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    const token = localStorage.getItem('auth_token') || 'wj12345';
                    const response = await fetch('http://' + window.location.host + '/api/upload/image', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formData
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      const imageUrl = data.url;
                      setGlobalBg(imageUrl);
                      const appRoot = document.getElementById('app-root');
                      if (appRoot) {
                        appRoot.style.background = `url(${imageUrl}) center/cover no-repeat fixed`;
                      }
                    } else {
                      alert('上传失败：' + (data.error || '未知错误'));
                    }
                  } catch (error) {
                    console.error('上传错误:', error);
                    alert('上传失败，请检查网络');
                  }
                }
              }} style={{ fontSize: 12 }} />
              {globalBg && (
                <button onClick={() => { 
                  const appRoot = document.getElementById('app-root'); 
                  if (appRoot) appRoot.style.background = ''; 
                  setGlobalBg(''); 
                }} style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>清除全局背景</button>
              )}
            </div>

            {/* 侧边栏背景设置 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>📋 菜单栏背景</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input type="text" value={sidebarBg} onChange={e => {
                  const val = e.target.value;
                  setSidebarBg(val);
                  setTimeout(() => {
                    const sidebar = document.querySelector('.figma-sidebar') as HTMLElement;
                    console.log('菜单栏背景 input onChange:', val, sidebar);
                    if (sidebar) {
                      if (val) {
                        if (val.startsWith('#')) {
                          sidebar.style.background = val;
                        } else {
                          sidebar.style.background = `url(${val}) center/cover no-repeat`;
                        }
                      } else {
                        sidebar.style.background = '';
                      }
                    }
                  }, 50);
                }} placeholder="图片 URL 或纯色值"
                  style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
              </div>
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    const token = localStorage.getItem('auth_token') || 'wj12345';
                    const response = await fetch('http://' + window.location.host + '/api/upload/image', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formData
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      const imageUrl = data.url;
                      setSidebarBg(imageUrl);
                      const sidebar = document.querySelector('.figma-sidebar') as HTMLElement;
                      if (sidebar) {
                        sidebar.style.background = `url(${imageUrl}) center/cover no-repeat`;
                      }
                    } else {
                      alert('上传失败：' + (data.error || '未知错误'));
                    }
                  } catch (error) {
                    console.error('上传错误:', error);
                    alert('上传失败，请检查网络');
                  }
                }
              }} style={{ fontSize: 12 }} />
              {sidebarBg && (
                <button onClick={() => { 
                  const sidebar = document.querySelector('.figma-sidebar') as HTMLElement;
                  if (sidebar) sidebar.style.background = ''; 
                  setSidebarBg(''); 
                }} style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>清除菜单栏背景</button>
              )}
            </div>

            {/* 纯色主题 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>🎨 纯色主题</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {['#0d0d0d', '#1a1a2e', '#16213e', '#0f3460', '#1a365d', '#2d3748', '#1a202c', '#2d1b4e', '#1e3a5f', '#0a1628', '#1c2833', '#232f3e', '#3d1f1f', '#1f3d1f', '#1f1f3d', '#3d3d1f', '#3d1f3d', '#1f3d3d', '#2a1a1a', '#1a2a1a', '#1a1a2a', '#2a2a1a', '#2a1a2a', '#1a2a2a', '#0a0a0a', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'].map(color => (
                  <button key={color} onClick={() => {
                    const appRoot = document.getElementById('app-root');
                    const sidebar = document.querySelector('.figma-sidebar') as HTMLElement;
                    if (appRoot) appRoot.style.background = color;
                    if (sidebar) sidebar.style.background = color;
                    setSolidColor(color);
                  }} style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    border: solidColor === color ? '2px solid #f0a020' : '2px solid var(--border-subtle)',
                    cursor: 'pointer',
                    padding: 0
                  }} title={color} />
                ))}
              </div>
              {solidColor && (
                <button onClick={() => { const appRoot = document.getElementById('app-root'); const sidebar = document.querySelector('.figma-sidebar') as HTMLElement; if (appRoot) appRoot.style.background = ''; if (sidebar) sidebar.style.background = ''; setSolidColor(''); }} style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>清除纯色主题</button>
              )}
            </div>

            {/* 卡片透明度设置 */}
            <div style={{ marginBottom: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>🃏 卡片透明度</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="range" min="0.1" max="1" step="0.1" value={cardOpacity} onChange={e => {
                  const val = parseFloat(e.target.value);
                  setCardOpacity(val);
                  document.documentElement.style.setProperty('--bg-secondary', `rgba(30, 30, 30, ${val})`);
                  document.querySelectorAll('.figma-card').forEach(card => {
                    (card as HTMLElement).style.background = `rgba(30, 30, 30, ${val})`;
                  });
                }} style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', minWidth: 40 }}>{Math.round(cardOpacity * 100)}%</span>
              </div>
            </div>

            {/* 卡片文字颜色 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>📝 卡片文字颜色</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={cardTextColor || '#ffffff'} onChange={e => setCardTextColor(e.target.value)} style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', background: 'none' }} />
                <input type="text" value={cardTextColor} onChange={e => {
                  setCardTextColor(e.target.value);
                  document.documentElement.style.setProperty('--text-primary', e.target.value);
                }} placeholder="#ffffff"
                  style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
                {cardTextColor && (
                  <button onClick={() => { setCardTextColor(''); document.documentElement.style.setProperty('--text-primary', ''); }} style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>重置</button>
                )}
              </div>
            </div>

            {/* 菜单栏文字颜色 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>📋 菜单栏文字颜色</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={sidebarTextColor || '#ffffff'} onChange={e => setSidebarTextColor(e.target.value)} style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', background: 'none' }} />
                <input type="text" value={sidebarTextColor} onChange={e => {
                  setSidebarTextColor(e.target.value);
                  document.querySelectorAll('.figma-sidebar, .figma-sidebar *').forEach(el => {
                    (el as HTMLElement).style.color = e.target.value;
                  });
                }} placeholder="#ffffff"
                  style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
                {sidebarTextColor && (
                  <button onClick={() => { setSidebarTextColor(''); document.querySelectorAll('.figma-sidebar, .figma-sidebar *').forEach(el => { (el as HTMLElement).style.color = ''; }); }} style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>重置</button>
                )}
              </div>
            </div>

            {/* 快速切换 */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>⚡ 快速切换</div>
              <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} style={{
                padding: '8px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                切换到{theme === 'dark' ? '白天' : '黑夜'}模式
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
