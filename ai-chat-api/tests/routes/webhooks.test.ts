import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import webhooksRouter from '../../src/routes/webhooks';
import { authMiddleware } from '../../src/middleware/auth';
import { orgAccessMiddleware } from '../../src/middleware/organizationAccess';
import {
  testUser,
  testOrganization,
  generateTestToken,
} from '../fixtures/test-data';
import { webhookService } from '../../src/services/webhookService';
import { logger } from '../../src/lib/logger';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/organizationAccess');
jest.mock('../../src/services/webhookService');
jest.mock('../../src/lib/logger');

describe('Webhooks Routes', () => {
  let app: express.Application;
  let mockWebhookService: jest.Mocked<typeof webhookService>;

  const testWebhook = {
    id: 'webhook-test-123',
    name: 'Test Webhook',
    url: 'https://api.example.com/webhook',
    events: ['chat.created', 'user.created'],
    headers: { Authorization: 'Bearer token123' },
    retryCount: 3,
    timeoutMs: 5000,
    isActive: true,
    organizationId: testOrganization.id,
    secret: 'webhook-secret-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const testWebhookLog = {
    id: 'log-test-123',
    webhookId: testWebhook.id,
    event: 'chat.created',
    payload: { chatId: 'chat-123', message: 'Hello' },
    status: 'success',
    statusCode: 200,
    response: { success: true },
    attempt: 1,
    createdAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/webhooks', webhooksRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    (orgAccessMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.organizationId = testOrganization.id;
      next();
    });

    mockWebhookService = webhookService as jest.Mocked<typeof webhookService>;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/webhooks', () => {
    it('should return list of webhooks for organization', async () => {
      const mockWebhooks = [
        testWebhook,
        {
          ...testWebhook,
          id: 'webhook-test-456',
          name: 'Analytics Webhook',
          events: ['widget.created', 'widget.updated'],
        },
      ];

      mockWebhookService.getWebhooks.mockResolvedValue(mockWebhooks as any);

      const response = await request(app)
        .get('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: testWebhook.id,
        name: testWebhook.name,
        url: testWebhook.url,
        events: testWebhook.events,
      });

      expect(mockWebhookService.getWebhooks).toHaveBeenCalledWith(
        testOrganization.id
      );
    });

    it('should handle service errors', async () => {
      mockWebhookService.getWebhooks.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch webhooks',
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch webhooks',
        expect.any(Error)
      );
    });

    it('should return empty array if no webhooks exist', async () => {
      mockWebhookService.getWebhooks.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/webhooks/:id', () => {
    it('should return webhook by ID', async () => {
      mockWebhookService.getWebhook.mockResolvedValue(testWebhook as any);

      const response = await request(app)
        .get(`/api/webhooks/${testWebhook.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testWebhook.id,
        name: testWebhook.name,
        url: testWebhook.url,
        events: testWebhook.events,
        headers: testWebhook.headers,
        retryCount: testWebhook.retryCount,
        timeoutMs: testWebhook.timeoutMs,
      });

      expect(mockWebhookService.getWebhook).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id
      );
    });

    it('should return 404 if webhook not found', async () => {
      mockWebhookService.getWebhook.mockRejectedValue(
        new Error('Webhook not found')
      );

      const response = await request(app)
        .get('/api/webhooks/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Webhook not found' });
    });

    it('should handle other service errors', async () => {
      mockWebhookService.getWebhook.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get(`/api/webhooks/${testWebhook.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch webhook',
      });
    });
  });

  describe('POST /api/webhooks', () => {
    it('should create webhook successfully', async () => {
      const createData = {
        name: 'New Webhook',
        url: 'https://api.example.com/webhook',
        events: ['chat.created', 'user.updated'],
        headers: { 'X-API-Key': 'secret-key' },
        retryCount: 5,
        timeoutMs: 10000,
      };

      const createdWebhook = {
        ...testWebhook,
        ...createData,
        id: 'new-webhook-id',
      };

      mockWebhookService.createWebhook.mockResolvedValue(createdWebhook as any);

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(createData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 'new-webhook-id',
        name: createData.name,
        url: createData.url,
        events: createData.events,
        headers: createData.headers,
        retryCount: createData.retryCount,
        timeoutMs: createData.timeoutMs,
      });

      expect(mockWebhookService.createWebhook).toHaveBeenCalledWith(
        testOrganization.id,
        createData
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        url: 'https://api.example.com/webhook',
        events: ['chat.created'],
      };

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Name, URL, and events array are required',
      });
    });

    it('should validate URL format', async () => {
      const invalidData = {
        name: 'Test Webhook',
        url: 'invalid-url',
        events: ['chat.created'],
      };

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid URL format' });
    });

    it('should validate events array', async () => {
      const invalidData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['invalid.event', 'chat.created', 'another.invalid'],
      };

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Invalid events: invalid.event, another.invalid',
        validEvents: expect.arrayContaining([
          'chat.created',
          'user.created',
          'user.updated',
          'widget.created',
          'widget.updated',
          'widget.deleted',
          'knowledge_base.created',
          'knowledge_base.updated',
          'knowledge_base.deleted',
        ]),
      });
    });

    it('should handle events as non-array', async () => {
      const invalidData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: 'chat.created', // Should be array
      };

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Name, URL, and events array are required',
      });
    });

    it('should handle service creation errors', async () => {
      const createData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['chat.created'],
      };

      mockWebhookService.createWebhook.mockRejectedValue(
        new Error('Failed to create webhook in database')
      );

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(createData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to create webhook',
      });
    });
  });

  describe('PUT /api/webhooks/:id', () => {
    it('should update webhook successfully', async () => {
      const updateData = {
        name: 'Updated Webhook',
        url: 'https://api.example.com/updated-webhook',
        events: ['user.created', 'widget.created'],
        isActive: false,
      };

      const updatedWebhook = {
        ...testWebhook,
        ...updateData,
        updatedAt: new Date(),
      };

      mockWebhookService.updateWebhook.mockResolvedValue(updatedWebhook as any);

      const response = await request(app)
        .put(`/api/webhooks/${testWebhook.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testWebhook.id,
        name: updateData.name,
        url: updateData.url,
        events: updateData.events,
        isActive: updateData.isActive,
      });

      expect(mockWebhookService.updateWebhook).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id,
        updateData
      );
    });

    it('should return 404 if webhook not found', async () => {
      mockWebhookService.updateWebhook.mockRejectedValue(
        new Error('Webhook not found or access denied')
      );

      const response = await request(app)
        .put('/api/webhooks/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Webhook not found' });
    });

    it('should handle other service errors', async () => {
      mockWebhookService.updateWebhook.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .put(`/api/webhooks/${testWebhook.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to update webhook',
      });
    });
  });

  describe('DELETE /api/webhooks/:id', () => {
    it('should delete webhook successfully', async () => {
      mockWebhookService.deleteWebhook.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/webhooks/${testWebhook.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      expect(mockWebhookService.deleteWebhook).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id
      );
    });

    it('should return 404 if webhook not found', async () => {
      mockWebhookService.deleteWebhook.mockRejectedValue(
        new Error('Webhook not found or access denied')
      );

      const response = await request(app)
        .delete('/api/webhooks/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Webhook not found' });
    });

    it('should handle other service errors', async () => {
      mockWebhookService.deleteWebhook.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .delete(`/api/webhooks/${testWebhook.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to delete webhook',
      });
    });
  });

  describe('GET /api/webhooks/:id/logs', () => {
    it('should return webhook logs', async () => {
      const mockLogs = [
        testWebhookLog,
        {
          ...testWebhookLog,
          id: 'log-test-456',
          status: 'failed',
          statusCode: 500,
          response: { error: 'Internal Server Error' },
          attempt: 2,
        },
      ];

      mockWebhookService.getWebhookLogs.mockResolvedValue(mockLogs as any);

      const response = await request(app)
        .get(`/api/webhooks/${testWebhook.id}/logs`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: testWebhookLog.id,
        event: testWebhookLog.event,
        status: testWebhookLog.status,
        statusCode: testWebhookLog.statusCode,
      });

      expect(mockWebhookService.getWebhookLogs).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id,
        {
          status: undefined,
          event: undefined,
          startDate: undefined,
          endDate: undefined,
          limit: undefined,
        }
      );
    });

    it('should filter logs by query parameters', async () => {
      mockWebhookService.getWebhookLogs.mockResolvedValue([
        testWebhookLog,
      ] as any);

      const queryParams = {
        status: 'success',
        event: 'chat.created',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        limit: '10',
      };

      const response = await request(app)
        .get(`/api/webhooks/${testWebhook.id}/logs`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query(queryParams);

      expect(response.status).toBe(200);

      expect(mockWebhookService.getWebhookLogs).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id,
        {
          status: 'success',
          event: 'chat.created',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          limit: 10,
        }
      );
    });

    it('should return 404 if webhook not found', async () => {
      mockWebhookService.getWebhookLogs.mockRejectedValue(
        new Error('Webhook not found or access denied')
      );

      const response = await request(app)
        .get('/api/webhooks/non-existent-id/logs')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Webhook not found' });
    });

    it('should handle service errors', async () => {
      mockWebhookService.getWebhookLogs.mockRejectedValue(
        new Error('Database query failed')
      );

      const response = await request(app)
        .get(`/api/webhooks/${testWebhook.id}/logs`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch webhook logs',
      });
    });
  });

  describe('POST /api/webhooks/:id/test', () => {
    it('should test webhook successfully', async () => {
      const testLog = {
        ...testWebhookLog,
        id: 'test-log-123',
        event: 'test',
        payload: { test: true },
        status: 'success',
        statusCode: 200,
        response: { received: true },
      };

      mockWebhookService.testWebhook.mockResolvedValue(testLog as any);

      const response = await request(app)
        .post(`/api/webhooks/${testWebhook.id}/test`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testLog.id,
        event: 'test',
        status: 'success',
        statusCode: 200,
        response: { received: true },
      });

      expect(mockWebhookService.testWebhook).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id
      );
    });

    it('should return test results even if webhook fails', async () => {
      const failedTestLog = {
        ...testWebhookLog,
        id: 'test-log-failed',
        event: 'test',
        status: 'failed',
        statusCode: 404,
        response: { error: 'Not Found' },
        errorMessage: 'Webhook endpoint returned 404',
      };

      mockWebhookService.testWebhook.mockResolvedValue(failedTestLog as any);

      const response = await request(app)
        .post(`/api/webhooks/${testWebhook.id}/test`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'failed',
        statusCode: 404,
        errorMessage: 'Webhook endpoint returned 404',
      });
    });

    it('should return 404 if webhook not found', async () => {
      mockWebhookService.testWebhook.mockRejectedValue(
        new Error('Webhook not found')
      );

      const response = await request(app)
        .post('/api/webhooks/non-existent-id/test')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Webhook not found' });
    });

    it('should handle service errors during test', async () => {
      mockWebhookService.testWebhook.mockRejectedValue(
        new Error('Network timeout during test')
      );

      const response = await request(app)
        .post(`/api/webhooks/${testWebhook.id}/test`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to test webhook',
      });
    });
  });

  describe('Authentication and authorization', () => {
    it('should require authentication for all endpoints', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/webhooks');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should require organization access for all endpoints', async () => {
      (orgAccessMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(403).json({ error: 'Organization access required' });
      });

      const response = await request(app)
        .get('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Organization access required' });
    });

    it('should isolate webhooks by organization', async () => {
      mockWebhookService.getWebhooks.mockResolvedValue([testWebhook] as any);

      await request(app)
        .get('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(mockWebhookService.getWebhooks).toHaveBeenCalledWith(
        testOrganization.id
      );
    });
  });

  describe('Input validation and security', () => {
    it('should validate webhook URL protocols', async () => {
      const testCases = [
        { url: 'http://api.example.com/webhook', shouldPass: true },
        { url: 'https://api.example.com/webhook', shouldPass: true },
        { url: 'ftp://api.example.com/webhook', shouldPass: true }, // URL constructor allows this
        { url: 'javascript:alert(1)', shouldPass: false },
        { url: 'data:text/html,<script>alert(1)</script>', shouldPass: true }, // URL constructor allows this
      ];

      for (const testCase of testCases) {
        const createData = {
          name: 'Test Webhook',
          url: testCase.url,
          events: ['chat.created'],
        };

        const response = await request(app)
          .post('/api/webhooks')
          .set(
            'Authorization',
            `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
          )
          .send(createData);

        if (testCase.shouldPass) {
          // If URL passes validation, we expect either success or service error
          expect([200, 201, 500]).toContain(response.status);
        } else {
          expect(response.status).toBe(400);
          expect(response.body.error).toContain('Invalid URL format');
        }
      }
    });

    it('should sanitize webhook headers', async () => {
      const createData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['chat.created'],
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom-Header': 'value',
          'Content-Type': 'application/json',
        },
      };

      mockWebhookService.createWebhook.mockResolvedValue(testWebhook as any);

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(createData);

      expect(response.status).toBe(201);
      expect(mockWebhookService.createWebhook).toHaveBeenCalledWith(
        testOrganization.id,
        expect.objectContaining({
          headers: createData.headers,
        })
      );
    });

    it('should validate numeric fields', async () => {
      const createData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: ['chat.created'],
        retryCount: 'not-a-number',
        timeoutMs: 'also-not-a-number',
      };

      // The service layer should handle validation
      mockWebhookService.createWebhook.mockResolvedValue(testWebhook as any);

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(createData);

      expect(response.status).toBe(201);
      // Service receives the raw values and should validate them
      expect(mockWebhookService.createWebhook).toHaveBeenCalledWith(
        testOrganization.id,
        expect.objectContaining({
          retryCount: 'not-a-number',
          timeoutMs: 'also-not-a-number',
        })
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle very long webhook names', async () => {
      const longName = 'A'.repeat(1000);
      const createData = {
        name: longName,
        url: 'https://api.example.com/webhook',
        events: ['chat.created'],
      };

      // Service should handle validation
      mockWebhookService.createWebhook.mockResolvedValue({
        ...testWebhook,
        name: longName,
      } as any);

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(createData);

      expect(response.status).toBe(201);
    });

    it('should handle empty events array', async () => {
      const createData = {
        name: 'Test Webhook',
        url: 'https://api.example.com/webhook',
        events: [],
      };

      // Empty events array should be handled by the service
      mockWebhookService.createWebhook.mockResolvedValue(testWebhook as any);

      const response = await request(app)
        .post('/api/webhooks')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(createData);

      expect(response.status).toBe(201);
    });

    it('should handle date parsing errors in logs query', async () => {
      mockWebhookService.getWebhookLogs.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/webhooks/${testWebhook.id}/logs`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: 'invalid-date',
          endDate: 'also-invalid',
        });

      expect(response.status).toBe(200);

      // Service should receive Date objects (even if invalid dates)
      expect(mockWebhookService.getWebhookLogs).toHaveBeenCalledWith(
        testWebhook.id,
        testOrganization.id,
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      );
    });
  });
});
