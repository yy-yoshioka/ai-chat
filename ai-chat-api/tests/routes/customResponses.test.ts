import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import {
  generateTestToken,
  createTestOrganization,
  createTestUser,
} from '../fixtures/test-data';
import { ResponseType } from '@prisma/client';

describe('Custom Responses API', () => {
  let authToken: string;
  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and organization
    const user = await createTestUser();
    userId = user.id;

    const org = await createTestOrganization(userId);
    organizationId = org.id;

    // Generate auth token
    authToken = generateTestToken({
      id: userId,
      email: user.email,
      organizationId: organizationId,
      roles: ['owner'],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.customResponse.deleteMany({
      where: { organizationId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });
    await prisma.organization.delete({
      where: { id: organizationId },
    });
  });

  describe('POST /api/custom-responses', () => {
    it('should create a new custom response', async () => {
      const response = await request(app)
        .post('/api/custom-responses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Greeting',
          type: ResponseType.GREETING,
          content: 'Hello {{widgetName}}! Welcome to our service.',
          priority: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Test Greeting',
        type: ResponseType.GREETING,
        content: 'Hello {{widgetName}}! Welcome to our service.',
        priority: 10,
        isActive: true,
      });
    });

    it('should reject invalid response type', async () => {
      const response = await request(app)
        .post('/api/custom-responses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Response',
          type: 'INVALID_TYPE',
          content: 'Test content',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/custom-responses', () => {
    beforeEach(async () => {
      // Create test responses
      await prisma.customResponse.createMany({
        data: [
          {
            organizationId,
            name: 'Active Greeting',
            type: ResponseType.GREETING,
            content: 'Hello!',
            isActive: true,
            priority: 5,
          },
          {
            organizationId,
            name: 'Inactive Greeting',
            type: ResponseType.GREETING,
            content: 'Hi!',
            isActive: false,
            priority: 3,
          },
          {
            organizationId,
            name: 'Error Response',
            type: ResponseType.ERROR,
            content: 'An error occurred',
            isActive: true,
            priority: 1,
          },
        ],
      });
    });

    it('should list all custom responses', async () => {
      const response = await request(app)
        .get('/api/custom-responses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/custom-responses?type=GREETING')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(
        response.body.every((r: any) => r.type === ResponseType.GREETING)
      ).toBe(true);
    });

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/custom-responses?isActive=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.every((r: any) => r.isActive)).toBe(true);
    });
  });

  describe('PUT /api/custom-responses/:id', () => {
    let responseId: string;

    beforeEach(async () => {
      const customResponse = await prisma.customResponse.create({
        data: {
          organizationId,
          name: 'Update Test',
          type: ResponseType.FALLBACK,
          content: 'Original content',
          priority: 5,
        },
      });
      responseId = customResponse.id;
    });

    it('should update a custom response', async () => {
      const response = await request(app)
        .put(`/api/custom-responses/${responseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
          priority: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated content');
      expect(response.body.priority).toBe(10);
    });

    it('should return 404 for non-existent response', async () => {
      const response = await request(app)
        .put('/api/custom-responses/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/custom-responses/:id', () => {
    let responseId: string;

    beforeEach(async () => {
      const customResponse = await prisma.customResponse.create({
        data: {
          organizationId,
          name: 'Delete Test',
          type: ResponseType.ERROR,
          content: 'To be deleted',
        },
      });
      responseId = customResponse.id;
    });

    it('should delete a custom response', async () => {
      const response = await request(app)
        .delete(`/api/custom-responses/${responseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const deleted = await prisma.customResponse.findUnique({
        where: { id: responseId },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('POST /api/custom-responses/defaults/create', () => {
    it('should create default responses for organization', async () => {
      const response = await request(app)
        .post('/api/custom-responses/defaults/create')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Default responses created');

      // Verify defaults were created
      const defaults = await prisma.customResponse.findMany({
        where: {
          organizationId,
          name: { contains: 'Default' },
        },
      });

      expect(defaults.length).toBeGreaterThan(0);
      expect(defaults.some((d) => d.type === ResponseType.GREETING)).toBe(true);
      expect(defaults.some((d) => d.type === ResponseType.FALLBACK)).toBe(true);
      expect(defaults.some((d) => d.type === ResponseType.ERROR)).toBe(true);
    });
  });
});
