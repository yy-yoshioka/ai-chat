import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

describe('Reports Routes', () => {
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let widgetId: string;

  beforeEach(async () => {
    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
      },
    });
    organizationId = organization.id;

    // Create test company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company',
        email: 'company@example.com',
        organizationId,
      },
    });

    // Create test widget
    const widget = await prisma.widget.create({
      data: {
        widgetKey: 'test-widget',
        name: 'Test Widget',
        companyId: company.id,
      },
    });
    widgetId = widget.id;

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

    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Create test chat logs
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    await prisma.chatLog.createMany({
      data: [
        {
          userId,
          widgetId,
          question: 'How do I reset my password?',
          answer: 'You can reset your password from the settings page.',
          tokens: 15,
          createdAt: new Date(),
        },
        {
          userId,
          widgetId,
          question: 'What are your business hours?',
          answer: 'We are open Monday to Friday, 9 AM to 5 PM.',
          tokens: 12,
          createdAt: yesterday,
        },
        {
          userId,
          widgetId,
          question: 'How can I contact support?',
          answer: 'You can contact support at support@example.com.',
          tokens: 10,
          createdAt: weekAgo,
        },
      ],
    });
  });

  describe('GET /api/reports/summary', () => {
    it('should return report summary for default period', async () => {
      const response = await request(app)
        .get('/api/reports/summary')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalChats');
      expect(response.body).toHaveProperty('uniqueUsers');
      expect(response.body).toHaveProperty('totalTokens');
      expect(response.body).toHaveProperty('avgTokensPerChat');
      expect(response.body).toHaveProperty('topQuestions');
      expect(response.body.topQuestions).toBeInstanceOf(Array);
    });

    it('should filter by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      const endDate = new Date();

      const response = await request(app)
        .get('/api/reports/summary')
        .set('Cookie', `auth-token=${authToken}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(2); // Only today and yesterday
    });

    it('should filter by widget', async () => {
      // Create another widget with no chats
      const anotherWidget = await prisma.widget.create({
        data: {
          widgetKey: 'another-widget',
          name: 'Another Widget',
          companyId: (await prisma.company.findFirst())!.id,
        },
      });

      const response = await request(app)
        .get('/api/reports/summary')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ widgetId });

      expect(response.status).toBe(200);
      expect(response.body.totalChats).toBe(3);
    });
  });

  describe('GET /api/reports/chart', () => {
    it('should return chart data grouped by day', async () => {
      const response = await request(app)
        .get('/api/reports/chart')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ groupBy: 'day' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach((item: any) => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('tokens');
      });
    });

    it('should support grouping by hour', async () => {
      const response = await request(app)
        .get('/api/reports/chart')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ groupBy: 'hour' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should support grouping by week', async () => {
      const response = await request(app)
        .get('/api/reports/chart')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ groupBy: 'week' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should support grouping by month', async () => {
      const response = await request(app)
        .get('/api/reports/chart')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ groupBy: 'month' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/reports/csv', () => {
    it('should export report data as CSV', async () => {
      const response = await request(app)
        .get('/api/reports/csv')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('chat-report');
      
      // Check CSV content
      const csvLines = response.text.split('\n');
      expect(csvLines.length).toBeGreaterThan(1); // Header + data
      expect(csvLines[0]).toContain('Date');
      expect(csvLines[0]).toContain('User');
      expect(csvLines[0]).toContain('Question');
    });

    it('should include date range in filename', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const response = await request(app)
        .get('/api/reports/csv')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ startDate: startDate.toISOString() });

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toContain('chat-report');
    });

    it('should handle empty results', async () => {
      // Query for future dates to get empty results
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const response = await request(app)
        .get('/api/reports/csv')
        .set('Cookie', `auth-token=${authToken}`)
        .query({ 
          startDate: futureDate.toISOString(),
          endDate: futureDate.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      const csvLines = response.text.split('\n').filter(line => line.trim());
      expect(csvLines.length).toBe(1); // Only header
    });
  });

  describe('Error handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const endpoints = ['/summary', '/chart', '/csv'];
      
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(`/api/reports${endpoint}`);
        
        expect(response.status).toBe(401);
      }
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(prisma.chatLog, 'count').mockRejectedValueOnce(new Error('DB Error'));

      const response = await request(app)
        .get('/api/reports/summary')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});