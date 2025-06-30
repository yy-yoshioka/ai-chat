import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

describe('Dashboard Routes', () => {
  let authToken: string;
  let userId: string;
  let organizationId: string;

  beforeEach(async () => {
    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
      },
    });
    organizationId = organization.id;

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        roles: [Role.org_admin],
        organizationId,
      },
    });
    userId = user.id;

    // Generate auth token
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Create test data
    await prisma.chatLog.createMany({
      data: [
        {
          userId,
          question: 'Test question 1',
          answer: 'Test answer 1',
          tokens: 10,
        },
        {
          userId,
          question: 'Test question 2',
          answer: 'Test answer 2',
          tokens: 20,
        },
      ],
    });
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard metrics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalChats', 2);
      expect(response.body).toHaveProperty('activeUsers', 1);
      expect(response.body).toHaveProperty('avgResponseTime');
      expect(response.body).toHaveProperty('errorRate');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Cookie', 'auth-token=invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should handle database errors gracefully', async () => {
      // Mock prisma to throw error
      jest.spyOn(prisma.chatLog, 'count').mockRejectedValueOnce(new Error('DB Error'));

      const response = await request(app)
        .get('/api/dashboard')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch dashboard data');
    });
  });
});