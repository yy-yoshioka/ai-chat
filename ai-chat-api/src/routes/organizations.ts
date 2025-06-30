import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import { prisma } from '../lib/prisma';
import { Prisma, Role } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// GET /organizations - Get current user's organization
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
      },
    });

    if (!user?.organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const [userCount, widgetCount] = await Promise.all([
      prisma.user.count({
        where: { organizationId: user.organization.id },
      }),
      prisma.widget.count({
        where: {
          company: {
            organizationId: user.organization.id,
          },
        },
      }),
    ]);

    res.json({
      id: user.organization.id,
      name: user.organization.name,
      slug: user.organization.slug,
      createdAt: user.organization.createdAt.toISOString(),
      updatedAt: user.organization.updatedAt.toISOString(),
      plan: 'pro', // Mock plan
      userCount,
      widgetCount,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// GET /organizations/stats - Get organization statistics
router.get(
  '/stats',
  requireOrganizationAccess,
  async (req: Request, res: Response) => {
    try {
      const orgReq = req as OrganizationRequest;
      const organizationId = orgReq.organizationId;

      if (!organizationId) {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { organizationId: true },
        });

        if (!user?.organizationId) {
          return res.status(404).json({ error: 'Organization not found' });
        }
      }

      const orgId =
        organizationId ||
        (
          await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { organizationId: true },
          })
        )?.organizationId;

      if (!orgId) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      const [
        totalUsers,
        activeUsers,
        totalWidgets,
        totalChats,
        totalFaqs,
        recentActivity,
      ] = await Promise.all([
        prisma.user.count({
          where: { organizationId: orgId },
        }),
        prisma.user.count({
          where: {
            organizationId: orgId,
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Active in last 7 days
            },
          },
        }),
        prisma.widget.count({
          where: {
            company: {
              organizationId: orgId,
            },
          },
        }),
        prisma.chatLog.count({
          where: {
            user: {
              organizationId: orgId,
            },
          },
        }),
        prisma.fAQ.count({
          where: { organizationId: orgId },
        }),
        prisma.chatLog.findFirst({
          where: {
            user: {
              organizationId: orgId,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            createdAt: true,
          },
        }),
      ]);

      // Calculate storage (mock data)
      const storageUsed = totalFaqs * 0.01 + totalChats * 0.001; // GB

      // Count today's API calls (mock)
      const apiCallsToday = Math.floor(Math.random() * 1000) + totalChats;

      res.json({
        totalUsers,
        activeUsers,
        totalWidgets,
        totalChats,
        totalFaqs,
        storageUsed: parseFloat(storageUsed.toFixed(2)),
        apiCallsToday,
        lastActivityAt: recentActivity?.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Get organization stats error:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch organization statistics' });
    }
  }
);

// PUT /organizations - Update organization
router.put('/', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, settings } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, roles: true },
    });

    if (!user?.organizationId) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is org admin or owner
    const isOrgAdmin =
      user.roles.includes(Role.owner) || user.roles.includes(Role.org_admin);
    if (!isOrgAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateData: Prisma.OrganizationUpdateInput = {};

    if (name) {
      updateData.name = name;
    }

    if (settings) {
      updateData.settings = settings;
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: user.organizationId },
      data: updateData,
    });

    const [userCount, widgetCount] = await Promise.all([
      prisma.user.count({
        where: { organizationId: updatedOrg.id },
      }),
      prisma.widget.count({
        where: {
          company: {
            organizationId: updatedOrg.id,
          },
        },
      }),
    ]);

    res.json({
      id: updatedOrg.id,
      name: updatedOrg.name,
      slug: updatedOrg.slug,
      createdAt: updatedOrg.createdAt.toISOString(),
      updatedAt: updatedOrg.updatedAt.toISOString(),
      plan: 'pro',
      userCount,
      widgetCount,
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

export default router;
