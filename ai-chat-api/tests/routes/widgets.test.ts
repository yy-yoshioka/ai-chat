import request from 'supertest';
import express from 'express';
import widgetRouter from '../../src/routes/widgets';
import { testUser, testWidget, testCompany } from '../fixtures/test-data';

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock middleware to attach user and organizationId
app.use((req, res, next) => {
  req.user = testUser;
  req.organizationId = testUser.organizationId;
  next();
});

app.use('/api/widgets', widgetRouter);

// Get mocked services
const widgetService = require('../../src/services/widgetService');

describe('Widget Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/widgets', () => {
    it('should return widgets for organization', async () => {
      const mockResult = {
        widgets: [
          {
            ...testWidget,
            company: {
              id: testCompany.id,
              name: testCompany.name,
              plan: 'pro',
            },
            _count: {
              chatLogs: 10,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      widgetService.getWidgetsByOrganization.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/widgets')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(widgetService.getWidgetsByOrganization).toHaveBeenCalledWith(
        testUser.organizationId,
        { page: 1, limit: 20, search: undefined }
      );
    });

    it('should handle search parameter', async () => {
      const mockResult = {
        widgets: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      widgetService.getWidgetsByOrganization.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/widgets')
        .query({ search: 'test' });

      expect(response.status).toBe(200);
      expect(widgetService.getWidgetsByOrganization).toHaveBeenCalledWith(
        testUser.organizationId,
        { page: 1, limit: 20, search: 'test' }
      );
    });
  });

  describe('GET /api/widgets/:id', () => {
    it('should return a widget by id', async () => {
      const mockWidget = {
        ...testWidget,
        company: {
          id: testCompany.id,
          name: testCompany.name,
          plan: 'pro',
          organizationId: testUser.organizationId,
        },
        knowledgeBases: [],
        _count: {
          chatLogs: 10,
          knowledgeBases: 0,
        },
      };

      widgetService.getWidgetById.mockResolvedValue(mockWidget);

      const response = await request(app).get(`/api/widgets/${testWidget.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWidget);
      expect(widgetService.getWidgetById).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId
      );
    });

    it('should return 404 if widget not found', async () => {
      widgetService.getWidgetById.mockResolvedValue(null);

      const response = await request(app).get('/api/widgets/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Widget not found');
    });
  });

  describe('POST /api/widgets', () => {
    it('should create a new widget', async () => {
      const createData = {
        name: 'New Widget',
        companyId: testCompany.id,
        themeColor: '#0000FF',
        welcomeMessage: 'Welcome!',
        placeholderText: 'Ask me anything...',
      };

      const mockCreatedWidget = {
        ...testWidget,
        ...createData,
        id: 'new-widget-id',
        widgetKey: 'wk_new_123',
        company: {
          id: testCompany.id,
          name: testCompany.name,
          plan: 'pro',
        },
      };

      widgetService.createWidget.mockResolvedValue(mockCreatedWidget);

      const response = await request(app).post('/api/widgets').send(createData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreatedWidget);
      expect(widgetService.createWidget).toHaveBeenCalledWith(
        createData,
        testUser.organizationId
      );
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app).post('/api/widgets').send({
        name: 'Widget',
        // missing required fields
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/widgets/:id', () => {
    it('should update a widget', async () => {
      const updateData = {
        name: 'Updated Widget',
        themeColor: '#FF0000',
      };

      const mockUpdatedWidget = {
        ...testWidget,
        ...updateData,
        company: {
          id: testCompany.id,
          name: testCompany.name,
          plan: 'pro',
        },
      };

      widgetService.updateWidget.mockResolvedValue(mockUpdatedWidget);

      const response = await request(app)
        .put(`/api/widgets/${testWidget.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedWidget);
      expect(widgetService.updateWidget).toHaveBeenCalledWith(
        testWidget.id,
        updateData,
        testUser.organizationId
      );
    });

    it('should return 404 if widget not found', async () => {
      widgetService.updateWidget.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/widgets/non-existent-id')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Widget not found');
    });
  });

  describe('DELETE /api/widgets/:id', () => {
    it('should delete a widget', async () => {
      widgetService.deleteWidget.mockResolvedValue(testWidget);

      const response = await request(app).delete(
        `/api/widgets/${testWidget.id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Widget deleted successfully');
      expect(widgetService.deleteWidget).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId
      );
    });

    it('should return 404 if widget not found', async () => {
      widgetService.deleteWidget.mockResolvedValue(null);

      const response = await request(app).delete(
        '/api/widgets/non-existent-id'
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Widget not found');
    });
  });

  describe('GET /api/widgets/:id/analytics', () => {
    it('should return widget analytics', async () => {
      const mockAnalytics = {
        totalChats: 100,
        monthlyChats: 30,
        avgSatisfaction: 4.5,
        topQuestions: [
          { question: 'How do I reset my password?', count: 10 },
          { question: 'What are your hours?', count: 8 },
        ],
      };

      widgetService.getWidgetAnalytics.mockResolvedValue(mockAnalytics);

      const response = await request(app)
        .get(`/api/widgets/${testWidget.id}/analytics`)
        .query({ period: 'month' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalytics);
      expect(widgetService.getWidgetAnalytics).toHaveBeenCalledWith(
        testWidget.id,
        'month',
        testUser.organizationId
      );
    });
  });

  describe('POST /api/widgets/:id/regenerate-key', () => {
    it('should regenerate widget key', async () => {
      const mockUpdatedWidget = {
        ...testWidget,
        widgetKey: 'wk_new_key_123',
      };

      widgetService.regenerateWidgetKey.mockResolvedValue(mockUpdatedWidget);

      const response = await request(app)
        .post(`/api/widgets/${testWidget.id}/regenerate-key`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.widgetKey).toBe('wk_new_key_123');
      expect(widgetService.regenerateWidgetKey).toHaveBeenCalledWith(
        testWidget.id,
        testUser.organizationId
      );
    });
  });
});
