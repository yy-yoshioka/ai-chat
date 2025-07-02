import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import adminRouter from '../../src/routes/admin';
import { authMiddleware } from '../../src/middleware/auth';
import { adminMiddleware } from '../../src/middleware/admin';
import { 
  testUser, 
  testOrganization,
  generateTestToken
} from '../fixtures/test-data';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/admin');

describe('Admin Routes', () => {
  let app: express.Application;

  const adminUser = {
    ...testUser,
    id: 'admin-user-id',
    roles: ['admin'],
  };

  const mockChatLogs = [
    {
      id: 'chat-log-1',
      question: 'What is your return policy?',
      answer: 'Our return policy allows returns within 30 days...',
      sessionId: 'session-123',
      organizationId: testOrganization.id,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      user: {
        id: testUser.id,
        email: testUser.email,
      },
    },
    {
      id: 'chat-log-2',
      question: 'How do I contact support?',
      answer: 'You can contact our support team at...',
      sessionId: 'session-456',
      organizationId: testOrganization.id,
      createdAt: new Date('2024-01-16T14:30:00Z'),
      updatedAt: new Date('2024-01-16T14:30:00Z'),
      user: {
        id: 'user-2',
        email: 'user2@example.com',
      },
    },
    {
      id: 'chat-log-3',
      question: 'What are your business hours?',
      answer: 'We are open Monday through Friday...',
      sessionId: 'session-789',
      organizationId: testOrganization.id,
      createdAt: new Date('2024-01-17T09:15:00Z'),
      updatedAt: new Date('2024-01-17T09:15:00Z'),
      user: {
        id: 'user-3',
        email: 'user3@example.com',
      },
    },
  ];

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...adminUser, organization: testOrganization };
      next();
    });

    (adminMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/admin/chat-logs', () => {
    it('should return all chat logs with user details', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockChatLogs);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      
      expect(response.body[0]).toMatchObject({
        id: 'chat-log-1',
        question: 'What is your return policy?',
        answer: 'Our return policy allows returns within 30 days...',
        sessionId: 'session-123',
        organizationId: testOrganization.id,
        user: {
          id: testUser.id,
          email: testUser.email,
        },
      });

      expect(response.body[1]).toMatchObject({
        id: 'chat-log-2',
        question: 'How do I contact support?',
        user: {
          id: 'user-2',
          email: 'user2@example.com',
        },
      });

      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no chat logs exist', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(500);
    });

    it('should order chat logs by creation date descending', async () => {
      const unorderedLogs = [
        { ...mockChatLogs[1], createdAt: new Date('2024-01-16T14:30:00Z') },
        { ...mockChatLogs[0], createdAt: new Date('2024-01-15T10:00:00Z') },
        { ...mockChatLogs[2], createdAt: new Date('2024-01-17T09:15:00Z') },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(unorderedLogs);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);

      // Verify the ordering parameter was used
      expect(prisma.chatLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should include only necessary user fields for privacy', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockChatLogs);

      await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });

      // Verify that sensitive user data is not included
      expect(prisma.chatLog.findMany).not.toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: expect.objectContaining({
              select: expect.objectContaining({
                password: true,
              }),
            }),
          }),
        })
      );
    });

    it('should handle chat logs with missing user data', async () => {
      const logsWithMissingUser = [
        {
          ...mockChatLogs[0],
          user: null,
        },
        mockChatLogs[1],
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(logsWithMissingUser);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].user).toBeNull();
      expect(response.body[1].user).toMatchObject({
        id: 'user-2',
        email: 'user2@example.com',
      });
    });
  });

  describe('GET /api/admin/report/chat-logs', () => {
    it('should return chat logs grouped by creation date', async () => {
      const mockGroupedData = [
        {
          createdAt: new Date('2024-01-15T00:00:00Z'),
          _count: { id: 5 },
        },
        {
          createdAt: new Date('2024-01-16T00:00:00Z'),
          _count: { id: 8 },
        },
        {
          createdAt: new Date('2024-01-17T00:00:00Z'),
          _count: { id: 3 },
        },
      ];

      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue(mockGroupedData);

      const response = await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      
      expect(response.body[0]).toMatchObject({
        createdAt: '2024-01-15T00:00:00.000Z',
        _count: { id: 5 },
      });

      expect(response.body[1]).toMatchObject({
        createdAt: '2024-01-16T00:00:00.000Z',
        _count: { id: 8 },
      });

      expect(response.body[2]).toMatchObject({
        createdAt: '2024-01-17T00:00:00.000Z',
        _count: { id: 3 },
      });

      expect(prisma.chatLog.groupBy).toHaveBeenCalledWith({
        by: ['createdAt'],
        _count: { id: true },
      });
    });

    it('should return empty array when no chat logs exist for report', async () => {
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors gracefully for report', async () => {
      (prisma.chatLog.groupBy as jest.Mock).mockRejectedValue(
        new Error('Database aggregation failed')
      );

      const response = await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(500);
    });

    it('should use correct groupBy parameters', async () => {
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(prisma.chatLog.groupBy).toHaveBeenCalledWith({
        by: ['createdAt'],
        _count: { id: true },
      });
    });

    it('should handle large datasets efficiently', async () => {
      // Mock a large dataset
      const largeMockData = Array.from({ length: 365 }, (_, index) => ({
        createdAt: new Date(`2024-01-01T00:00:00Z`),
        _count: { id: Math.floor(Math.random() * 100) + 1 },
      }));

      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue(largeMockData);

      const response = await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(365);
    });

    it('should not accept query parameters (stateless endpoint)', async () => {
      (prisma.chatLog.groupBy as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          limit: '10',
        });

      expect(response.status).toBe(200);
      
      // Should not use query parameters
      expect(prisma.chatLog.groupBy).toHaveBeenCalledWith({
        by: ['createdAt'],
        _count: { id: true },
      });
    });
  });

  describe('Authentication and authorization', () => {
    it('should require authentication for chat logs endpoint', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/admin/chat-logs');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should require authentication for report endpoint', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/admin/report/chat-logs');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should require admin permissions for chat logs endpoint', async () => {
      (adminMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(403).json({ error: 'Admin access required' });
      });

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Admin access required' });
    });

    it('should require admin permissions for report endpoint', async () => {
      (adminMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(403).json({ error: 'Admin access required' });
      });

      const response = await request(app)
        .get('/api/admin/report/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Admin access required' });
    });

    it('should apply middleware in correct order', async () => {
      const middlewareOrder: string[] = [];

      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        middlewareOrder.push('auth');
        req.user = { ...adminUser, organization: testOrganization };
        next();
      });

      (adminMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        middlewareOrder.push('admin');
        next();
      });

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(middlewareOrder).toEqual(['auth', 'admin']);
    });

    it('should not proceed if auth middleware fails', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Token expired' });
      });

      // Admin middleware should not be called
      const adminMiddlewareSpy = jest.fn();
      (adminMiddleware as jest.Mock).mockImplementation(adminMiddlewareSpy);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(401);
      expect(adminMiddlewareSpy).not.toHaveBeenCalled();
      expect(prisma.chatLog.findMany).not.toHaveBeenCalled();
    });

    it('should not proceed if admin middleware fails', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { ...testUser, organization: testOrganization }; // Non-admin user
        next();
      });

      (adminMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(403).json({ error: 'Insufficient permissions' });
      });

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(403);
      expect(prisma.chatLog.findMany).not.toHaveBeenCalled();
    });
  });

  describe('Performance and scalability', () => {
    it('should handle concurrent requests efficiently', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockChatLogs);

      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/admin/chat-logs')
          .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
      });

      expect(prisma.chatLog.findMany).toHaveBeenCalledTimes(10);
    });

    it('should handle memory-intensive operations for large datasets', async () => {
      // Simulate a large dataset
      const largeChatLogs = Array.from({ length: 10000 }, (_, index) => ({
        id: `chat-log-${index}`,
        question: `Question ${index}`,
        answer: `Answer ${index}`,
        sessionId: `session-${index}`,
        organizationId: testOrganization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: `user-${index}`,
          email: `user${index}@example.com`,
        },
      }));

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(largeChatLogs);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(10000);
    });
  });

  describe('Data integrity and validation', () => {
    it('should handle malformed date objects in chat logs', async () => {
      const malformedLogs = [
        {
          ...mockChatLogs[0],
          createdAt: 'invalid-date',
          updatedAt: null,
        },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(malformedLogs);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body[0].createdAt).toBe('invalid-date');
      expect(response.body[0].updatedAt).toBeNull();
    });

    it('should handle null or undefined values in chat logs', async () => {
      const logsWithNulls = [
        {
          id: 'chat-log-null',
          question: null,
          answer: undefined,
          sessionId: 'session-null',
          organizationId: testOrganization.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: null,
        },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(logsWithNulls);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body[0].question).toBeNull();
      expect(response.body[0].user).toBeNull();
    });

    it('should preserve data types in JSON serialization', async () => {
      const logsWithVariousTypes = [
        {
          id: 'chat-log-types',
          question: 'What is the meaning of life?',
          answer: '42',
          sessionId: 'session-types',
          organizationId: testOrganization.id,
          metadata: {
            score: 0.95,
            isRelevant: true,
            tags: ['philosophy', 'humor'],
            timestamp: 1642694400000,
          },
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z'),
          user: {
            id: testUser.id,
            email: testUser.email,
          },
        },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(logsWithVariousTypes);

      const response = await request(app)
        .get('/api/admin/chat-logs')
        .set('Authorization', `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(typeof response.body[0].id).toBe('string');
      expect(typeof response.body[0].metadata?.score).toBe('number');
      expect(typeof response.body[0].metadata?.isRelevant).toBe('boolean');
      expect(Array.isArray(response.body[0].metadata?.tags)).toBe(true);
    });
  });
});