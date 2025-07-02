import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import * as dataRetentionService from '../services/dataRetentionService';
import { prisma } from '../lib/prisma';
import {
  dataRetentionPolicySchema,
  dataRetentionCleanupSchema,
  globalCleanupSchema,
} from '../schemas/dataRetentionSchema';

const router = express.Router();

// Get retention policy
router.get('/policy', authMiddleware, async (req, res) => {
  try {
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return res
        .status(403)
        .json({ error: 'User does not belong to an organization' });
    }

    const policy = await dataRetentionService.getOrganizationRetentionPolicy(
      user.organizationId
    );
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch retention policy' });
  }
});

// Update retention policy
router.put('/policy', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Validate request body
    const validatedData = dataRetentionPolicySchema.parse(req.body);

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return res
        .status(403)
        .json({ error: 'User does not belong to an organization' });
    }

    const policy = await dataRetentionService.updateRetentionPolicy(
      user.organizationId,
      validatedData
    );
    res.json(policy);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Invalid request data', details: error });
    }
    res.status(500).json({ error: 'Failed to update retention policy' });
  }
});

// Manual cleanup trigger
router.post('/cleanup', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Validate request body
    const { dataType } = dataRetentionCleanupSchema.parse(req.body);

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return res
        .status(403)
        .json({ error: 'User does not belong to an organization' });
    }

    const policy = await dataRetentionService.getOrganizationRetentionPolicy(
      user.organizationId
    );

    let result;
    switch (dataType) {
      case 'chat_logs':
        result = policy.anonymizeData
          ? await dataRetentionService.anonymizeChatLogs(
              user.organizationId,
              policy.chatLogs
            )
          : await dataRetentionService.cleanupChatLogs(
              user.organizationId,
              policy.chatLogs
            );
        break;
      case 'webhook_logs':
        result = await dataRetentionService.cleanupWebhookLogs(
          user.organizationId,
          policy.webhookLogs
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    res.json({
      message: 'Cleanup completed',
      itemsProcessed: result,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Invalid request data', details: error });
    }
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// Get job history
router.get('/jobs', authMiddleware, async (req, res) => {
  try {
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return res
        .status(403)
        .json({ error: 'User does not belong to an organization' });
    }

    const jobs = await dataRetentionService.getRetentionJobHistory(
      user.organizationId,
      parseInt(req.query.limit as string) || 50
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job history' });
  }
});

// Admin-only global operations
router.get('/jobs/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const jobs = await dataRetentionService.getRetentionJobHistory(
      undefined,
      parseInt(req.query.limit as string) || 100
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global job history' });
  }
});

router.post(
  '/cleanup/global',
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      // Validate request body
      const { dataType, retentionDays } = globalCleanupSchema.parse(req.body);

      let result;
      switch (dataType) {
        case 'system_metrics':
          result = await dataRetentionService.cleanupSystemMetrics(
            retentionDays || 90
          );
          break;
        case 'health_checks':
          result = await dataRetentionService.cleanupHealthChecks(
            retentionDays || 7
          );
          break;
        default:
          return res.status(400).json({ error: 'Invalid data type' });
      }

      res.json({
        message: 'Global cleanup completed',
        itemsProcessed: result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res
          .status(400)
          .json({ error: 'Invalid request data', details: error });
      }
      res.status(500).json({ error: 'Global cleanup failed' });
    }
  }
);

export default router;
