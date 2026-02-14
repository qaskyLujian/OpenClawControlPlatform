import { Router } from 'express';
import { getDashboardData } from '../services/system';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
