import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/security';
import { Permission } from '@prisma/client';
import { chatRateLimiter } from '../middleware/chatRateLimit';

const router = Router();

// Get rate limit status for the current user/organization
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const ip = getClientIp(req);
    const organizationId = req.organizationId;

    // Get IP rate limit status
    const ipStatus = await chatRateLimiter.getStatus(`chat_rl_ip:${ip}`, {
      windowMs: 60 * 1000,
      maxRequests: 100,
      keyPrefix: 'chat_rl_ip:',
    });

    // Get organization rate limit status if applicable
    let orgStatus = null;
    if (organizationId) {
      orgStatus = await chatRateLimiter.getStatus(
        `chat_rl_org:${organizationId}`,
        {
          windowMs: 60 * 60 * 1000,
          maxRequests: 1000,
          keyPrefix: 'chat_rl_org:',
        }
      );
    }

    res.json({
      ip: {
        limit: 100,
        window: '1 minute',
        current: ipStatus?.count || 0,
        remaining: ipStatus?.remaining || 100,
        resetTime: ipStatus?.resetTime
          ? new Date(ipStatus.resetTime).toISOString()
          : null,
      },
      organization: organizationId
        ? {
            limit: 1000,
            window: '1 hour',
            current: orgStatus?.count || 0,
            remaining: orgStatus?.remaining || 1000,
            resetTime: orgStatus?.resetTime
              ? new Date(orgStatus.resetTime).toISOString()
              : null,
          }
        : null,
    });
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
});

// Admin endpoint to reset rate limits
router.post(
  '/reset',
  authMiddleware,
  requirePermission(Permission.admin_super),
  async (req: Request, res: Response) => {
    try {
      const { type, key } = req.body;

      if (!type || !key) {
        return res.status(400).json({ error: 'Type and key are required' });
      }

      let fullKey: string;
      if (type === 'ip') {
        fullKey = `chat_rl_ip:${key}`;
      } else if (type === 'organization') {
        fullKey = `chat_rl_org:${key}`;
      } else {
        return res
          .status(400)
          .json({ error: 'Invalid type. Must be "ip" or "organization"' });
      }

      await chatRateLimiter.reset(fullKey);

      res.json({ message: 'Rate limit reset successfully' });
    } catch (error) {
      console.error('Failed to reset rate limit:', error);
      res.status(500).json({ error: 'Failed to reset rate limit' });
    }
  }
);

// Admin endpoint to get rate limit status for any key
router.get(
  '/admin/status/:type/:key',
  authMiddleware,
  requirePermission(Permission.admin_super),
  async (req: Request, res: Response) => {
    try {
      const { type, key } = req.params;

      let fullKey: string;
      let config: {
        windowMs: number;
        maxRequests: number;
        keyPrefix: string;
      };

      if (type === 'ip') {
        fullKey = `chat_rl_ip:${key}`;
        config = {
          windowMs: 60 * 1000,
          maxRequests: 100,
          keyPrefix: 'chat_rl_ip:',
        };
      } else if (type === 'organization') {
        fullKey = `chat_rl_org:${key}`;
        config = {
          windowMs: 60 * 60 * 1000,
          maxRequests: 1000,
          keyPrefix: 'chat_rl_org:',
        };
      } else {
        return res
          .status(400)
          .json({ error: 'Invalid type. Must be "ip" or "organization"' });
      }

      const status = await chatRateLimiter.getStatus(fullKey, config);

      if (!status) {
        return res.json({
          key,
          type,
          limit: config.maxRequests,
          window: type === 'ip' ? '1 minute' : '1 hour',
          current: 0,
          remaining: config.maxRequests,
          resetTime: null,
          message: 'No rate limit data found for this key',
        });
      }

      res.json({
        key,
        type,
        limit: status.limit,
        window: type === 'ip' ? '1 minute' : '1 hour',
        current: status.count,
        remaining: status.remaining,
        resetTime: new Date(status.resetTime).toISOString(),
      });
    } catch (error) {
      console.error('Failed to get rate limit status:', error);
      res.status(500).json({ error: 'Failed to get rate limit status' });
    }
  }
);

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips =
      typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }

  return req.ip || req.connection.remoteAddress || 'unknown';
}

export default router;
