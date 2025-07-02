import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import dashboardRouter from '../../src/routes/dashboard';
import { authMiddleware } from '../../src/middleware/auth';
import { metricsMiddleware } from '../../src/middleware/metrics';
import { 
  testUser, 
  testOrganization,
  generateTestToken
} from '../fixtures/test-data';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/metrics');

describe('Dashboard Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    (metricsMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard metrics successfully', async () => {
      const mockTotalChats = 1250;
      const mockActiveUsers = 45;
      const mockRecentChats = [
        { createdAt: new Date('2024-01-15T10:00:00Z') },
        { createdAt: new Date('2024-01-15T11:30:00Z') },
        { createdAt: new Date('2024-01-15T14:15:00Z') },
      ];

      // Mock Prisma queries
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(mockTotalChats);
      (prisma.user.count as jest.Mock).mockResolvedValue(mockActiveUsers);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockRecentChats);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalChats: mockTotalChats,
        activeUsers: mockActiveUsers,
        avgResponseTime: 250, // Hardcoded value
        errorRate: 0.02, // Hardcoded value
        timestamp: expect.any(String),
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(new Date(response.body.timestamp).getTime()).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
    });

    it('should query total chats count correctly', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(prisma.chatLog.count).toHaveBeenCalledWith();
    });

    it('should query active users in last 24 hours correctly', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: {
          chatLogs: {
            some: {
              createdAt: {
                gte: expect.any(Date),
              },
            },
          },
        },
      });

      // Verify the date is approximately 24 hours ago (within 1 minute tolerance)
      const callArgs = (prisma.user.count as jest.Mock).mock.calls[0][0];
      const actualDate = callArgs.where.chatLogs.some.createdAt.gte;
      const timeDiff = Math.abs(actualDate.getTime() - twentyFourHoursAgo.getTime());
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute difference
    });

    it('should query recent chats in last 24 hours correctly', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
        select: {
          createdAt: true,
        },
      });

      // Verify only createdAt is selected for privacy and performance
      const callArgs = (prisma.chatLog.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.select).toEqual({ createdAt: true });
    });

    it('should execute all queries in parallel for performance', async () => {
      const countDelay = 100;
      const userCountDelay = 150;
      const findManyDelay = 120;

      (prisma.chatLog.count as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(100), countDelay))
      );
      (prisma.user.count as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(10), userCountDelay))
      );
      (prisma.chatLog.findMany as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), findManyDelay))
      );

      const startTime = Date.now();
      
      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should take roughly the time of the longest query (not the sum of all)
      expect(totalTime).toBeLessThan(countDelay + userCountDelay + findManyDelay);
      expect(totalTime).toBeGreaterThan(Math.max(countDelay, userCountDelay, findManyDelay) - 50);
    });

    it('should return hardcoded avgResponseTime and errorRate', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.body.avgResponseTime).toBe(250);
      expect(response.body.errorRate).toBe(0.02);
    });

    it('should round avgResponseTime and errorRate appropriately', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      // avgResponseTime should be rounded to nearest integer
      expect(Number.isInteger(response.body.avgResponseTime)).toBe(true);
      
      // errorRate should be rounded to 3 decimal places
      expect(response.body.errorRate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
    });

    it('should handle zero values gracefully', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalChats: 0,
        activeUsers: 0,
        avgResponseTime: 250,
        errorRate: 0.02,
        timestamp: expect.any(String),
      });
    });

    it('should handle large numbers correctly', async () => {
      const largeChatCount = 999999;
      const largeUserCount = 50000;

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(largeChatCount);
      (prisma.user.count as jest.Mock).mockResolvedValue(largeUserCount);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(largeChatCount);
      expect(response.body.activeUsers).toBe(largeUserCount);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.chatLog.count as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch dashboard data',
      });
    });

    it('should handle partial database failures gracefully', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockRejectedValue(new Error('User query failed'));
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch dashboard data',
      });
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Database connection failed');

      (prisma.chatLog.count as jest.Mock).mockRejectedValue(mockError);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Dashboard error:', mockError);

      consoleErrorSpy.mockRestore();
    });

    it('should handle null/undefined responses from database', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(null);
      (prisma.user.count as jest.Mock).mockResolvedValue(undefined);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalChats: null,
        activeUsers: undefined,
        avgResponseTime: 250,
        errorRate: 0.02,
        timestamp: expect.any(String),
      });
    });

    it('should handle empty recent chats array', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(100);
      expect(response.body.activeUsers).toBe(10);
    });

    it('should handle recent chats with various timestamps', async () => {
      const recentChats = [
        { createdAt: new Date('2024-01-15T23:59:59Z') },
        { createdAt: new Date('2024-01-15T12:00:00Z') },
        { createdAt: new Date('2024-01-15T00:00:01Z') },
      ];

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(recentChats);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(100);
      expect(response.body.activeUsers).toBe(10);
    });
  });

  describe('Authentication and authorization', () => {
    it('should require authentication', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should not require admin permissions', async () => {
      // Regular user should be able to access dashboard
      const regularUser = { ...testUser, roles: ['user'] };
      
      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { ...regularUser, organization: testOrganization };
        next();
      });

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(regularUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
    });

    it('should apply metrics middleware', async () => {
      const metricsMiddlewareSpy = jest.fn((req, res, next) => next());
      (metricsMiddleware as jest.Mock).mockImplementation(metricsMiddlewareSpy);

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(metricsMiddlewareSpy).toHaveBeenCalled();
    });

    it('should apply middleware in correct order', async () => {
      const middlewareOrder: string[] = [];

      (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        middlewareOrder.push('auth');
        req.user = { ...testUser, organization: testOrganization };
        next();
      });

      (metricsMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        middlewareOrder.push('metrics');
        next();
      });

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(middlewareOrder).toEqual(['auth', 'metrics']);
    });

    it('should not proceed if auth middleware fails', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Token expired' });
      });

      const metricsMiddlewareSpy = jest.fn();
      (metricsMiddleware as jest.Mock).mockImplementation(metricsMiddlewareSpy);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(401);
      expect(metricsMiddlewareSpy).not.toHaveBeenCalled();
      expect(prisma.chatLog.count).not.toHaveBeenCalled();
    });
  });

  describe('Performance considerations', () => {
    it('should handle concurrent requests efficiently', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.totalChats).toBe(100);
      });

      expect(prisma.chatLog.count).toHaveBeenCalledTimes(10);
    });

    it('should not fetch unnecessary data for performance', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      // Verify that only createdAt is selected from recent chats
      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        select: { createdAt: true },
      });

      // Verify that we don't fetch full chat log data
      const callArgs = (prisma.chatLog.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.select).not.toHaveProperty('question');
      expect(callArgs.select).not.toHaveProperty('answer');
      expect(callArgs.select).not.toHaveProperty('user');
    });

    it('should handle timeout scenarios gracefully', async () => {
      // Mock a very slow database response
      (prisma.chatLog.count as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .timeout(1000);

      // The request should timeout, which supertest handles appropriately
      // In a real scenario, you might want to implement request timeouts in the route handler
    });
  });

  describe('Data accuracy and consistency', () => {
    it('should use consistent 24-hour time window across queries', async () => {
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      // Both user.count and chatLog.findMany should use the same time threshold
      const userCountCall = (prisma.user.count as jest.Mock).mock.calls[0][0];
      const chatLogFindCall = (prisma.chatLog.findMany as jest.Mock).mock.calls[0][0];

      const userDate = userCountCall.where.chatLogs.some.createdAt.gte;
      const chatDate = chatLogFindCall.where.createdAt.gte;

      // Dates should be very close (within 1 second due to execution time)
      const timeDiff = Math.abs(userDate.getTime() - chatDate.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    it('should handle edge case of exactly 24 hours ago', async () => {
      const exactlyTwentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([
        { createdAt: exactlyTwentyFourHoursAgo }
      ]);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(100);
    });

    it('should maintain data consistency across parallel queries', async () => {
      let callCount = 0;
      const mockData = [150, 25, []]; // totalChats, activeUsers, recentChats

      (prisma.chatLog.count as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockData[0]);
      });

      (prisma.user.count as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockData[1]);
      });

      (prisma.chatLog.findMany as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockData[2]);
      });

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(150);
      expect(response.body.activeUsers).toBe(25);
    });
  });
});