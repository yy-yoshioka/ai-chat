import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import analyticsRouter from '../../src/routes/analytics';
import { authMiddleware } from '../../src/middleware/auth';
import {
  testUser,
  testOrganization,
  testWidget,
  testChatLog,
  generateTestToken,
} from '../fixtures/test-data';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');

describe('Analytics Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/overview', () => {
    it('should return analytics overview', async () => {
      const mockData = {
        totalChats: 1250,
        totalUsers: 150,
        avgResponseTime: 2.5,
        satisfactionRate: 0.85,
        activeWidgets: 5,
        totalFeedback: 300,
        positiveFeedback: 255,
        negativeFeedback: 30,
        neutralFeedback: 15,
      };

      // Mock aggregation queries
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(
        mockData.totalChats
      );
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([
        { _count: { _all: mockData.totalUsers } },
      ]);
      (prisma.chatLog.aggregate as jest.Mock).mockResolvedValue({
        _avg: { responseTime: mockData.avgResponseTime },
      });
      (prisma.widget.count as jest.Mock).mockResolvedValue(
        mockData.activeWidgets
      );
      (prisma.messageFeedback.groupBy as jest.Mock).mockResolvedValue([
        { feedback: 'positive', _count: { _all: mockData.positiveFeedback } },
        { feedback: 'negative', _count: { _all: mockData.negativeFeedback } },
        { feedback: 'neutral', _count: { _all: mockData.neutralFeedback } },
      ]);

      const response = await request(app)
        .get('/api/analytics/overview')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalChats: mockData.totalChats,
        totalUsers: mockData.totalUsers,
        avgResponseTime: mockData.avgResponseTime,
        satisfactionRate: mockData.satisfactionRate,
        activeWidgets: mockData.activeWidgets,
        feedbackBreakdown: {
          positive: mockData.positiveFeedback,
          negative: mockData.negativeFeedback,
          neutral: mockData.neutralFeedback,
        },
      });
    });

    it('should filter by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.aggregate as jest.Mock).mockResolvedValue({
        _avg: { responseTime: 2.0 },
      });
      (prisma.widget.count as jest.Mock).mockResolvedValue(3);
      (prisma.messageFeedback.groupBy as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/analytics/overview')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ startDate, endDate });

      expect(response.status).toBe(200);
      expect(prisma.chatLog.count).toHaveBeenCalledWith({
        where: {
          organizationId: testOrganization.id,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate + 'T23:59:59.999Z'),
          },
        },
      });
    });
  });

  describe('GET /api/analytics/conversations', () => {
    it('should return conversation analytics', async () => {
      const mockConversations = [
        {
          date: '2024-01-01',
          count: 45,
          avgDuration: 180,
          avgMessages: 5,
        },
        {
          date: '2024-01-02',
          count: 52,
          avgDuration: 200,
          avgMessages: 6,
        },
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockConversations);

      const response = await request(app)
        .get('/api/analytics/conversations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          groupBy: 'day',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: mockConversations,
        summary: {
          totalConversations: 97,
          avgDuration: 190,
          avgMessagesPerConversation: 5.5,
        },
      });
    });

    it('should group by different time periods', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const testCases = ['hour', 'day', 'week', 'month'];

      for (const groupBy of testCases) {
        const response = await request(app)
          .get('/api/analytics/conversations')
          .set(
            'Authorization',
            `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
          )
          .query({ groupBy });

        expect(response.status).toBe(200);
      }
    });

    it('should filter by widget', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/analytics/conversations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ widgetId: testWidget.id });

      expect(response.status).toBe(200);
      // Verify the query included widget filter
      const queryCall = (prisma.$queryRaw as jest.Mock).mock.calls[0];
      expect(queryCall[0]).toContain('widgetId');
    });
  });

  describe('GET /api/analytics/unanswered', () => {
    it('should return unanswered questions analytics', async () => {
      const mockUnanswered = [
        {
          id: 'unanswered-1',
          chatLog: {
            question: 'How do I integrate with Zapier?',
            createdAt: new Date('2024-01-15'),
            widgetId: 'widget-1',
          },
          status: 'pending',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'unanswered-2',
          chatLog: {
            question: 'What is the API rate limit?',
            createdAt: new Date('2024-01-16'),
            widgetId: 'widget-2',
          },
          status: 'pending',
          createdAt: new Date('2024-01-16'),
        },
      ];

      (prisma.unansweredMessage.findMany as jest.Mock).mockResolvedValue(
        mockUnanswered
      );
      (prisma.unansweredMessage.count as jest.Mock).mockResolvedValue(2);

      // Mock topic clustering
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { topic: 'Integration', count: 15 },
        { topic: 'API', count: 12 },
        { topic: 'Pricing', count: 8 },
      ]);

      const response = await request(app)
        .get('/api/analytics/unanswered')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          status: 'pending',
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        questions: expect.arrayContaining([
          expect.objectContaining({
            id: 'unanswered-1',
            question: 'How do I integrate with Zapier?',
            status: 'pending',
          }),
        ]),
        total: 2,
        topTopics: expect.arrayContaining([
          { topic: 'Integration', count: 15 },
          { topic: 'API', count: 12 },
        ]),
      });
    });

    it('should filter by status', async () => {
      (prisma.unansweredMessage.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.unansweredMessage.count as jest.Mock).mockResolvedValue(0);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const statuses = ['pending', 'reviewed', 'resolved'];

      for (const status of statuses) {
        const response = await request(app)
          .get('/api/analytics/unanswered')
          .set(
            'Authorization',
            `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
          )
          .query({ status });

        expect(response.status).toBe(200);
        expect(prisma.unansweredMessage.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status,
            }),
          })
        );
      }
    });

    it('should paginate results', async () => {
      (prisma.unansweredMessage.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.unansweredMessage.count as jest.Mock).mockResolvedValue(50);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/analytics/unanswered')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          page: 2,
          limit: 20,
        });

      expect(response.status).toBe(200);
      expect(prisma.unansweredMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      );
    });
  });

  describe('GET /api/analytics/topics', () => {
    it('should return topic analytics', async () => {
      const mockTopics = [
        {
          topic: 'Billing',
          count: 125,
          percentage: 25,
          trend: 'up',
          examples: [
            'How do I update my credit card?',
            'What plans do you offer?',
            'Can I cancel my subscription?',
          ],
        },
        {
          topic: 'Technical Support',
          count: 98,
          percentage: 19.6,
          trend: 'stable',
          examples: [
            'API is returning 500 errors',
            'How to debug webhook issues?',
            'Widget not loading on mobile',
          ],
        },
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockTopics);

      const response = await request(app)
        .get('/api/analytics/topics')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        topics: mockTopics,
        totalQuestions: 500,
      });
    });

    it('should filter by widget', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/analytics/topics')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          widgetId: testWidget.id,
          limit: 5,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/analytics/feedback', () => {
    it('should return feedback analytics', async () => {
      const mockFeedback = {
        positive: 450,
        negative: 30,
        neutral: 20,
        total: 500,
        satisfactionRate: 0.9,
        trends: [
          { date: '2024-01-01', positive: 15, negative: 1, neutral: 1 },
          { date: '2024-01-02', positive: 18, negative: 2, neutral: 0 },
        ],
      };

      (prisma.messageFeedback.groupBy as jest.Mock).mockResolvedValue([
        { feedback: 'positive', _count: { _all: mockFeedback.positive } },
        { feedback: 'negative', _count: { _all: mockFeedback.negative } },
        { feedback: 'neutral', _count: { _all: mockFeedback.neutral } },
      ]);

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockFeedback.trends);

      const response = await request(app)
        .get('/api/analytics/feedback')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        summary: {
          positive: mockFeedback.positive,
          negative: mockFeedback.negative,
          neutral: mockFeedback.neutral,
          total: mockFeedback.total,
          satisfactionRate: mockFeedback.satisfactionRate,
        },
        trends: mockFeedback.trends,
      });
    });

    it('should include feedback comments', async () => {
      const mockComments = [
        {
          id: 'feedback-1',
          feedback: 'positive',
          comment: 'Very helpful!',
          chatLog: {
            question: 'How do I reset my password?',
            answer: 'You can reset your password by...',
          },
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'feedback-2',
          feedback: 'negative',
          comment: 'Did not answer my question',
          chatLog: {
            question: 'Complex technical issue',
            answer: 'I understand you need help...',
          },
          createdAt: new Date('2024-01-16'),
        },
      ];

      (prisma.messageFeedback.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.messageFeedback.findMany as jest.Mock).mockResolvedValue(
        mockComments
      );
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/analytics/feedback')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ includeComments: true });

      expect(response.status).toBe(200);
      expect(response.body.comments).toHaveLength(2);
      expect(response.body.comments[0]).toMatchObject({
        feedback: 'positive',
        comment: 'Very helpful!',
      });
    });
  });

  describe('GET /api/analytics/performance', () => {
    it('should return performance metrics', async () => {
      const mockMetrics = {
        avgResponseTime: 1.8,
        p95ResponseTime: 3.2,
        p99ResponseTime: 5.1,
        errorRate: 0.02,
        uptime: 99.95,
        totalRequests: 15000,
        successfulRequests: 14700,
        failedRequests: 300,
      };

      (prisma.systemMetric.aggregate as jest.Mock).mockResolvedValue({
        _avg: { value: mockMetrics.avgResponseTime },
      });

      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([
          {
            p95: mockMetrics.p95ResponseTime,
            p99: mockMetrics.p99ResponseTime,
          },
        ])
        .mockResolvedValueOnce([
          {
            total: mockMetrics.totalRequests,
            successful: mockMetrics.successfulRequests,
            failed: mockMetrics.failedRequests,
          },
        ]);

      const response = await request(app)
        .get('/api/analytics/performance')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        responseTime: {
          avg: mockMetrics.avgResponseTime,
          p95: mockMetrics.p95ResponseTime,
          p99: mockMetrics.p99ResponseTime,
        },
        reliability: {
          errorRate: mockMetrics.errorRate,
          uptime: mockMetrics.uptime,
          totalRequests: mockMetrics.totalRequests,
          successfulRequests: mockMetrics.successfulRequests,
          failedRequests: mockMetrics.failedRequests,
        },
      });
    });

    it('should return performance trends', async () => {
      const mockTrends = [
        { date: '2024-01-01', avgResponseTime: 1.5, errorRate: 0.01 },
        { date: '2024-01-02', avgResponseTime: 1.8, errorRate: 0.02 },
        { date: '2024-01-03', avgResponseTime: 2.1, errorRate: 0.015 },
      ];

      (prisma.systemMetric.aggregate as jest.Mock).mockResolvedValue({
        _avg: { value: 1.8 },
      });
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([{ p95: 3.0, p99: 5.0 }])
        .mockResolvedValueOnce([{ total: 1000, successful: 980, failed: 20 }])
        .mockResolvedValueOnce(mockTrends);

      const response = await request(app)
        .get('/api/analytics/performance')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-03',
          includeTrends: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.trends).toEqual(mockTrends);
    });
  });

  describe('GET /api/analytics/export', () => {
    it('should export analytics data as CSV', async () => {
      const mockData = {
        overview: {
          totalChats: 1000,
          totalUsers: 100,
          satisfactionRate: 0.85,
        },
        conversations: [
          { date: '2024-01-01', count: 45 },
          { date: '2024-01-02', count: 52 },
        ],
      };

      // Mock all the queries
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(
        mockData.overview.totalChats
      );
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([
        { _count: { _all: mockData.overview.totalUsers } },
      ]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockData.conversations);

      const response = await request(app)
        .get('/api/analytics/export')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          format: 'csv',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain(
        'analytics-export'
      );
    });

    it('should export analytics data as JSON', async () => {
      const mockData = {
        overview: {
          totalChats: 1000,
          totalUsers: 100,
        },
      };

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(
        mockData.overview.totalChats
      );
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([
        { _count: { _all: mockData.overview.totalUsers } },
      ]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/analytics/export')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          format: 'json',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toHaveProperty('exportDate');
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 for invalid export format', async () => {
      const response = await request(app)
        .get('/api/analytics/export')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ format: 'pdf' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid export format. Supported formats: csv, json',
      });
    });
  });

  describe('Analytics access control', () => {
    it('should return 401 when not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/analytics/overview');

      expect(response.status).toBe(401);
    });

    it('should only return data for user organization', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.aggregate as jest.Mock).mockResolvedValue({
        _avg: { responseTime: 2.0 },
      });
      (prisma.widget.count as jest.Mock).mockResolvedValue(3);
      (prisma.messageFeedback.groupBy as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/analytics/overview')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(prisma.chatLog.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          organizationId: testOrganization.id,
        }),
      });
    });
  });
});
