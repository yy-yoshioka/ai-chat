import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/chat-logs', async (req, res) => {
  const logs = await prisma.chatLog.findMany({
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(logs);
});

router.get('/report/chat-logs', async (_req, res) => {
  const logs = await prisma.chatLog.groupBy({
    by: ['createdAt'],
    _count: { id: true },
  });
  res.json(logs);
});

export default router;
