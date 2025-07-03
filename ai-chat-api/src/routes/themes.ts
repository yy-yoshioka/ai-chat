import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { validateRequest } from '../middleware/validateRequest';
import { Permission } from '@prisma/client';
import { z } from 'zod';
import { themeService } from '../services/themeService';

const router = Router();

// Input validation schemas
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const themeDataSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  primaryColor: z.string().regex(hexColorRegex).optional(),
  secondaryColor: z.string().regex(hexColorRegex).optional(),
  backgroundColor: z.string().regex(hexColorRegex).optional(),
  textColor: z.string().regex(hexColorRegex).optional(),
  borderRadius: z.number().min(0).max(50).optional(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
});

const applyThemeSchema = z.object({
  widgetIds: z.array(z.string()).min(1),
});

const createPresetSchema = z.object({
  name: z.string().min(1).max(50),
  theme: themeDataSchema.required(),
});

// All theme routes require authentication
router.use(authMiddleware);

// GET /api/themes/default - Get organization default theme
router.get(
  '/default',
  requirePermission(Permission.SETTINGS_READ),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const theme =
        await themeService.getOrganizationDefaultTheme(organizationId);

      res.json(theme);
    } catch (error) {
      console.error('Get default theme error:', error);
      res.status(500).json({
        error: 'Failed to fetch default theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// PUT /api/themes/default - Update organization default theme
router.put(
  '/default',
  requirePermission(Permission.SETTINGS_WRITE),
  validateRequest({ body: themeDataSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.user!;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const theme = await themeService.setOrganizationDefaultTheme(
        organizationId,
        req.body,
        userId
      );

      res.json(theme);
    } catch (error) {
      console.error('Update default theme error:', error);
      res.status(500).json({
        error: 'Failed to update default theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// POST /api/themes/apply/:widgetId - Apply organization theme to specific widget
router.post(
  '/apply/:widgetId',
  requirePermission(Permission.WIDGET_CONFIGURE),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.user!;
      const { widgetId } = req.params;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const widget = await themeService.applyOrganizationThemeToWidget(
        widgetId,
        organizationId,
        userId
      );

      res.json({
        success: true,
        widget: {
          id: widget.id,
          name: widget.name,
          theme: widget.theme,
          primaryColor: widget.primaryColor,
        },
      });
    } catch (error) {
      console.error('Apply theme error:', error);
      res.status(500).json({
        error: 'Failed to apply theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// POST /api/themes/apply/bulk - Apply organization theme to multiple widgets
router.post(
  '/apply/bulk',
  requirePermission(Permission.WIDGET_CONFIGURE),
  validateRequest({ body: applyThemeSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.user!;
      const { widgetIds } = req.body;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const widgets = await themeService.bulkApplyOrganizationTheme(
        organizationId,
        widgetIds,
        userId
      );

      res.json({
        success: true,
        updated: widgets.length,
        widgets: widgets.map((w) => ({
          id: w.id,
          name: w.name,
          theme: w.theme,
          primaryColor: w.primaryColor,
        })),
      });
    } catch (error) {
      console.error('Bulk apply theme error:', error);
      res.status(500).json({
        error: 'Failed to apply theme to widgets',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// POST /api/themes/validate/:widgetId - Validate widget theme
router.post(
  '/validate/:widgetId',
  requirePermission(Permission.WIDGET_READ),
  validateRequest({ body: themeDataSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;
      const { widgetId } = req.params;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const validation = await themeService.validateWidgetTheme(
        widgetId,
        req.body,
        organizationId
      );

      res.json(validation);
    } catch (error) {
      console.error('Validate theme error:', error);
      res.status(500).json({
        error: 'Failed to validate theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// GET /api/themes/widgets/default - Get widgets using default theme
router.get(
  '/widgets/default',
  requirePermission(Permission.WIDGET_READ),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const widgets =
        await themeService.getWidgetsUsingDefaultTheme(organizationId);

      res.json(widgets);
    } catch (error) {
      console.error('Get widgets using default theme error:', error);
      res.status(500).json({
        error: 'Failed to fetch widgets',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// GET /api/themes/usage - Get theme usage statistics
router.get(
  '/usage',
  requirePermission(Permission.ANALYTICS_READ),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const stats = await themeService.getThemeUsageStats(organizationId);

      res.json(stats);
    } catch (error) {
      console.error('Get theme usage stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch theme statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// POST /api/themes/presets - Create theme preset
router.post(
  '/presets',
  requirePermission(Permission.SETTINGS_WRITE),
  validateRequest({ body: createPresetSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.user!;
      const { name, theme } = req.body;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const preset = await themeService.createThemePreset(
        organizationId,
        name,
        theme,
        userId
      );

      res.json(preset);
    } catch (error) {
      console.error('Create theme preset error:', error);
      res.status(500).json({
        error: 'Failed to create theme preset',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// GET /api/themes/presets - Get theme presets
router.get(
  '/presets',
  requirePermission(Permission.SETTINGS_READ),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;

      if (!organizationId) {
        return res.status(400).json({
          error: 'User not associated with an organization',
        });
      }

      const presets = await themeService.getThemePresets(organizationId);

      res.json(presets);
    } catch (error) {
      console.error('Get theme presets error:', error);
      res.status(500).json({
        error: 'Failed to fetch theme presets',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
