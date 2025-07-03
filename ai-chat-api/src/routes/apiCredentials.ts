import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/security';
import { Permission } from '@prisma/client';
import {
  createApiCredentials,
  updateApiCredentials,
  deleteApiCredentials,
  listApiCredentials,
} from '../services/apiCredentialsService';

const router = Router();

// Validation schemas
const createCredentialsSchema = z.object({
  service: z.enum(['openai', 'stripe', 'zendesk', 'intercom', 'smtp', 'other']),
  name: z.string().min(1).max(255),
  credentials: z.record(z.any()),
  expiresAt: z.string().datetime().optional(),
});

const updateCredentialsSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  credentials: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// List all API credentials (without decrypting)
router.get(
  '/',
  authMiddleware,
  requirePermission(Permission.settings_manage),
  async (req: Request, res: Response) => {
    try {
      const { service } = req.query;

      const credentials = await listApiCredentials(
        req.organizationId!,
        service as string | undefined
      );

      res.json({ credentials });
    } catch (error) {
      console.error('Failed to list API credentials:', error);
      res.status(500).json({ error: 'Failed to list API credentials' });
    }
  }
);

// Create new API credentials
router.post(
  '/',
  authMiddleware,
  requirePermission(Permission.settings_manage),
  async (req: Request, res: Response) => {
    try {
      const validation = createCredentialsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { service, name, credentials, expiresAt } = validation.data;

      const apiCredentials = await createApiCredentials(
        {
          organizationId: req.organizationId!,
          service,
          name,
          credentials,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
        req.user!.id
      );

      // Don't return the encrypted data
      const { encryptedData, ...response } = apiCredentials;

      res.status(201).json({ credentials: response });
    } catch (error) {
      console.error('Failed to create API credentials:', error);
      res.status(500).json({ error: 'Failed to create API credentials' });
    }
  }
);

// Update API credentials
router.put(
  '/:id',
  authMiddleware,
  requirePermission(Permission.settings_manage),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const validation = updateCredentialsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const updateData: any = {};
      if (validation.data.name !== undefined) {
        updateData.name = validation.data.name;
      }
      if (validation.data.credentials !== undefined) {
        updateData.credentials = validation.data.credentials;
      }
      if (validation.data.expiresAt !== undefined) {
        updateData.expiresAt = new Date(validation.data.expiresAt);
      }
      if (validation.data.isActive !== undefined) {
        updateData.isActive = validation.data.isActive;
      }

      const apiCredentials = await updateApiCredentials(
        id,
        req.organizationId!,
        updateData,
        req.user!.id
      );

      // Don't return the encrypted data
      const { encryptedData, ...response } = apiCredentials;

      res.json({ credentials: response });
    } catch (error) {
      console.error('Failed to update API credentials:', error);
      res.status(500).json({ error: 'Failed to update API credentials' });
    }
  }
);

// Delete API credentials
router.delete(
  '/:id',
  authMiddleware,
  requirePermission(Permission.settings_manage),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await deleteApiCredentials(id, req.organizationId!, req.user!.id);

      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete API credentials:', error);
      res.status(500).json({ error: 'Failed to delete API credentials' });
    }
  }
);

// Test API credentials (validates without storing)
router.post(
  '/test',
  authMiddleware,
  requirePermission(Permission.settings_manage),
  async (req: Request, res: Response) => {
    try {
      const { service, credentials } = req.body;

      // Service-specific validation logic
      let isValid = false;
      let message = '';

      switch (service) {
        case 'openai':
          // Test OpenAI API key
          if (credentials.apiKey && credentials.apiKey.startsWith('sk-')) {
            try {
              const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                  Authorization: `Bearer ${credentials.apiKey}`,
                },
              });
              isValid = response.ok;
              message = isValid
                ? 'OpenAI API key is valid'
                : 'Invalid OpenAI API key';
            } catch (error) {
              message = 'Failed to validate OpenAI API key';
            }
          } else {
            message = 'Invalid OpenAI API key format';
          }
          break;

        case 'stripe':
          // Test Stripe secret key
          if (
            credentials.secretKey &&
            credentials.secretKey.startsWith('sk_')
          ) {
            try {
              const response = await fetch(
                'https://api.stripe.com/v1/customers?limit=1',
                {
                  headers: {
                    Authorization: `Bearer ${credentials.secretKey}`,
                  },
                }
              );
              isValid = response.ok;
              message = isValid
                ? 'Stripe secret key is valid'
                : 'Invalid Stripe secret key';
            } catch (error) {
              message = 'Failed to validate Stripe secret key';
            }
          } else {
            message = 'Invalid Stripe secret key format';
          }
          break;

        case 'zendesk':
          // Test Zendesk credentials
          if (credentials.subdomain && credentials.email && credentials.token) {
            try {
              const authHeader = `Basic ${Buffer.from(`${credentials.email}/token:${credentials.token}`).toString('base64')}`;
              const response = await fetch(
                `https://${credentials.subdomain}.zendesk.com/api/v2/users/me.json`,
                {
                  headers: {
                    Authorization: authHeader,
                  },
                }
              );
              isValid = response.ok;
              message = isValid
                ? 'Zendesk credentials are valid'
                : 'Invalid Zendesk credentials';
            } catch (error) {
              message = 'Failed to validate Zendesk credentials';
            }
          } else {
            message = 'Missing required Zendesk fields';
          }
          break;

        case 'intercom':
          // Test Intercom access token
          if (credentials.accessToken) {
            try {
              const response = await fetch('https://api.intercom.io/me', {
                headers: {
                  Authorization: `Bearer ${credentials.accessToken}`,
                  Accept: 'application/json',
                },
              });
              isValid = response.ok;
              message = isValid
                ? 'Intercom access token is valid'
                : 'Invalid Intercom access token';
            } catch (error) {
              message = 'Failed to validate Intercom access token';
            }
          } else {
            message = 'Missing Intercom access token';
          }
          break;

        default:
          message = `Validation not implemented for service: ${service}`;
      }

      res.json({ valid: isValid, message });
    } catch (error) {
      console.error('Failed to test API credentials:', error);
      res.status(500).json({ error: 'Failed to test API credentials' });
    }
  }
);

export default router;
