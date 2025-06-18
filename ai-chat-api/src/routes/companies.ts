import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Get companies for authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          },
        },
      },
    });

    if (!user || !user.company) {
      return res.status(404).json({ error: 'No company association found' });
    }

    // For now, return the user's company as an array
    // In the future, this could support multiple companies per user
    const companies = [user.company];

    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as companyRoutes };
