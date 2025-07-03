import express from 'express';
import { authMiddleware as requireAuth } from '../../middleware/auth';
import { orgAccessMiddleware as requireOrgAccess } from '../../middleware/organizationAccess';
import { webhookService } from './services/webhookService';
import { logger } from '@shared/logger';

const router = express.Router();

// Get all webhooks for organization
router.get('/', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const webhooks = await webhookService.getWebhooks(req.organizationId!);
    res.json(webhooks);
  } catch (error) {
    logger.error('Failed to fetch webhooks', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Get single webhook
router.get('/:id', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const webhook = await webhookService.getWebhook(
      req.params.id,
      req.organizationId!
    );
    res.json(webhook);
  } catch (error) {
    if (error instanceof Error && error.message === 'Webhook not found') {
      res.status(404).json({ error: 'Webhook not found' });
    } else {
      logger.error('Failed to fetch webhook', error);
      res.status(500).json({ error: 'Failed to fetch webhook' });
    }
  }
});

// Create webhook
router.post('/', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const { name, url, events, headers, retryCount, timeoutMs } = req.body;

    if (!name || !url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Name, URL, and events array are required',
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Validate events
    const validEvents = [
      'chat.created',
      'user.created',
      'user.updated',
      'widget.created',
      'widget.updated',
      'widget.deleted',
      'knowledge_base.created',
      'knowledge_base.updated',
      'knowledge_base.deleted',
    ];

    const invalidEvents = events.filter(
      (e: string) => !validEvents.includes(e)
    );
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        error: `Invalid events: ${invalidEvents.join(', ')}`,
        validEvents,
      });
    }

    const webhook = await webhookService.createWebhook(req.organizationId!, {
      name,
      url,
      events,
      headers,
      retryCount,
      timeoutMs,
    });

    res.status(201).json(webhook);
  } catch (error) {
    logger.error('Failed to create webhook', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Update webhook
router.put('/:id', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const webhook = await webhookService.updateWebhook(
      req.params.id,
      req.organizationId!,
      req.body
    );
    res.json(webhook);
  } catch (error) {
    if (error.message === 'Webhook not found or access denied') {
      res.status(404).json({ error: 'Webhook not found' });
    } else {
      logger.error('Failed to update webhook', error);
      res.status(500).json({ error: 'Failed to update webhook' });
    }
  }
});

// Delete webhook
router.delete('/:id', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    await webhookService.deleteWebhook(req.params.id, req.organizationId!);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Webhook not found or access denied') {
      res.status(404).json({ error: 'Webhook not found' });
    } else {
      logger.error('Failed to delete webhook', error);
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  }
});

// Get webhook logs
router.get('/:id/logs', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const { status, event, startDate, endDate, limit } = req.query;

    const logs = await webhookService.getWebhookLogs(
      req.params.id,
      req.organizationId!,
      {
        status: status as string,
        event: event as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }
    );

    res.json(logs);
  } catch (error) {
    if (error.message === 'Webhook not found or access denied') {
      res.status(404).json({ error: 'Webhook not found' });
    } else {
      logger.error('Failed to fetch webhook logs', error);
      res.status(500).json({ error: 'Failed to fetch webhook logs' });
    }
  }
});

// Test webhook
router.post('/:id/test', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const log = await webhookService.testWebhook(
      req.params.id,
      req.organizationId!
    );
    res.json(log);
  } catch (error) {
    if (error instanceof Error && error.message === 'Webhook not found') {
      res.status(404).json({ error: 'Webhook not found' });
    } else {
      logger.error('Failed to test webhook', error);
      res.status(500).json({ error: 'Failed to test webhook' });
    }
  }
});

export default router;
