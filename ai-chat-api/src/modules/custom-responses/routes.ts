import express from 'express';
import { z } from 'zod';
import { authMiddleware as requireAuth } from '../../middleware/auth';
import { orgAccessMiddleware as requireOrgAccess } from '../../middleware/organizationAccess';
import { requirePermission } from '../../middleware/permissions';
import { validateRequest } from '../../middleware/validateRequest';
import { customResponseService } from './services/customResponseService';
import { logger } from '@shared/logger';
import { Permission, ResponseType } from '@prisma/client';
import { prisma } from '@shared/database/prisma';

const router = express.Router();

// Validation schemas
const createResponseSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.nativeEnum(ResponseType),
    content: z.string().min(1).max(5000),
    metadata: z.record(z.unknown()).optional(),
    priority: z.number().int().min(0).max(1000).optional(),
    conditions: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateResponseSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.nativeEnum(ResponseType).optional(),
    content: z.string().min(1).max(5000).optional(),
    metadata: z.record(z.unknown()).optional(),
    priority: z.number().int().min(0).max(1000).optional(),
    conditions: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
  }),
});

const widgetAssociationSchema = z.object({
  body: z.object({
    widgetId: z.string().uuid(),
    isEnabled: z.boolean().optional(),
    overrideContent: z.string().max(5000).optional(),
  }),
});

// Get all custom responses for the organization
router.get(
  '/',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_READ),
  async (req, res) => {
    try {
      const { type, isActive } = req.query;

      const responses = await customResponseService.getOrganizationResponses(
        req.organizationId!,
        type as ResponseType | undefined,
        isActive === undefined ? undefined : isActive === 'true'
      );

      res.json(responses);
    } catch (error) {
      logger.error('Failed to fetch custom responses', error);
      res.status(500).json({ error: 'Failed to fetch custom responses' });
    }
  }
);

// Get a single custom response
router.get(
  '/:id',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_READ),
  async (req, res) => {
    try {
      const response = await customResponseService.getCustomResponse(
        req.params.id,
        req.organizationId!
      );

      if (!response) {
        return res.status(404).json({ error: 'Custom response not found' });
      }

      res.json(response);
    } catch (error) {
      logger.error('Failed to fetch custom response', error);
      res.status(500).json({ error: 'Failed to fetch custom response' });
    }
  }
);

// Create a new custom response
router.post(
  '/',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  validateRequest(createResponseSchema),
  async (req, res) => {
    try {
      const response = await customResponseService.createCustomResponse({
        organizationId: req.organizationId!,
        ...req.body,
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('Failed to create custom response', error);
      res.status(500).json({ error: 'Failed to create custom response' });
    }
  }
);

// Update a custom response
router.put(
  '/:id',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  validateRequest(updateResponseSchema),
  async (req, res) => {
    try {
      const response = await customResponseService.updateCustomResponse(
        req.params.id,
        req.organizationId!,
        req.body
      );

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: 'Custom response not found' });
      }
      logger.error('Failed to update custom response', error);
      res.status(500).json({ error: 'Failed to update custom response' });
    }
  }
);

// Delete a custom response
router.delete(
  '/:id',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  async (req, res) => {
    try {
      await customResponseService.deleteCustomResponse(
        req.params.id,
        req.organizationId!
      );

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: 'Custom response not found' });
      }
      logger.error('Failed to delete custom response', error);
      res.status(500).json({ error: 'Failed to delete custom response' });
    }
  }
);

// Associate a custom response with a widget
router.post(
  '/:id/widgets',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  validateRequest(widgetAssociationSchema),
  async (req, res) => {
    try {
      // Verify the widget belongs to the organization
      const widget = await prisma.widget.findFirst({
        where: {
          id: req.body.widgetId,
          company: {
            organizationId: req.organizationId!,
          },
        },
      });

      if (!widget) {
        return res.status(404).json({ error: 'Widget not found' });
      }

      await customResponseService.addResponseToWidget({
        widgetId: req.body.widgetId,
        customResponseId: req.params.id,
        isEnabled: req.body.isEnabled,
        overrideContent: req.body.overrideContent,
      });

      res.status(201).json({ message: 'Response associated with widget' });
    } catch (error) {
      logger.error('Failed to associate response with widget', error);
      res.status(500).json({ error: 'Failed to associate response' });
    }
  }
);

// Update widget-specific response settings
router.put(
  '/:id/widgets/:widgetId',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  validateRequest(widgetAssociationSchema),
  async (req, res) => {
    try {
      await customResponseService.updateWidgetResponse(
        req.params.widgetId,
        req.params.id,
        {
          isEnabled: req.body.isEnabled,
          overrideContent: req.body.overrideContent,
        }
      );

      res.json({ message: 'Widget response settings updated' });
    } catch (error) {
      logger.error('Failed to update widget response settings', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
);

// Remove custom response from widget
router.delete(
  '/:id/widgets/:widgetId',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  async (req, res) => {
    try {
      await customResponseService.removeResponseFromWidget(
        req.params.widgetId,
        req.params.id
      );

      res.status(204).send();
    } catch (error) {
      logger.error('Failed to remove response from widget', error);
      res.status(500).json({ error: 'Failed to remove response' });
    }
  }
);

// Create default responses for organization
router.post(
  '/defaults/create',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  async (req, res) => {
    try {
      await customResponseService.createDefaultResponses(req.organizationId!);
      res.json({ message: 'Default responses created' });
    } catch (error) {
      logger.error('Failed to create default responses', error);
      res.status(500).json({ error: 'Failed to create default responses' });
    }
  }
);

export default router;
