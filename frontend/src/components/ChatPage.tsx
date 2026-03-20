// @ts-nocheck - 暂时隐藏加粗按钮，保留功能代码
import { useState, useRef, useEffect } from 'react';
// @ts-ignore - 暂时隐藏但保留功能
import { PaperClipOutlined, SendOutlined, DeleteOutlined, FileOutlined, DownloadOutlined, PictureOutlined, GlobalOutlined, FilePptOutlined, BoldOutlined, SmileOutlined } from '@ant-design/icons';
import TranslatePanel from './TranslatePanel';
import PptPanel from './PptPanel';

const API_BASE = `${window.location.protocol}//${window.location.host}`;

interface ChatFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: ChatFile[];
  outputFiles?: ChatFile[];
  textStyle?: { fontSize?: number; color?: string; fontFamily?: string; isBold?: boolean };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(() => localStorage.getItem('chat_draft') || '');
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [lastSync, setLastSync] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  // @ts-ignore - 暂时隐藏但保留功能
  const [isBold, setIsBoldRaw] = useState(() => false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setIsBold = (v: boolean | ((p: boolean) => boolean)) => { void setIsBoldRaw;
    setIsBoldRaw(prev => { 
      const next = typeof v === 'function' ? v(prev) : v; 
      console.log('isBold changed:', prev, '->', next);
      localStorage.setItem('chat_isBold', String(next)); 
      return next; 
    });
  };
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [chatBg, setChatBgRaw] = useState(() => localStorage.getItem('chat_bg') || 'default');
  const setChatBg = (v: string) => { localStorage.setItem('chat_bg', v); setChatBgRaw(v); };
  
  // 保存草稿到 localStorage
  useEffect(() => {
    localStorage.setItem('chat_draft', input);
  }, [input]);
  
  // AI 消息样式
  // @ts-ignore - 暂时隐藏但保留功能
  const [aiMsgBold, setAiMsgBoldRaw] = useState(() => localStorage.getItem('ai_msg_bold') === 'true');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setAiMsgBold = (v: boolean) => { void setAiMsgBoldRaw; localStorage.setItem('ai_msg_bold', String(v)); setAiMsgBoldRaw(v); };
  const [aiMsgColor, setAiMsgColorRaw] = useState(() => localStorage.getItem('ai_msg_color') || 'var(--text-primary)');
  const setAiMsgColor = (v: string) => { localStorage.setItem('ai_msg_color', v); setAiMsgColorRaw(v); };
  const [aiMsgSize, setAiMsgSizeRaw] = useState(() => localStorage.getItem('ai_msg_size') || '14');
  const setAiMsgSize = (v: string) => { localStorage.setItem('ai_msg_size', v); setAiMsgSizeRaw(v); };
  const [aiMsgFont, setAiMsgFontRaw] = useState(() => localStorage.getItem('ai_msg_font') || '默认');
  const setAiMsgFont = (v: string) => { localStorage.setItem('ai_msg_font', v); setAiMsgFontRaw(v); };
  const [aiMsgBgColor, setAiMsgBgColorRaw] = useState(() => localStorage.getItem('ai_msg_bg_color') || 'var(--bg-tertiary)');
  const setAiMsgBgColor = (v: string) => { localStorage.setItem('ai_msg_bg_color', v); setAiMsgBgColorRaw(v); };
  const [aiMsgOpacity, setAiMsgOpacityRaw] = useState(() => localStorage.getItem('ai_msg_opacity') || '1');
  const setAiMsgOpacity = (v: string) => { localStorage.setItem('ai_msg_opacity', v); setAiMsgOpacityRaw(v); };
  const [userMsgBgColor, setUserMsgBgColorRaw] = useState(() => localStorage.getItem('user_msg_bg_color') || 'var(--figma-blue)');
  const setUserMsgBgColor = (v: string) => { localStorage.setItem('user_msg_bg_color', v); setUserMsgBgColorRaw(v); };
  const [userMsgOpacity, setUserMsgOpacityRaw] = useState(() => localStorage.getItem('user_msg_opacity') || '1');
  const setUserMsgOpacity = (v: string) => { localStorage.setItem('user_msg_opacity', v); setUserMsgOpacityRaw(v); };
  
  const [textColor, setTextColorRaw] = useState(() => localStorage.getItem('chat_textColor') || '#ffffff');
  const setTextColor = (v: string) => { localStorage.setItem('chat_textColor', v); setTextColorRaw(v); };
  const [fontSize, setFontSizeRaw] = useState(() => localStorage.getItem('chat_fontSize') || '14');
  const setFontSize = (v: string) => { localStorage.setItem('chat_fontSize', v); setFontSizeRaw(v); };
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 消息样式缓存
  const getMessageKey = (msg: Message) => {
    const key = 'msg_' + msg.timestamp;
    return key;
  };

  const saveMessageStyle = (msg: Message, style: any) => {
    const cache = JSON.parse(localStorage.getItem('chat_message_styles') || '{}');
    const key = getMessageKey(msg);
    cache[key] = style;
    console.log('saveMessageStyle:', key, style);
    localStorage.setItem('chat_message_styles', JSON.stringify(cache));
  };

  

  const saveMessageFiles = (msg: Message, files: ChatFile[]) => {
    console.log('[saveMessageFiles] key:', getMessageKey(msg), 'files:', files.length);
    const cache = JSON.parse(localStorage.getItem('chat_message_files') || '{}');
    const key = getMessageKey(msg);
    cache[key] = files;
    localStorage.setItem('chat_message_files', JSON.stringify(cache));
  };

  const getMessageFiles = (msg: Message): ChatFile[] | undefined => {
    const key = getMessageKey(msg);
    const cache = JSON.parse(localStorage.getItem('chat_message_files') || '{}');
    console.log('[getMessageFiles] key:', key, '找到:', !!cache[key], 'files:', cache[key]);
    return cache[key];
  };

  const getMessageStyle = (msg: Message) => {
    const cache = JSON.parse(localStorage.getItem('chat_message_styles') || '{}');
    const key = getMessageKey(msg);
    const style = cache[key];
    console.log('getMessageStyle:', key, style);
    return style;
  };

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = input.slice(0, start) + text + input.slice(end);
    setInput(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // 没有粗体字重的字体（使用 text-shadow 模拟粗体）
  const FONTS_NO_BOLD = ['楷体', 'KaiTi', '华文楷体', 'STKaiti', '仿宋', 'FangSong', '华文中宋', 'STZhongsong', 'Comic Sans MS'];
  
  const FONTS = [
    '默认',
    // 中文字体
    '宋体', 'SimSun',
    '黑体', 'SimHei',
    '楷体', 'KaiTi',
    '仿宋', 'FangSong',
    '微软雅黑', 'Microsoft YaHei',
    '华文宋体', 'STSong',
    '华文黑体', 'STHeiti',
    '华文中宋', 'STZhongsong',
    '华文楷体', 'STKaiti',
    '思源黑体', 'Source Han Sans CN',
    '思源宋体', 'Source Han Serif CN',
    // 英文字体
    'Arial', 'Helvetica',
    'Times New Roman', 'Georgia',
    'Verdana', 'Tahoma',
    'Trebuchet MS', 'Impact',
    'Comic Sans MS', 'Courier New',
    // 等宽字体
    'monospace', 'Consolas', 'Menlo', 'Monaco'
  ];
  const [fontFamily, setFontFamilyRaw] = useState(() => localStorage.getItem('chat_fontFamily') || '默认');
  const setFontFamily = (v: string) => { localStorage.setItem('chat_fontFamily', v); setFontFamilyRaw(v); };
  const EMOJIS = ['😀','😂','🥰','😎','🤔','👍','🙏','🔥','💡','✅','❌','🎉','💪','👀','🚀','😅','🤣','😭','😤','🥳'];
  const COLORS = ['#ffffff','#ff4d4f','#faad14','#52c41a','#1890ff','#722ed1','#eb2f96','#13c2c2'];

  const [showTranslate, setShowTranslate] = useState(false);
  const [showPpt, setShowPpt] = useState(false);
  const prevMessageCountRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  // 只在消息数量变化时自动滚动（新消息到达或发送）
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // 每次消息变化时自动保存到 localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_message_history', JSON.stringify(messages));
      console.log('[自动保存]', messages.length, '条');
    }
  }, [messages]);

  // 页面滚动到底部
  useEffect(() => {
  }, [messages.length]);

  // 页面加载时优先从 localStorage 恢复消息
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 优先从 localStorage 恢复
        const savedHistory = localStorage.getItem('chat_message_history');
        if (savedHistory) {
          const savedMessages = JSON.parse(savedHistory);
          console.log('[加载历史] 从 localStorage 恢复:', savedMessages.length, '条');
          setMessages(savedMessages);
          return;
        }
        
        // 如果 localStorage 没有，才从后端加载
        const token = localStorage.getItem('auth_token') || 'wj12345';
        const resp = await fetch(`${API_BASE}/api/chat/history?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.messages) {
          setMessages(data.messages);
          console.log('[加载历史] 从后端加载:', data.messages.length, '条');
        }
      } catch (err) {
        console.error('Load history failed:', err);
      }
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    const rawContent = input.trim();
    if ((!rawContent && pendingFiles.length === 0) || loading) return;

    // 为图片文件创建本地预览 URL
    const filesWithPreview = pendingFiles.map(f => {
      const isImage = f.type.startsWith('image/');
      const preview = {
        name: f.name,
        path: isImage ? URL.createObjectURL(f) : '',  // 图片使用本地 URL
        size: f.size,
        type: f.type,
        isLocalPreview: isImage  // 标记为本地预览
      };
      console.log('文件预览:', f.name, f.type, 'isImage:', isImage, 'path:', preview.path);
      return preview;
    });

    console.log('filesWithPreview:', filesWithPreview);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: rawContent,
      timestamp: Date.now(),
      files: filesWithPreview,
      textStyle: { fontSize: parseInt(fontSize), color: textColor, fontFamily: fontFamily === '默认' ? undefined : fontFamily, isBold }
    };

    // 保存历史（包含当前消息）- 使用函数式更新
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('[发送消息] 保存:', newMessages.length, '条');
      return newMessages;
    });
    const currentInput = rawContent;
    const currentFiles = [...pendingFiles];
    setInput('');
    setPendingFiles([]);
    setLoading(true);

    try {
      const formData = new FormData();
      if (currentInput) formData.append('message', currentInput);
      currentFiles.forEach(f => formData.append('files', f));

      const token = localStorage.getItem('auth_token') || 'wj12345';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 2分钟超时
      
      console.log('[请求] URL:', `${API_BASE}/api/chat`);
      console.log('[请求] Token:', token ? '有' : '无');
      console.log('[请求] FormData:', formData.has('message'), formData.has('files'));
      
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log('[响应] 状态:', resp.status, resp.ok, resp.statusText);
      
      const text = await resp.text();
      console.log('[响应] 原始内容:', text.slice(0, 200));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[解析失败] 不是 JSON:', e.message);
        throw new Error('响应格式错误');
      }
      if (!resp.ok) throw new Error(data.error || '请求失败');

      console.log('后端响应:', data);
      console.log('uploadedFiles:', data.uploadedFiles);

      // 更新用户消息的文件路径
      if (data.uploadedFiles && data.uploadedFiles.length > 0) {
        console.log('更新用户消息文件:', userMessage.id, data.uploadedFiles);
        setMessages(prev => {
          const newMessages = prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, files: data.uploadedFiles }
              : msg
          );
          // 更新后立即保存历史（关键！）
          setTimeout(() => {
            localStorage.setItem('chat_message_history', JSON.stringify(newMessages));
            console.log('[保存消息历史] 更新后保存:', newMessages.length, '条');
          }, 0);
          return newMessages;
        });
        // 保存文件信息到 localStorage - 保存服务器返回的文件路径
        const msgForSave = { ...userMessage, files: data.uploadedFiles };
        saveMessageFiles(msgForSave, data.uploadedFiles);
        console.log('[保存文件到 localStorage] key:', getMessageKey(msgForSave), 'files:', data.uploadedFiles.length);
        
        // 额外保存一份到以时间戳为 key 的缓存（用于页面加载时恢复）
        const timestampKey = 'file_' + userMessage.timestamp;
        const fileCache = JSON.parse(localStorage.getItem('chat_file_cache') || '{}');
        fileCache[timestampKey] = data.uploadedFiles;
        localStorage.setItem('chat_file_cache', JSON.stringify(fileCache));
        console.log('[保存时间戳文件缓存] key:', timestampKey);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || '未收到回复',
        timestamp: Date.now(),
        outputFiles: data.outputFiles
      };
      // 保存历史（包含 AI 回复）- 使用函数式更新确保获取最新状态
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('[AI 回复] 保存消息:', newMessages.length, '条');
        return newMessages;
      });
    } catch (error: any) {
      const errMsg = error.name === 'AbortError' 
        ? '请求超时，AI 处理时间较长，请稍后重试'
        : error.message === 'Failed to fetch'
          ? '网络连接失败，请检查后端服务是否运行'
          : (error.message || '发送失败');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${errMsg}`,
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (type: string) => type.startsWith('image/');

  const getFileUrl = (filePath: string) => {
    const token = localStorage.getItem('auth_token') || 'wj12345';
    return `${API_BASE}/api/chat/file?path=${encodeURIComponent(filePath)}&token=${token}`;
  };

  const clearChat = () => { setMessages([]); setPendingFiles([]); };

  // 渲染文件附件
  const renderFiles = (files: ChatFile[], isOutput = false) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {files.map((f, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 'var(--radius-sm)',
          background: isOutput ? 'rgba(27, 196, 125, 0.15)' : 'rgba(78, 143, 240, 0.15)',
          border: `1px solid ${isOutput ? 'rgba(27, 196, 125, 0.3)' : 'rgba(78, 143, 240, 0.3)'}`,
          fontSize: 11, color: 'var(--text-secondary)', maxWidth: 280
        }}>
          {isImage(f.type) ? <PictureOutlined style={{ color: '#4e8ff0' }} /> : <FileOutlined style={{ color: 'var(--text-tertiary)' }} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.name}</span>
          <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>{formatSize(f.size)}</span>
          {f.path && (
            <a href={getFileUrl(f.path)} target="_blank" rel="noreferrer"
              style={{ color: 'var(--figma-blue)', flexShrink: 0 }}>
              <DownloadOutlined />
            </a>
          )}
        </div>
      ))}
    </div>
  );

  // 渲染图片预览
  const renderImagePreview = (files: ChatFile[]) => {
    const images = files.filter(f => isImage(f.type) && f.path);
    console.log('[renderImagePreview] 收到 files:', files.length, '过滤后 images:', images.length);
    if (images.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {images.map((f, i) => {
          const isLocal = (f as any).isLocalPreview === true;
          const imgUrl = isLocal ? f.path : getFileUrl(f.path);
          console.log('[图片渲染]', f.name, '| isLocal:', isLocal, '| path:', f.path, '| imgUrl:', imgUrl);
          return (
            <a key={i} href={isLocal ? undefined : imgUrl} target="_blank" rel="noreferrer" 
               style={{ cursor: isLocal ? 'default' : 'pointer' }}>
              <img src={imgUrl} alt={f.name}
                style={{ maxWidth: 300, maxHeight: 200, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                onError={(e) => { console.error('图片加载失败:', imgUrl); (e.target as HTMLImageElement).style.display = 'none'; }}
                onLoad={() => console.log('图片加载成功:', imgUrl)}
              />
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }}>
      <div className="figma-panel" style={{ marginBottom: 16 }}>
        <div className="figma-panel-header" style={{
          background: 'linear-gradient(135deg, rgba(78, 143, 240, 0.12) 0%, rgba(78, 143, 240, 0.04) 100%)',
          borderBottom: '1px solid rgba(78, 143, 240, 0.2)'
        }}>
          <div className="figma-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💬</span>
            对话中心
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#1bc47d', display: 'inline-block',
              boxShadow: '0 0 6px rgba(27, 196, 125, 0.5)'
            }} />
            {lastSync > 0 && (
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 4 }}>
                已同步 {Math.floor((Date.now() - lastSync) / 1000)}s 前
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* AI 消息样式控件 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--bg-primary)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>AI样式:</span>
              {/* 加粗 - 暂时隐藏，功能保留
              <button onClick={() => setAiMsgBold(!aiMsgBold)} title="AI消息加粗" style={{ background: aiMsgBold ? 'var(--figma-blue)' : 'none', border: '1px solid var(--border-subtle)', borderRadius: 3, color: aiMsgBold ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', padding: '2px 6px', fontWeight: 700, fontSize: 12 }}>
                B
              </button>
              */}
              {/* 字号 */}
              <select value={aiMsgSize} onChange={e => setAiMsgSize(e.target.value)} title="AI消息字号"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 3, color: 'var(--text-secondary)', padding: '2px 4px', fontSize: 11, cursor: 'pointer' }}>
                {['12','14','16','18','20'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* 字体 */}
              <select value={aiMsgFont} onChange={e => setAiMsgFont(e.target.value)} title="AI消息字体"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 3, color: 'var(--text-secondary)', padding: '2px 4px', fontSize: 11, cursor: 'pointer' }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {/* 文字颜色 */}
              <input type="color" value={aiMsgColor.startsWith('#') ? aiMsgColor : '#000000'} onChange={e => setAiMsgColor(e.target.value)} title="AI消息文字颜色"
                style={{ width: 24, height: 24, border: '1px solid var(--border-subtle)', borderRadius: 3, cursor: 'pointer' }} />
              {/* 气泡背景色 */}
              <input type="color" value={aiMsgBgColor.startsWith('#') ? aiMsgBgColor : '#f0f0f0'} onChange={e => setAiMsgBgColor(e.target.value)} title="AI消息气泡背景色"
                style={{ width: 24, height: 24, border: '1px solid var(--border-subtle)', borderRadius: 3, cursor: 'pointer' }} />
              {/* 气泡透明度 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>透明度</span>
                <input type="range" min="0.1" max="1" step="0.1" value={aiMsgOpacity} onChange={e => setAiMsgOpacity(e.target.value)} 
                  style={{ width: 80, cursor: 'pointer' }} title="AI 消息气泡透明度" />
                <span style={{ color: 'var(--text-secondary)', minWidth: 30 }}>{Math.round(parseFloat(aiMsgOpacity) * 100)}%</span>
              </div>
            </div>
            <button className="figma-button figma-button-secondary" onClick={clearChat}
              style={{ fontSize: 12, padding: '4px 12px' }}>清空对话</button>
          </div>
        </div>
      </div>

      <div className="figma-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {/* 消息区域 - 只有这里可以滚动 */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          style={{ 
            flex: '1 1 0', 
            overflowY: 'auto', 
            padding: 'var(--space-4)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-3)', 
            minHeight: 0,
            background: chatBg === 'default' ? 'var(--bg-primary)' : 
                       chatBg.startsWith('#') ? chatBg : 
                       chatBg.startsWith('http') || chatBg.startsWith('data:') ? `url(${chatBg}) center/cover` : 
                       'var(--bg-primary)'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ fontSize: 48 }}>🦞</span>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>开始与 小汐 AI 对话</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>支持文字、图片、文档等多种格式输入输出</div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              // 判断是否显示时间戳（与上一条消息间隔超过5分钟）
              const showTime = idx === 0 || (msg.timestamp - messages[idx - 1].timestamp > 5 * 60 * 1000);
              return (
                <div key={msg.id}>
                  {showTime && (
                    <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', margin: '12px 0 8px' }}>
                      {new Date(msg.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4e8ff0, #6b9ff7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0
                      }}>🤖</div>
                    )}
                    <div style={{
                      maxWidth: '65%', padding: '10px 14px',
                      borderRadius: '12px',
                      background: msg.role === 'user' ? 
                        (userMsgBgColor.startsWith('#') && userMsgOpacity !== '1' 
                          ? userMsgBgColor + Math.round(parseFloat(userMsgOpacity) * 255).toString(16).padStart(2, '0')
                          : userMsgBgColor)
                        : 
                        (aiMsgBgColor.startsWith('#') && aiMsgOpacity !== '1' 
                          ? aiMsgBgColor + Math.round(parseFloat(aiMsgOpacity) * 255).toString(16).padStart(2, '0')
                          : aiMsgBgColor),
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                      border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      {/* 指向头像的三角形 */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        [msg.role === 'user' ? 'right' : 'left']: '-8px',
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: msg.role === 'user' ? '8px 0 8px 8px' : '8px 8px 8px 0',
                        borderColor: msg.role === 'user' 
                          ? `transparent transparent transparent ${userMsgBgColor.startsWith('#') && userMsgOpacity !== '1' 
                              ? userMsgBgColor + Math.round(parseFloat(userMsgOpacity) * 255).toString(16).padStart(2, '0')
                              : userMsgBgColor}`
                          : `transparent ${aiMsgBgColor.startsWith('#') && aiMsgOpacity !== '1' 
                              ? aiMsgBgColor + Math.round(parseFloat(aiMsgOpacity) * 255).toString(16).padStart(2, '0')
                              : aiMsgBgColor} transparent transparent`
                      }} />
                      {msg.content && (
                        <div style={{
                          fontSize: msg.role === 'user' ? (msg.textStyle?.fontSize ?? 14) : parseInt(aiMsgSize),
                          lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          color: msg.role === 'user' ? (msg.textStyle?.color ?? '#ffffff') : aiMsgColor,
                          fontFamily: msg.role === 'user' ? (msg.textStyle?.fontFamily || 'inherit') : (aiMsgFont === '默认' ? 'inherit' : aiMsgFont),
                          fontWeight: msg.role === 'user' ? (msg.textStyle?.isBold ? 700 : 400) : (aiMsgBold ? 700 : 400),
                          // 部分字体没有粗体字重，使用文字阴影模拟粗体效果
                          textShadow: (msg.role === 'assistant' && aiMsgBold && FONTS_NO_BOLD.includes(aiMsgFont)) 
                            ? '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor' 
                            : (msg.role === 'user' && msg.textStyle?.isBold && FONTS_NO_BOLD.includes(msg.textStyle?.fontFamily || ''))
                            ? '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor'
                            : 'none',
                        }}>
                          {msg.content}
                        </div>
                      )}
                      {msg.files && msg.files.length > 0 && (
                        <>
                          {renderFiles(msg.files)}
                          {renderImagePreview(msg.files)}
                        </>
                      )}
                      {msg.outputFiles && msg.outputFiles.length > 0 && (
                        <>
                          {renderFiles(msg.outputFiles, true)}
                          {renderImagePreview(msg.outputFiles)}
                        </>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1bc47d, #22d68a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0
                      }}>👤</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {loading && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4e8ff0, #6b9ff7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0
              }}>🤖</div>
              <div style={{
                padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>思考中</span>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--figma-blue)',
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 回到底部按钮 */}
        {!autoScroll && (
          <div style={{ position: 'absolute', bottom: showTranslate ? 380 : 100, right: 30, zIndex: 10, transition: 'bottom 0.2s ease' }}>
            <button
              onClick={() => {
                setAutoScroll(true);
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'var(--figma-blue)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 143, 240, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              }}
              title="回到底部"
            >
              ↓
            </button>
          </div>
        )}

        {/* 待上传文件预览 - 固定在输入框上方 */}
        {pendingFiles.length > 0 && (
          <div style={{
            padding: '8px var(--space-4)', 
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 6,
            flexShrink: 0
          }}>
            {pendingFiles.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(78, 143, 240, 0.1)', border: '1px solid rgba(78, 143, 240, 0.2)',
                fontSize: 11, color: 'var(--text-secondary)'
              }}>
                <FileOutlined style={{ fontSize: 12, color: '#4e8ff0' }} />
                <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{formatSize(f.size)}</span>
                <button onClick={() => removePendingFile(i)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                  <DeleteOutlined style={{ fontSize: 10 }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 输入区域 - 固定在底部 */}
        <div style={{ 
          padding: 'var(--space-3) var(--space-4)', 
          borderTop: '2px solid var(--border-default)', 
          background: 'var(--bg-secondary)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          flexShrink: 0
        }}>
          {/* 翻译面板 */}
          {showTranslate && (
            <TranslatePanel
              onClose={() => setShowTranslate(false)}
              onInsert={(text) => { setInput(text); setShowTranslate(false); }}
            />
          )}
          {/* PPT 面板 */}
          {showPpt && (
            <PptPanel onClose={() => setShowPpt(false)} />
          )}
          {/* 格式工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: 6, flexWrap: 'wrap' }}>
            {/* 加粗 - 暂时隐藏，功能保留
            <button onClick={() => setIsBold(v => !v)} title="加粗" style={{ background: isBold ? 'var(--figma-blue)' : 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, color: isBold ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', padding: '4px 12px', fontWeight: 700, fontSize: 16 }}>
              <BoldOutlined />
            </button>
            */}
            {/* 字号 */}
            <select value={fontSize} onChange={e => setFontSize(e.target.value)} title="字号"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 4, color: 'var(--text-secondary)', padding: '4px 8px', fontSize: 15, cursor: 'pointer' }}>
              {['12','14','16','18','20','24'].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
            {/* 字体 */}
            <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} title="字体"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 4, color: 'var(--text-secondary)', padding: '4px 8px', fontSize: 15, cursor: 'pointer' }}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {/* 颜色 */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowColorPicker(v => !v)} 
                title="文字颜色"
                style={{ 
                  background: 'none', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 4, 
                  cursor: 'pointer', 
                  padding: '4px 12px', 
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: textColor, border: '1px solid var(--border-subtle)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>▼</span>
              </button>
              {showColorPicker && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: 40, 
                  left: 0, 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 8, 
                  padding: 12, 
                  zIndex: 100, 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  width: 200
                }}>
                  {/* 预设颜色 */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>预设颜色</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {COLORS.map(c => (
                        <div 
                          key={c} 
                          onClick={() => { setTextColor(c); setShowColorPicker(false); }} 
                          style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            background: c, 
                            cursor: 'pointer', 
                            border: textColor === c ? '2px solid var(--figma-blue)' : '1px solid var(--border-subtle)' 
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                  {/* 自定义颜色 */}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>自定义颜色</div>
                    <input 
                      type="color" 
                      value={textColor} 
                      onChange={(e) => setTextColor(e.target.value)}
                      style={{ 
                        width: '100%', 
                        height: 32, 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
            {/* 表情 */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowEmojiPicker(v => !v)} title="表情" style={{ background: showEmojiPicker ? 'var(--figma-blue)' : 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, color: showEmojiPicker ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', padding: '4px 12px', fontSize: 16 }}>
                <SmileOutlined />
              </button>
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: 40, left: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6, width: 240, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  {EMOJIS.map(e => (
                    <span key={e} onClick={() => { insertAtCursor(e); setShowEmojiPicker(false); }} style={{ fontSize: 24, cursor: 'pointer', padding: 2, borderRadius: 4, lineHeight: 1 }}>{e}</span>
                  ))}
                </div>
              )}
            </div>
            {/* 背景设置 */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowBgPicker(v => !v)} title="聊天背景" style={{ background: showBgPicker ? 'var(--figma-blue)' : 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, color: showBgPicker ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', padding: '4px 12px', fontSize: 16 }}>
                🖼️
              </button>
              {showBgPicker && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: 40, 
                  left: 0, 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 8, 
                  padding: 12, 
                  zIndex: 100, 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  width: 220
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>聊天背景</div>
                  {/* 预设背景 */}
                  <div style={{ marginBottom: 10 }}>
                    <button 
                      onClick={() => { setChatBg('default'); setShowBgPicker(false); }}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        background: chatBg === 'default' ? 'var(--figma-blue)' : 'var(--bg-primary)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 4, 
                        color: chatBg === 'default' ? '#fff' : 'var(--text-secondary)', 
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      默认背景
                    </button>
                  </div>
                  {/* 纯色背景 */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>纯色背景</div>
                    <input 
                      type="color" 
                      value={chatBg.startsWith('#') ? chatBg : '#1a1a1a'} 
                      onChange={(e) => setChatBg(e.target.value)}
                      style={{ 
                        width: '100%', 
                        height: 32, 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  {/* 图片背景 */}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>图片背景</div>
                    <input 
                      type="text" 
                      placeholder="输入图片链接"
                      value={chatBg.startsWith('http') || chatBg.startsWith('data:') ? chatBg : ''}
                      onChange={(e) => setChatBg(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        background: 'var(--bg-primary)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        fontSize: 12,
                        marginBottom: 6
                      }}
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            console.log('Image loaded, size:', result.length);
                            setChatBg(result);
                            setShowBgPicker(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        background: 'var(--bg-primary)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: 4,
                        color: 'var(--text-secondary)',
                        fontSize: 11,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* 右侧弹性空间 */}
            <div style={{ flex: 1 }} />
            <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
            {/* 文件上传 */}
            <input type="file" ref={fileInputRef} multiple onChange={handleFileSelect}
              accept="image/*,.pdf,.csv,.xlsx,.json,.txt,.md,.html,.py,.js,.ts,.zip,.docx"
              style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={loading} title="上传文件"
              style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, color: pendingFiles.length > 0 ? 'var(--figma-blue)' : 'var(--text-tertiary)', cursor: 'pointer', padding: '4px 12px', fontSize: 16 }}>
              <PaperClipOutlined />
            </button>
            {/* 翻译 */}
            <button onClick={() => setShowTranslate(v => !v)} title="翻译"
              style={{ background: showTranslate ? 'var(--figma-blue)' : 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, color: showTranslate ? '#fff' : 'var(--text-tertiary)', cursor: 'pointer', padding: '4px 12px', fontSize: 16 }}>
              <GlobalOutlined />
            </button>
            {/* PPT */}
            <button onClick={() => setShowPpt(v => !v)} title="生成 PPT"
              style={{ background: showPpt ? 'var(--figma-purple)' : 'none', border: '1px solid var(--border-subtle)', borderRadius: 4, color: showPpt ? '#fff' : 'var(--text-tertiary)', cursor: 'pointer', padding: '4px 12px', fontSize: 16 }}>
              <FilePptOutlined />
            </button>
            {/* 气泡背景色 */}
            <input type="color" value={userMsgBgColor.startsWith('#') ? userMsgBgColor : '#2080f0'} onChange={e => setUserMsgBgColor(e.target.value)} title="我的消息气泡背景色"
              style={{ width: 28, height: 28, border: '1px solid var(--border-subtle)', borderRadius: 4, cursor: 'pointer' }} />
            {/* 气泡透明度 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
              <input type="range" min="0.1" max="1" step="0.1" value={userMsgOpacity} onChange={e => setUserMsgOpacity(e.target.value)} 
                style={{ width: 60, cursor: 'pointer' }} title="我的消息气泡透明度" />
              <span style={{ color: 'var(--text-secondary)', minWidth: 28 }}>{Math.round(parseFloat(userMsgOpacity) * 100)}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
            {/* Debug: isBold = {String(isBold)} */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
              disabled={loading}
              className={`chat-textarea ${isBold ? 'bold-mode' : ''}`}
              style={{
                flex: 1, padding: '8px 12px', background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                color: textColor, fontSize: parseInt(fontSize),
                fontFamily: fontFamily === '默认' ? 'inherit' : fontFamily,
                fontWeight: isBold ? 700 : 400,
                // 部分字体没有粗体字重，使用文字阴影模拟粗体效果
                textShadow: (isBold && FONTS_NO_BOLD.includes(fontFamily)) ? '0.5px 0 0 currentColor, -0.5px 0 0 currentColor, 0 0.5px 0 currentColor, 0 -0.5px 0 currentColor' : 'none',
                lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
                resize: 'vertical', minHeight: parseInt(fontSize) * 1.5 * 4 + 16,
                opacity: loading ? 0.5 : 1,
              }}
            />
            <button onClick={handleSend}
              disabled={(!input.trim() && pendingFiles.length === 0) || loading}
              style={{
                background: loading ? 'var(--bg-tertiary)' : 'var(--figma-blue)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', cursor: loading ? 'not-allowed' : 'pointer',
                padding: '8px 16px', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s', flexShrink: 0, minWidth: 70, alignSelf: 'stretch'
              }}>
              {loading ? '...' : <><SendOutlined style={{ marginRight: 4 }} />发送</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
