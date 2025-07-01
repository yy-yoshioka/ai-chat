import request from 'supertest';
import express from 'express';
import widgetRouter from '../../src/routes/widgets';
import { authMiddleware } from '../../src/middleware/auth';
import { orgAccessMiddleware } from '../../src/middleware/organizationAccess';
import * as widgetService from '../../src/services/widgetService';
import { testUser, testWidget, testCompany } from '../fixtures/test-data';

// Mock dependencies
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/organizationAccess');
jest.mock('../../src/services/widgetService');

const widgetServiceMock = widgetService as jest.Mocked<typeof widgetService>;

describe('Widget Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/widgets', widgetRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });

    (orgAccessMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.organizationId = testUser.organizationId;
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/widgets', () => {
    it('should return widgets for organization', async () => {
      const mockResult = {
        widgets: [testWidget],
        total: 1,
        page: 1,
        limit: 20,
      };

      widgetServiceMock.getWidgetsByOrganization.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/widgets')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);

      expect(widgetServiceMock.getWidgetsByOrganization).toHaveBeenCalledWith(
        testUser.organizationId,
        {
          page: undefined,
          limit: undefined,
          search: undefined,
          status: undefined,
        }
      );
    });

    it('should handle query parameters', async () => {
      const mockResult = {
        widgets: [testWidget],
        total: 1,
        page: 2,
        limit: 10,
      };

      widgetServiceMock.getWidgetsByOrganization.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/widgets')
        .set('Authorization', 'Bearer test-token')
        .query({
          page: 2,
          limit: 10,
          search: 'test',
          status: 'active',
        });

      expect(response.status).toBe(200);
      expect(widgetServiceMock.getWidgetsByOrganization).toHaveBeenCalledWith(
        testUser.organizationId,
        {
          page: 2,
          limit: 10,
          search: 'test',
          status: 'active',
        }
      );
    });

    it('should return 401 when not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/widgets');

      expect(response.status).toBe(401);
    });

    it('should handle service errors', async () => {
      widgetServiceMock.getWidgetsByOrganization.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/widgets')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch widgets' });
    });
  });

  describe('POST /api/widgets', () => {
    it('should create a new widget', async () => {
      const newWidgetData = {
        name: 'New Widget',
        companyId: testCompany.id,
        themeColor: '#FF0000',
        welcomeMessage: 'Welcome!',
        placeholderText: 'Ask me anything',
      };

      const createdWidget = {
        ...testWidget,
        ...newWidgetData,
        id: 'widget-new-123',
      };

      widgetServiceMock.createWidget.mockResolvedValue(createdWidget);

      const response = await request(app)
        .post('/api/widgets')
        .set('Authorization', 'Bearer test-token')
        .send(newWidgetData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdWidget);

      expect(widgetServiceMock.createWidget).toHaveBeenCalledWith({
        ...newWidgetData,
        organizationId: testUser.organizationId,
      });
    });

    it('should handle validation errors', async () => {
      widgetServiceMock.createWidget.mockRejectedValue(
        new Error('Company not found')
      );

      const response = await request(app)
        .post('/api/widgets')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Invalid Widget',
          companyId: 'non-existent',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Company not found' });
    });

    it('should handle access denied errors', async () => {
      widgetServiceMock.createWidget.mockRejectedValue(
        new Error('Access denied to company')
      );

      const response = await request(app)
        .post('/api/widgets')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Widget',
          companyId: 'other-company',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Access denied to company' });
    });
  });

  describe('GET /api/widgets/:id', () => {
    it('should return widget by ID', async () => {
      widgetServiceMock.getWidgetById.mockResolvedValue(testWidget);

      const response = await request(app)
        .get(`/api/widgets/${testWidget.id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testWidget);

      expect(widgetServiceMock.getWidgetById).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId
      );
    });

    it('should return 404 for non-existent widget', async () => {
      widgetServiceMock.getWidgetById.mockRejectedValue(
        new Error('Widget not found')
      );

      const response = await request(app)
        .get('/api/widgets/non-existent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Widget not found' });
    });

    it('should return 404 for widget from different organization', async () => {
      widgetServiceMock.getWidgetById.mockRejectedValue(
        new Error('Access denied to widget')
      );

      const response = await request(app)
        .get('/api/widgets/other-org-widget')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Access denied to widget' });
    });
  });

  describe('PUT /api/widgets/:id', () => {
    it('should update widget', async () => {
      const updateData = {
        name: 'Updated Widget',
        themeColor: '#00FF00',
        status: 'inactive' as const,
      };

      const updatedWidget = {
        ...testWidget,
        ...updateData,
        updatedAt: new Date(),
      };

      widgetServiceMock.updateWidget.mockResolvedValue(updatedWidget);

      const response = await request(app)
        .put(`/api/widgets/${testWidget.id}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedWidget);

      expect(widgetServiceMock.updateWidget).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId,
        updateData
      );
    });

    it('should return 404 for non-existent widget', async () => {
      widgetServiceMock.updateWidget.mockRejectedValue(
        new Error('Widget not found')
      );

      const response = await request(app)
        .put('/api/widgets/non-existent')
        .set('Authorization', 'Bearer test-token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Widget not found' });
    });

    it('should handle validation errors', async () => {
      widgetServiceMock.updateWidget.mockRejectedValue(
        new Error('Invalid theme color')
      );

      const response = await request(app)
        .put(`/api/widgets/${testWidget.id}`)
        .set('Authorization', 'Bearer test-token')
        .send({ themeColor: 'invalid' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Invalid theme color' });
    });
  });

  describe('DELETE /api/widgets/:id', () => {
    it('should delete widget', async () => {
      widgetServiceMock.deleteWidget.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/widgets/${testWidget.id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      expect(widgetServiceMock.deleteWidget).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId
      );
    });

    it('should return 404 for non-existent widget', async () => {
      widgetServiceMock.deleteWidget.mockRejectedValue(
        new Error('Widget not found')
      );

      const response = await request(app)
        .delete('/api/widgets/non-existent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Widget not found' });
    });

    it('should return 404 for widget from different organization', async () => {
      widgetServiceMock.deleteWidget.mockRejectedValue(
        new Error('Access denied to widget')
      );

      const response = await request(app)
        .delete('/api/widgets/other-org-widget')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Access denied to widget' });
    });
  });

  describe('GET /api/widgets/:id/analytics', () => {
    it('should return widget analytics', async () => {
      const mockAnalytics = {
        totalChats: 100,
        uniqueUsers: 50,
        avgResponseTime: 2.5,
        satisfactionRate: 0.85,
        topQuestions: [
          { question: 'How to reset password?', count: 10 },
          { question: 'What are your hours?', count: 8 },
        ],
        chatsByDay: [
          { date: '2024-01-01', count: 15 },
          { date: '2024-01-02', count: 20 },
        ],
      };

      widgetServiceMock.getWidgetAnalytics.mockResolvedValue(mockAnalytics);

      const response = await request(app)
        .get(`/api/widgets/${testWidget.id}/analytics`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalytics);

      expect(widgetServiceMock.getWidgetAnalytics).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId
      );
    });

    it('should return 404 for non-existent widget', async () => {
      widgetServiceMock.getWidgetAnalytics.mockRejectedValue(
        new Error('Widget not found')
      );

      const response = await request(app)
        .get('/api/widgets/non-existent/analytics')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Widget not found' });
    });

    it('should handle service errors', async () => {
      widgetServiceMock.getWidgetAnalytics.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get(`/api/widgets/${testWidget.id}/analytics`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('Organization access control', () => {
    it('should deny access when organization access middleware fails', async () => {
      (orgAccessMiddleware as jest.Mock).mockImplementation((req, res) => {
        res.status(403).json({ error: 'Forbidden' });
      });

      const response = await request(app)
        .get('/api/widgets')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Forbidden' });
    });
  });
});