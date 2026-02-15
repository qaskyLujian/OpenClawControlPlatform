import { Router } from 'express';

const router = Router();

// POST /api/chat - 对话中心（临时实现）
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 临时实现：返回友好提示
    // TODO: 实现真正的对话功能（需要 webchat channel 或独立会话）
    res.json({ 
      reply: `📝 收到您的消息："${message}"\n\n💡 对话中心功能说明：\n\n当前管理中心的对话功能正在开发中。您可以通过以下方式与 OpenClaw 对话：\n\n1. 📱 Telegram Bot - 已配置并运行中\n2. 💬 WhatsApp - 已配置并运行中  \n3. 💻 命令行 - 使用 openclaw-tui\n\n📊 您可以在"监控中心"查看所有活跃会话和对话历史。\n\n🔧 如需在管理中心直接对话，需要配置 webchat channel。`
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: '处理消息失败',
      details: error.message 
    });
  }
});

export default router;
