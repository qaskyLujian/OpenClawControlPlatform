import { Router } from 'express';
const router = Router();
router.post('/auth/start', (req, res) => res.json({ error: 'WhatsApp not supported' }));
router.get('/auth/status', (req, res) => res.json({ status: 'idle' }));
router.post('/auth/cancel', (req, res) => res.json({ ok: true }));
export default router;
