import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import { prisma } from '../lib/prisma';
import { generateThemeCSS } from '../utils/themeUtils';

const router = Router();

interface EmbedOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: { x: number; y: number };
  zIndex?: number;
  autoOpen?: boolean;
  showBranding?: boolean;
  customCSS?: string;
}

/**
 * Generate embed code for a widget
 */
router.get(
  '/:widgetKey',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { widgetKey } = req.params;
      const options: EmbedOptions = {
        position: (req.query.position as any) || 'bottom-right',
        offset: req.query.offset
          ? JSON.parse(req.query.offset as string)
          : { x: 20, y: 20 },
        zIndex: parseInt(req.query.zIndex as string) || 9999,
        autoOpen: req.query.autoOpen === 'true',
        showBranding: req.query.showBranding !== 'false',
        customCSS: (req.query.customCSS as string) || '',
      };

      // Verify widget exists and belongs to user's organization
      const widget = await prisma.widget.findFirst({
        where: {
          widgetKey,
          companyId: req.companyId!,
          isActive: true,
        },
        include: {
          company: true,
        },
      });

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      const embedCode = generateEmbedCode(widgetKey, options);
      const previewHTML = generatePreviewHTML(widget, options);

      res.json({
        widgetKey,
        widgetName: widget.name,
        company: widget.company.name,
        embedCode,
        previewHTML,
        options,
        instructions: {
          html: 'Copy and paste this code into your HTML before the closing </body> tag',
          wordpress:
            'Add this code to your WordPress theme footer or use a custom HTML widget',
          shopify:
            'Add this code to your theme.liquid file before the closing </body> tag',
          wix: 'Use the HTML embed element and paste this code',
          squarespace:
            'Add this code to Settings > Advanced > Code Injection > Footer',
        },
      });
    } catch (error) {
      console.error('Generate embed code error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get embed analytics
 */
router.get(
  '/:widgetKey/analytics',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { widgetKey } = req.params;
      const { startDate, endDate } = req.query;

      const widget = await prisma.widget.findFirst({
        where: {
          widgetKey,
          companyId: req.companyId!,
        },
      });

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      const start = startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await prisma.chatLog.groupBy({
        by: ['createdAt'],
        where: {
          widgetId: widget.id,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const totalMessages = await prisma.chatLog.count({
        where: {
          widgetId: widget.id,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      const uniqueUsers = await prisma.chatLog.groupBy({
        by: ['userId'],
        where: {
          widgetId: widget.id,
          createdAt: {
            gte: start,
            lte: end,
          },
          userId: {
            not: null,
          },
        },
      });

      res.json({
        widgetKey,
        period: { start, end },
        totalMessages,
        uniqueUsers: uniqueUsers.length,
        dailyStats: analytics,
      });
    } catch (error) {
      console.error('Get embed analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

function generateEmbedCode(widgetKey: string, options: EmbedOptions): string {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return `<!-- AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseURL}/widget-loader/${widgetKey}.v1.js';
    script.async = true;
    script.setAttribute('data-position', '${options.position}');
    script.setAttribute('data-offset-x', '${options.offset?.x || 20}');
    script.setAttribute('data-offset-y', '${options.offset?.y || 20}');
    script.setAttribute('data-z-index', '${options.zIndex || 9999}');
    script.setAttribute('data-auto-open', '${options.autoOpen || false}');
    script.setAttribute('data-show-branding', '${options.showBranding !== false}');
    ${options.customCSS ? `script.setAttribute('data-custom-css', '${options.customCSS.replace(/'/g, "\\'")}');` : ''}
    document.head.appendChild(script);
  })();
</script>
<!-- End AI Chat Widget -->`;
}

function generatePreviewHTML(widget: any, options: EmbedOptions): string {
  const themeCSS = generateThemeCSS({
    theme: widget.theme || 'light',
    primaryColor: widget.primaryColor || '#007bff',
    secondaryColor: widget.secondaryColor || '#6c757d',
    backgroundColor: widget.backgroundColor || '#ffffff',
    textColor: widget.textColor || '#212529',
    borderRadius: widget.borderRadius || 8,
    fontFamily: widget.fontFamily || 'system-ui',
  });

  const positionStyles = getPositionStyles(options.position!, options.offset!);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Preview - ${widget.name}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .preview-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .widget-preview {
      position: fixed;
      ${positionStyles}
      z-index: ${options.zIndex || 9999};
      width: 350px;
      height: 500px;
      background: ${widget.backgroundColor || '#ffffff'};
      border-radius: ${widget.borderRadius || 8}px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      border: 1px solid rgba(0,0,0,0.1);
      font-family: ${widget.fontFamily || 'system-ui'};
      ${themeCSS}
    }
    ${options.customCSS || ''}
  </style>
</head>
<body>
  <div class="preview-container">
    <h1>Widget Preview: ${widget.name}</h1>
    <p>This is how your chat widget will appear on your website.</p>
    <p>Position: ${options.position}</p>
    <p>Theme: ${widget.theme || 'light'}</p>
  </div>
  
  <div class="widget-preview">
    <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: ${widget.textColor || '#212529'};">
      <div style="width: 60px; height: 60px; background: ${widget.primaryColor || '#007bff'}; border-radius: 50%; margin-bottom: 20px; display: flex; align-items: center; justify-content: center;">
        <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <h3 style="margin: 0 0 10px 0; color: ${widget.primaryColor || '#007bff'};">${widget.name}</h3>
      <p style="margin: 0; opacity: 0.7; font-size: 14px;">Click to start chatting</p>
    </div>
  </div>
</body>
</html>`;
}

function getPositionStyles(
  position: string,
  offset: { x: number; y: number }
): string {
  switch (position) {
    case 'bottom-right':
      return `bottom: ${offset.y}px; right: ${offset.x}px;`;
    case 'bottom-left':
      return `bottom: ${offset.y}px; left: ${offset.x}px;`;
    case 'top-right':
      return `top: ${offset.y}px; right: ${offset.x}px;`;
    case 'top-left':
      return `top: ${offset.y}px; left: ${offset.x}px;`;
    default:
      return `bottom: ${offset.y}px; right: ${offset.x}px;`;
  }
}

export { router as embedRoutes };
