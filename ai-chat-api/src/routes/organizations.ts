import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  requirePermission,
  requireAnyPermission,
} from '../middleware/permissions';
import { organizationManagementService } from '../services/organizationManagementService';
import { validateRequest } from '../middleware/validateRequest';
import { Permission, Role } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Input validation schemas
const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(3)
    .max(50),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(3)
    .max(50)
    .optional(),
  settings: z.record(z.unknown()).optional(),
});

const associateWidgetSchema = z.object({
  widgetId: z.string(),
  companyId: z.string().optional(),
});

const transferOwnershipSchema = z.object({
  newOwnerId: z.string(),
});

// All organization routes require authentication
router.use(authMiddleware);

// GET /api/organizations - List user's organizations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;

    // Get all organizations the user belongs to
    const organizations =
      await organizationManagementService.getUserOrganizations(userId);

    res.json(organizations);
  } catch (error) {
    console.error('List organizations error:', error);
    res.status(500).json({
      error: 'Failed to fetch organizations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/organizations - Create new organization
router.post(
  '/',
  validateRequest({ body: createOrganizationSchema }),
  async (req: Request, res: Response) => {
    try {
      const { id: userId } = req.user!;

      const organization =
        await organizationManagementService.createOrganization({
          ...req.body,
          userId,
        });

      res.json(organization);
    } catch (error) {
      console.error('Create organization error:', error);
      const status =
        error instanceof Error && error.message.includes('already exists')
          ? 409
          : 500;
      res.status(status).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create organization',
      });
    }
  }
);

// GET /api/organizations/:id - Get organization details
router.get(
  '/:id',
  requirePermission(Permission.ORG_READ),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user!;

      const organization = await organizationManagementService.getOrganization(
        id,
        userId
      );
      res.json(organization);
    } catch (error) {
      console.error('Get organization error:', error);
      const status =
        error instanceof Error && error.message.includes('not found')
          ? 404
          : 500;
      res.status(status).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch organization',
      });
    }
  }
);

// PUT /api/organizations/:id - Update organization
router.put(
  '/:id',
  requirePermission(Permission.ORG_WRITE),
  validateRequest({ body: updateOrganizationSchema }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user!;

      const organization =
        await organizationManagementService.updateOrganization(
          id,
          userId,
          req.body
        );

      res.json(organization);
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update organization',
      });
    }
  }
);

// DELETE /api/organizations/:id - Delete organization (owner only)
router.delete(
  '/:id',
  requirePermission(Permission.ORG_DELETE),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user!;

      const result = await organizationManagementService.deleteOrganization(
        id,
        userId
      );
      res.json(result);
    } catch (error) {
      console.error('Delete organization error:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete organization',
      });
    }
  }
);

// GET /api/organizations/:id/stats - Get organization statistics
router.get(
  '/:id/stats',
  requirePermission(Permission.ANALYTICS_READ),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const period = (req.query.period as 'day' | 'week' | 'month') || 'month';

      const stats = await organizationManagementService.getUsageStats(
        id,
        period
      );
      res.json(stats);
    } catch (error) {
      console.error('Get organization stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch organization statistics',
      });
    }
  }
);

// GET /api/organizations/:id/activity - Get organization activity log
router.get(
  '/:id/activity',
  requirePermission(Permission.AUDIT_READ),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await organizationManagementService.getActivityLog(
        id,
        page,
        limit
      );
      res.json(logs);
    } catch (error) {
      console.error('Get activity log error:', error);
      res.status(500).json({
        error: 'Failed to fetch activity log',
      });
    }
  }
);

// POST /api/organizations/:id/widgets/associate - Associate widget with organization
router.post(
  '/:id/widgets/associate',
  requirePermission(Permission.WIDGET_WRITE),
  validateRequest({ body: associateWidgetSchema }),
  async (req: Request, res: Response) => {
    try {
      const { id: organizationId } = req.params;

      const result = await organizationManagementService.associateWidget({
        organizationId,
        ...req.body,
      });

      res.json(result);
    } catch (error) {
      console.error('Associate widget error:', error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to associate widget',
      });
    }
  }
);

// DELETE /api/organizations/:id/widgets/:widgetId - Remove widget from organization
router.delete(
  '/:id/widgets/:widgetId',
  requirePermission(Permission.WIDGET_DELETE),
  async (req: Request, res: Response) => {
    try {
      const { id: organizationId, widgetId } = req.params;

      const result = await organizationManagementService.disassociateWidget(
        organizationId,
        widgetId
      );

      res.json(result);
    } catch (error) {
      console.error('Disassociate widget error:', error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to remove widget',
      });
    }
  }
);

// POST /api/organizations/:id/transfer-ownership - Transfer organization ownership
router.post(
  '/:id/transfer-ownership',
  validateRequest({ body: transferOwnershipSchema }),
  async (req: Request, res: Response) => {
    try {
      const { id: organizationId } = req.params;
      const { id: currentOwnerId } = req.user!;
      const { newOwnerId } = req.body;

      // Only owners can transfer ownership
      const user = req.user!;
      if (!user.roles?.includes(Role.owner)) {
        return res.status(403).json({
          error: 'Only organization owners can transfer ownership',
        });
      }

      const result = await organizationManagementService.transferOwnership(
        organizationId,
        currentOwnerId,
        newOwnerId
      );

      res.json(result);
    } catch (error) {
      console.error('Transfer ownership error:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to transfer ownership',
      });
    }
  }
);

// GET /api/organizations/:id/widgets - Get all widgets in organization
router.get(
  '/:id/widgets',
  requirePermission(Permission.WIDGET_READ),
  async (req: Request, res: Response) => {
    try {
      const { id: organizationId } = req.params;

      const widgets =
        await organizationManagementService.getOrganizationWidgets(
          organizationId
        );
      res.json(widgets);
    } catch (error) {
      console.error('Get organization widgets error:', error);
      res.status(500).json({
        error: 'Failed to fetch organization widgets',
      });
    }
  }
);

export default router;
