import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import {
  requireValidWidget,
  WidgetRequest,
} from '../middleware/requireValidWidget';
import { generateWidgetKey } from '../utils/widgetKey';
import { sanitizeHexColor } from '../utils/validateHexColor';

const router = Router();

// Create a new widget (authenticated users only)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, accentColor, logoUrl, companyId } = req.body;

    if (!name || !companyId) {
      return res.status(400).json({ error: 'Name and companyId are required' });
    }

    // Validate accent color if provided
    let validColor = '#007bff'; // default
    if (accentColor) {
      const sanitized = sanitizeHexColor(accentColor);
      if (!sanitized) {
        return res.status(400).json({ error: 'Invalid accent color format' });
      }
      validColor = sanitized;
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const widget = await prisma.widget.create({
      data: {
        widgetKey: generateWidgetKey(),
        name,
        companyId,
        accentColor: validColor,
        logoUrl: logoUrl || null,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    });

    res.status(201).json(widget);
  } catch (error) {
    console.error('Create widget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List widgets for a company (authenticated users only)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res
        .status(400)
        .json({ error: 'companyId query parameter is required' });
    }

    const widgets = await prisma.widget.findMany({
      where: {
        companyId: companyId as string,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        _count: {
          select: {
            chatLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(widgets);
  } catch (error) {
    console.error('List widgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public widget config (no authentication required)
router.get(
  '/:widgetKey',
  requireValidWidget,
  async (req: WidgetRequest, res: Response) => {
    try {
      const widget = req.widget!;

      // Return only public configuration
      const publicConfig = {
        name: widget.name,
        accentColor: widget.accentColor,
        logoUrl: widget.logoUrl,
        isActive: widget.isActive,
      };

      res.json(publicConfig);
    } catch (error) {
      console.error('Get widget config error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update widget (authenticated users only)
router.put(
  '/:widgetKey',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { widgetKey } = req.params;
      const { name, accentColor, logoUrl, isActive } = req.body;

      // Validate accent color if provided
      let validColor: string | undefined;
      if (accentColor) {
        const sanitized = sanitizeHexColor(accentColor);
        if (!sanitized) {
          return res.status(400).json({ error: 'Invalid accent color format' });
        }
        validColor = sanitized;
      }

      const widget = await prisma.widget.update({
        where: { widgetKey },
        data: {
          ...(name && { name }),
          ...(validColor && { accentColor: validColor }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              plan: true,
            },
          },
        },
      });

      res.json(widget);
    } catch (error) {
      console.error('Update widget error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Soft delete widget (authenticated users only)
router.delete(
  '/:widgetKey',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { widgetKey } = req.params;

      const widget = await prisma.widget.update({
        where: { widgetKey },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      res.json({ message: 'Widget deactivated successfully', widget });
    } catch (error) {
      console.error('Delete widget error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get widget keys by company name (public endpoint for external integration)
router.get('/keys/:companyName', async (req: Request, res: Response) => {
  try {
    const { companyName } = req.params;

    const company = await prisma.company.findFirst({
      where: {
        name: companyName, // Exact match for simplicity
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const widgets = await prisma.widget.findMany({
      where: {
        companyId: company.id,
        isActive: true,
      },
      select: {
        widgetKey: true,
        name: true,
        accentColor: true,
      },
    });

    res.json({
      companyName: company.name,
      widgets: widgets,
    });
  } catch (error) {
    console.error('Get widget keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as widgetRoutes };
