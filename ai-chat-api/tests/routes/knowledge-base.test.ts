import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import knowledgeBaseRouter from '../../src/routes/knowledge-base';
import { authMiddleware } from '../../src/middleware/auth';
import { requireOrganizationAccess } from '../../src/middleware/organizationAccess';
import {
  testUser,
  testWidget,
  testKnowledgeBaseItem,
  mockAuthToken,
  mockPrismaKnowledgeBase,
  mockPrismaWidget,
} from '../fixtures/test-data';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('../../src/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

// Mock middleware
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/organizationAccess');

// Mock AWS S3
jest.mock('@aws-sdk/client-s3');

// Mock job queues
jest.mock('../../src/jobs/knowledgeBaseQueue', () => ({
  knowledgeBaseQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-123' }),
  },
}));

describe('Knowledge Base Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/knowledge-base', knowledgeBaseRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });

    (requireOrganizationAccess as jest.Mock).mockImplementation(
      (req, res, next) => {
        req.organizationId = testUser.organizationId;
        next();
      }
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/knowledge-base/items', () => {
    it('should return knowledge base items for a widget', async () => {
      // Setup mock data
      prismaMock.knowledgeBaseItem.findMany.mockResolvedValue([
        testKnowledgeBaseItem,
      ]);
      prismaMock.knowledgeBaseItem.count.mockResolvedValue(1);
      prismaMock.widget.findUnique.mockResolvedValue(testWidget);

      const response = await request(app)
        .get('/api/knowledge-base/items')
        .set('Authorization', mockAuthToken)
        .query({ widgetId: 'widget-test-123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [testKnowledgeBaseItem],
        total: 1,
        page: 1,
        limit: 20,
      });

      expect(prismaMock.widget.findUnique).toHaveBeenCalledWith({
        where: { id: 'widget-test-123' },
        include: { company: true },
      });

      expect(prismaMock.knowledgeBaseItem.findMany).toHaveBeenCalledWith({
        where: { widgetId: 'widget-test-123' },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return 403 when accessing widget from different organization', async () => {
      prismaMock.widget.findUnique.mockResolvedValue({
        ...testWidget,
        company: { ...testWidget, organizationId: 'different-org' },
      } as any);

      const response = await request(app)
        .get('/api/knowledge-base/items')
        .set('Authorization', mockAuthToken)
        .query({ widgetId: 'widget-test-123' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied to this widget',
      });
    });

    it('should return 401 when not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/knowledge-base/items')
        .query({ widgetId: 'widget-test-123' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/knowledge-base/upload', () => {
    it('should upload a file successfully', async () => {
      prismaMock.widget.findUnique.mockResolvedValue({
        ...testWidget,
        company: { ...testWidget, organizationId: testUser.organizationId },
      } as any);

      prismaMock.knowledgeBaseItem.create.mockResolvedValue({
        ...testKnowledgeBaseItem,
        status: 'processing',
      });

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set('Authorization', mockAuthToken)
        .field('widgetId', 'widget-test-123')
        .field('description', 'Test upload')
        .attach('file', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        status: 'processing',
        fileName: 'test.pdf',
      });
    });

    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set('Authorization', mockAuthToken)
        .field('widgetId', 'widget-test-123')
        .attach('file', Buffer.from('test content'), 'test.exe');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.',
      });
    });

    it('should reject files over size limit', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set('Authorization', mockAuthToken)
        .field('widgetId', 'widget-test-123')
        .attach('file', largeBuffer, 'large.pdf');

      expect(response.status).toBe(413);
    });
  });

  describe('DELETE /api/knowledge-base/items/:id', () => {
    it('should delete a knowledge base item', async () => {
      prismaMock.knowledgeBaseItem.findUnique.mockResolvedValue({
        ...testKnowledgeBaseItem,
        widget: {
          ...testWidget,
          company: { ...testWidget, organizationId: testUser.organizationId },
        },
      } as any);

      prismaMock.knowledgeBaseItem.delete.mockResolvedValue(
        testKnowledgeBaseItem
      );

      const response = await request(app)
        .delete('/api/knowledge-base/items/kb-test-123')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      expect(prismaMock.knowledgeBaseItem.delete).toHaveBeenCalledWith({
        where: { id: 'kb-test-123' },
      });
    });

    it('should return 404 for non-existent item', async () => {
      prismaMock.knowledgeBaseItem.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/knowledge-base/items/non-existent')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Knowledge base item not found',
      });
    });

    it('should return 403 when trying to delete item from different organization', async () => {
      prismaMock.knowledgeBaseItem.findUnique.mockResolvedValue({
        ...testKnowledgeBaseItem,
        widget: {
          ...testWidget,
          company: { ...testWidget, organizationId: 'different-org' },
        },
      } as any);

      const response = await request(app)
        .delete('/api/knowledge-base/items/kb-test-123')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied to this knowledge base item',
      });
    });
  });
});
