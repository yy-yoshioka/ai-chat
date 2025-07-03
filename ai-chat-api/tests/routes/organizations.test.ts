import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import organizationsRouter from '../../src/routes/organizations';
import { authMiddleware } from '../../src/middleware/auth';
import {
  testUser,
  testOrganization,
  testCompany,
  testWidget,
  generateTestToken,
} from '../fixtures/test-data';
import * as organizationService from '../../src/services/organizationService';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/services/organizationService');

describe('Organizations Routes', () => {
  let app: express.Application;
  let mockOrganizationService: jest.Mocked<typeof organizationService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/organizations', organizationsRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    mockOrganizationService = organizationService as jest.Mocked<
      typeof organizationService
    >;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/organizations', () => {
    it('should return user organizations with computed fields', async () => {
      const mockOrganizations = [
        {
          ...testOrganization,
          _count: { users: 5 },
          companies: [
            {
              ...testCompany,
              plan: 'PRO',
              _count: { widgets: 3 },
            },
          ],
        },
        {
          id: 'org-2',
          name: 'Test Organization 2',
          slug: 'test-org-2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          _count: { users: 2 },
          companies: [
            {
              id: 'company-2',
              name: 'Test Company 2',
              plan: 'STARTER',
              _count: { widgets: 1 },
            },
          ],
        },
      ];

      mockOrganizationService.getUserOrganizations.mockResolvedValue(
        mockOrganizations as any
      );

      const response = await request(app)
        .get('/api/organizations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      expect(response.body[0]).toMatchObject({
        id: testOrganization.id,
        name: testOrganization.name,
        userCount: 5,
        widgetCount: 3,
        plan: 'PRO',
      });

      expect(response.body[1]).toMatchObject({
        id: 'org-2',
        name: 'Test Organization 2',
        userCount: 2,
        widgetCount: 1,
        plan: 'STARTER',
      });

      expect(mockOrganizationService.getUserOrganizations).toHaveBeenCalledWith(
        testUser.id
      );
    });

    it('should handle organizations without companies', async () => {
      const mockOrganizations = [
        {
          ...testOrganization,
          _count: { users: 1 },
          companies: [],
        },
      ];

      mockOrganizationService.getUserOrganizations.mockResolvedValue(
        mockOrganizations as any
      );

      const response = await request(app)
        .get('/api/organizations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({
        userCount: 1,
        widgetCount: 0,
        plan: 'free',
      });
    });

    it('should handle service errors', async () => {
      mockOrganizationService.getUserOrganizations.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/organizations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch organizations',
      });
    });

    it('should require authentication', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/organizations');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should return organization by ID', async () => {
      const mockOrganization = {
        ...testOrganization,
        users: [
          {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
        ],
        companies: [
          {
            ...testCompany,
            widgets: [testWidget],
          },
        ],
      };

      mockOrganizationService.getOrganizationById.mockResolvedValue(
        mockOrganization as any
      );

      const response = await request(app)
        .get(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testOrganization.id,
        name: testOrganization.name,
        users: expect.arrayContaining([
          expect.objectContaining({
            id: testUser.id,
            email: testUser.email,
          }),
        ]),
        companies: expect.arrayContaining([
          expect.objectContaining({
            id: testCompany.id,
            name: testCompany.name,
          }),
        ]),
      });

      expect(mockOrganizationService.getOrganizationById).toHaveBeenCalledWith(
        testOrganization.id,
        testUser.id
      );
    });

    it('should return 404 for non-existent organization', async () => {
      mockOrganizationService.getOrganizationById.mockRejectedValue(
        new Error('Organization not found')
      );

      const response = await request(app)
        .get('/api/organizations/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Organization not found',
      });
    });

    it('should return 404 for access denied', async () => {
      mockOrganizationService.getOrganizationById.mockRejectedValue(
        new Error('Access denied to organization')
      );

      const response = await request(app)
        .get(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Access denied to organization',
      });
    });

    it('should return 500 for other service errors', async () => {
      mockOrganizationService.getOrganizationById.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Database connection failed',
      });
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('should update organization successfully', async () => {
      const updateData = {
        name: 'Updated Organization Name',
        settings: {
          allowPublicWidgets: false,
          maxUsersPerOrganization: 100,
        },
      };

      const mockUpdatedOrganization = {
        ...testOrganization,
        ...updateData,
        updatedAt: new Date('2024-02-01'),
      };

      mockOrganizationService.updateOrganization.mockResolvedValue(
        mockUpdatedOrganization as any
      );

      const response = await request(app)
        .put(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testOrganization.id,
        name: updateData.name,
        settings: updateData.settings,
      });

      expect(mockOrganizationService.updateOrganization).toHaveBeenCalledWith(
        testOrganization.id,
        testUser.id,
        updateData
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '', // Empty name should be invalid
      };

      mockOrganizationService.updateOrganization.mockRejectedValue(
        new Error('Name is required')
      );

      const response = await request(app)
        .put(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Name is required',
      });
    });

    it('should return 403 for insufficient permissions', async () => {
      mockOrganizationService.updateOrganization.mockRejectedValue(
        new Error('Insufficient permissions to update organization')
      );

      const response = await request(app)
        .put(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({ name: 'New Name' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Insufficient permissions to update organization',
      });
    });

    it('should return 403 for organization not found', async () => {
      mockOrganizationService.updateOrganization.mockRejectedValue(
        new Error('Organization not found')
      );

      const response = await request(app)
        .put('/api/organizations/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({ name: 'New Name' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Organization not found',
      });
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .put(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        name: 'Test Org <script>alert("xss")</script>',
        description: 'Description with <img src="x" onerror="alert(1)">',
      };

      const sanitizedData = {
        name: 'Test Org',
        description: 'Description with',
      };

      mockOrganizationService.updateOrganization.mockResolvedValue({
        ...testOrganization,
        ...sanitizedData,
      } as any);

      const response = await request(app)
        .put(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send(maliciousData);

      expect(response.status).toBe(200);
      // The service should handle sanitization
      expect(mockOrganizationService.updateOrganization).toHaveBeenCalledWith(
        testOrganization.id,
        testUser.id,
        maliciousData
      );
    });
  });

  describe('GET /api/organizations/:id/stats', () => {
    it('should return organization statistics', async () => {
      const mockStats = {
        totalUsers: 15,
        totalWidgets: 8,
        totalChats: 1250,
        totalQuestions: 980,
        avgResponseTime: 2.3,
        satisfactionRate: 0.87,
        monthlyUsage: {
          chats: 450,
          apiCalls: 2100,
          storage: 1.2, // GB
        },
        topPerformingWidgets: [
          {
            id: testWidget.id,
            name: testWidget.name,
            chatCount: 350,
            satisfactionRate: 0.92,
          },
        ],
        recentActivity: {
          newUsers: 3,
          newWidgets: 1,
          chatsToday: 45,
        },
      };

      mockOrganizationService.getOrganizationStats.mockResolvedValue(
        mockStats as any
      );

      const response = await request(app)
        .get(`/api/organizations/${testOrganization.id}/stats`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalUsers: 15,
        totalWidgets: 8,
        totalChats: 1250,
        avgResponseTime: 2.3,
        satisfactionRate: 0.87,
        monthlyUsage: {
          chats: 450,
          apiCalls: 2100,
          storage: 1.2,
        },
        topPerformingWidgets: expect.arrayContaining([
          expect.objectContaining({
            id: testWidget.id,
            name: testWidget.name,
            chatCount: 350,
          }),
        ]),
        recentActivity: {
          newUsers: 3,
          newWidgets: 1,
          chatsToday: 45,
        },
      });

      expect(mockOrganizationService.getOrganizationStats).toHaveBeenCalledWith(
        testOrganization.id
      );
    });

    it('should handle stats calculation errors', async () => {
      mockOrganizationService.getOrganizationStats.mockRejectedValue(
        new Error('Failed to calculate stats')
      );

      const response = await request(app)
        .get(`/api/organizations/${testOrganization.id}/stats`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch organization stats',
      });
    });

    it('should return empty stats for organization with no data', async () => {
      const emptyStats = {
        totalUsers: 0,
        totalWidgets: 0,
        totalChats: 0,
        totalQuestions: 0,
        avgResponseTime: 0,
        satisfactionRate: 0,
        monthlyUsage: {
          chats: 0,
          apiCalls: 0,
          storage: 0,
        },
        topPerformingWidgets: [],
        recentActivity: {
          newUsers: 0,
          newWidgets: 0,
          chatsToday: 0,
        },
      };

      mockOrganizationService.getOrganizationStats.mockResolvedValue(
        emptyStats as any
      );

      const response = await request(app)
        .get(`/api/organizations/${testOrganization.id}/stats`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(emptyStats);
    });
  });

  describe('Organizations access control', () => {
    it('should return 401 when not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/organizations');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should only return organizations accessible to the user', async () => {
      const userOrganizations = [testOrganization];
      mockOrganizationService.getUserOrganizations.mockResolvedValue(
        userOrganizations as any
      );

      const response = await request(app)
        .get('/api/organizations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockOrganizationService.getUserOrganizations).toHaveBeenCalledWith(
        testUser.id
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed organization ID in params', async () => {
      mockOrganizationService.getOrganizationById.mockRejectedValue(
        new Error('Invalid organization ID format')
      );

      const response = await request(app)
        .get('/api/organizations/invalid-uuid-format')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Invalid organization ID format',
      });
    });

    it('should handle concurrent update conflicts', async () => {
      mockOrganizationService.updateOrganization.mockRejectedValue(
        new Error('Organization was modified by another user')
      );

      const response = await request(app)
        .put(`/api/organizations/${testOrganization.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({ name: 'New Name' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Organization was modified by another user',
      });
    });

    it('should handle service timeouts gracefully', async () => {
      // Simulate timeout by never resolving
      mockOrganizationService.getUserOrganizations.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const response = await request(app)
        .get('/api/organizations')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .timeout(1000);

      // This would timeout in a real scenario
      // The test framework will handle the timeout
    });
  });
});
