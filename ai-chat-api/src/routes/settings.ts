import express from 'express';
import { authMiddleware as requireAuth } from '../middleware/auth';
import { orgAccessMiddleware as requireOrgAccess } from '../middleware/organizationAccess';
import * as settingsService from '../services/settingsService';

// Extend Express Request type
declare module 'express' {
  interface Request {
    organizationId?: string;
  }
}

const router = express.Router();

// API Keys
router.get('/api-keys', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const apiKeys = await settingsService.listAPIKeys(req.organizationId!);
    res.json(apiKeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

router.post('/api-keys', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const apiKey = await settingsService.createAPIKey(
      req.organizationId!,
      name
    );
    res.status(201).json(apiKey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.delete(
  '/api-keys/:id',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      await settingsService.deleteAPIKey(req.params.id, req.organizationId!);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  }
);

// Notification Settings
router.get(
  '/notifications',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      const settings = await settingsService.getNotificationSettings(
        req.organizationId!
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
  }
);

router.put(
  '/notifications',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      const settings = await settingsService.updateNotificationSettings(
        req.organizationId!,
        req.body
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  }
);

// User Notifications
router.get(
  '/notifications/list',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      const notifications = await settingsService.getUserNotifications(
        req.organizationId!,
        req.user?.id,
        parseInt(req.query.limit as string) || 50
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
);

router.patch(
  '/notifications/:id/read',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      await settingsService.markNotificationAsRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

router.patch(
  '/notifications/read-all',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      await settingsService.markAllNotificationsAsRead(
        req.organizationId!,
        req.user?.id
      );
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to mark all notifications as read' });
    }
  }
);

router.get(
  '/notifications/unread-count',
  requireAuth,
  requireOrgAccess,
  async (req, res) => {
    try {
      const count = await settingsService.getUnreadNotificationCount(
        req.organizationId!,
        req.user?.id
      );
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
);

export default router;
