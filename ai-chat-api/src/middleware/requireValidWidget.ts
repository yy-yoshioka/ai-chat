import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { isValidWidgetKey } from '../utils/widgetKey';

export interface WidgetRequest extends Request {
  widget?: {
    id: string;
    widgetKey: string;
    name: string;
    companyId: string;
    isActive: boolean;
    accentColor: string;
    logoUrl: string | null;
  };
}

/**
 * Middleware to validate widget key and attach widget to request
 */
export async function requireValidWidget(
  req: WidgetRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const widgetKey =
      req.params.widgetKey || req.body.widgetKey || req.headers['x-widget-key'];

    if (!widgetKey) {
      res.status(400).json({ error: 'Widget key is required' });
      return;
    }

    if (!isValidWidgetKey(widgetKey)) {
      res.status(400).json({ error: 'Invalid widget key format' });
      return;
    }

    const widget = await prisma.widget.findUnique({
      where: { widgetKey },
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

    if (!widget) {
      res.status(404).json({ error: 'Widget not found' });
      return;
    }

    if (!widget.isActive) {
      res.status(403).json({ error: 'Widget is inactive' });
      return;
    }

    // Attach widget info to request
    req.widget = {
      id: widget.id,
      widgetKey: widget.widgetKey,
      name: widget.name,
      companyId: widget.companyId,
      isActive: widget.isActive,
      accentColor: widget.accentColor,
      logoUrl: widget.logoUrl,
    };

    next();
  } catch (error) {
    console.error('Widget validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
