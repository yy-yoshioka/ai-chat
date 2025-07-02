import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import knowledgeBaseRouter from '../../src/routes/knowledge-base';
import { authMiddleware } from '../../src/middleware/auth';
import {
  testUser,
  testOrganization,
  testWidget,
  testKnowledgeBase,
  generateTestToken,
  mockFile,
} from '../fixtures/test-data';
import { S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('@aws-sdk/client-s3');
jest.mock('multer');

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [
          {
            embedding: new Array(1536).fill(0.1),
          },
        ],
      }),
    },
  })),
}));

// Mock Qdrant
jest.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: jest.fn().mockImplementation(() => ({
    createCollection: jest.fn().mockResolvedValue(true),
    getCollection: jest.fn().mockResolvedValue({ status: 'green' }),
    upsert: jest.fn().mockResolvedValue({ operation_id: 1 }),
    search: jest.fn().mockResolvedValue({
      result: [
        {
          id: 'vec-1',
          score: 0.95,
          payload: {
            content: 'Test content',
            metadata: { title: 'Test Document' },
          },
        },
      ],
    }),
    delete: jest.fn().mockResolvedValue({ operation_id: 1 }),
  })),
}));

// Mock PDF parser
jest.mock('pdf-parse', () =>
  jest.fn().mockResolvedValue({
    text: 'This is test PDF content',
    numpages: 1,
    info: {
      Title: 'Test PDF',
      Author: 'Test Author',
    },
  })
);

// Mock cheerio for HTML parsing
jest.mock('cheerio', () => ({
  load: jest.fn().mockReturnValue({
    text: jest.fn().mockReturnValue('This is test HTML content'),
    find: jest.fn().mockReturnValue({
      text: jest.fn().mockReturnValue('Test Title'),
    }),
  }),
}));

describe('Knowledge Base Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/knowledge-base', knowledgeBaseRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/knowledge-base/upload', () => {
    it('should upload and process a PDF file', async () => {
      const mockDocument = {
        id: 'kb-new-123',
        title: 'Test PDF',
        content: 'This is test PDF content',
        url: 'https://s3.amazonaws.com/test-bucket/kb-new-123.pdf',
        sourceType: 'file',
        status: 'active',
        metadata: {
          fileType: 'pdf',
          fileSize: mockFile.size,
          pages: 1,
        },
        widgetId: 'widget-test-123',
        organizationId: testOrganization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.create as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.update as jest.Mock).mockResolvedValue({
        ...mockDocument,
        status: 'processed',
        vectorIds: ['vec-1', 'vec-2'],
      });

      // Mock S3 upload
      const mockS3Send = jest.fn().mockResolvedValue({
        Location: 'https://s3.amazonaws.com/test-bucket/kb-new-123.pdf',
      });
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockS3Send,
      }));

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .field('title', 'Test PDF')
        .attach('file', Buffer.from('test pdf content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'Document uploaded and processed successfully',
        document: expect.objectContaining({
          id: 'kb-new-123',
          title: 'Test PDF',
          status: 'processed',
        }),
      });

      expect(prisma.knowledgeBase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test PDF',
          sourceType: 'file',
          status: 'processing',
          widgetId: 'widget-test-123',
          organizationId: testOrganization.id,
        }),
      });
    });

    it('should upload and process a text file', async () => {
      const mockDocument = {
        id: 'kb-new-123',
        title: 'Test Text',
        content: 'This is test text content',
        url: 'https://s3.amazonaws.com/test-bucket/kb-new-123.txt',
        sourceType: 'file',
        status: 'active',
        metadata: {
          fileType: 'txt',
          fileSize: 100,
        },
        widgetId: 'widget-test-123',
        organizationId: testOrganization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.create as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.update as jest.Mock).mockResolvedValue({
        ...mockDocument,
        status: 'processed',
      });

      const mockS3Send = jest.fn().mockResolvedValue({
        Location: 'https://s3.amazonaws.com/test-bucket/kb-new-123.txt',
      });
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockS3Send,
      }));

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .field('title', 'Test Text')
        .attach('file', Buffer.from('This is test text content'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(201);
      expect(response.body.document.metadata.fileType).toBe('txt');
    });

    it('should return 400 for unsupported file type', async () => {
      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .attach('file', Buffer.from('binary content'), {
          filename: 'test.exe',
          contentType: 'application/octet-stream',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Unsupported file type. Supported types: PDF, TXT, MD, DOCX',
      });
    });

    it('should return 400 for file too large', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .attach('file', largeBuffer, {
          filename: 'large.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'File too large. Maximum size is 10MB',
      });
    });

    it('should return 403 for widget not owned by organization', async () => {
      const otherWidget = {
        ...testWidget,
        company: {
          ...testWidget.company,
          organizationId: 'other-org-id',
        },
      };

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(otherWidget);

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .attach('file', Buffer.from('test content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied to this widget',
      });
    });

    it('should handle file processing errors', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.create as jest.Mock).mockResolvedValue({
        id: 'kb-new-123',
        status: 'processing',
      });

      // Mock PDF parse error
      const pdfParse = require('pdf-parse');
      pdfParse.mockRejectedValueOnce(new Error('PDF parsing failed'));

      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .attach('file', Buffer.from('corrupted pdf'), {
          filename: 'corrupted.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to process document',
      });

      expect(prisma.knowledgeBase.update).toHaveBeenCalledWith({
        where: { id: 'kb-new-123' },
        data: { status: 'failed', error: 'PDF parsing failed' },
      });
    });
  });

  describe('POST /api/knowledge-base/url', () => {
    it('should scrape and process a URL', async () => {
      const mockDocument = {
        id: 'kb-new-123',
        title: 'Test Web Page',
        content: 'This is test HTML content',
        url: 'https://example.com/page',
        sourceType: 'url',
        status: 'active',
        metadata: {
          scraped: true,
          contentType: 'text/html',
        },
        widgetId: 'widget-test-123',
        organizationId: testOrganization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.knowledgeBase.create as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.update as jest.Mock).mockResolvedValue({
        ...mockDocument,
        status: 'processed',
      });

      // Mock fetch for URL scraping
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
        text: jest
          .fn()
          .mockResolvedValue(
            '<html><head><title>Test Web Page</title></head><body>This is test HTML content</body></html>'
          ),
      });

      const response = await request(app)
        .post('/api/knowledge-base/url')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          widgetId: 'widget-test-123',
          url: 'https://example.com/page',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'URL content scraped and processed successfully',
        document: expect.objectContaining({
          title: 'Test Web Page',
          url: 'https://example.com/page',
          sourceType: 'url',
        }),
      });
    });

    it('should return 409 if URL already exists for widget', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findFirst as jest.Mock).mockResolvedValue(
        testKnowledgeBase
      );

      const response = await request(app)
        .post('/api/knowledge-base/url')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          widgetId: 'widget-test-123',
          url: 'https://example.com/existing',
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'URL already exists in knowledge base',
      });
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/knowledge-base/url')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          widgetId: 'widget-test-123',
          url: 'not-a-valid-url',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid URL format',
      });
    });

    it('should handle fetch errors', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.knowledgeBase.create as jest.Mock).mockResolvedValue({
        id: 'kb-new-123',
        status: 'processing',
      });

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .post('/api/knowledge-base/url')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          widgetId: 'widget-test-123',
          url: 'https://example.com/unreachable',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to scrape URL',
      });

      expect(prisma.knowledgeBase.update).toHaveBeenCalledWith({
        where: { id: 'kb-new-123' },
        data: { status: 'failed', error: 'Network error' },
      });
    });
  });

  describe('GET /api/knowledge-base', () => {
    it('should list knowledge base documents', async () => {
      const mockDocuments = [
        {
          id: 'kb-1',
          title: 'Document 1',
          url: 'https://example.com/doc1',
          sourceType: 'file',
          status: 'active',
          widgetId: 'widget-test-123',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'kb-2',
          title: 'Document 2',
          url: 'https://example.com/doc2',
          sourceType: 'url',
          status: 'active',
          widgetId: 'widget-test-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue(
        mockDocuments
      );
      (prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/knowledge-base')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ widgetId: 'widget-test-123', page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        documents: mockDocuments,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1,
        },
      });

      expect(prisma.knowledgeBase.findMany).toHaveBeenCalledWith({
        where: { widgetId: 'widget-test-123' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        select: {
          id: true,
          title: true,
          url: true,
          sourceType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should filter by status', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/knowledge-base')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          widgetId: 'widget-test-123',
          status: 'active',
        });

      expect(response.status).toBe(200);
      expect(prisma.knowledgeBase.findMany).toHaveBeenCalledWith({
        where: {
          widgetId: 'widget-test-123',
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should filter by source type', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/knowledge-base')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          widgetId: 'widget-test-123',
          sourceType: 'file',
        });

      expect(response.status).toBe(200);
      expect(prisma.knowledgeBase.findMany).toHaveBeenCalledWith({
        where: {
          widgetId: 'widget-test-123',
          sourceType: 'file',
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should handle pagination', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(50);

      const response = await request(app)
        .get('/api/knowledge-base')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          widgetId: 'widget-test-123',
          page: 2,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        pages: 5,
      });

      expect(prisma.knowledgeBase.findMany).toHaveBeenCalledWith({
        where: { widgetId: 'widget-test-123' },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should return 403 for widget not owned by organization', async () => {
      const otherWidget = {
        ...testWidget,
        company: {
          ...testWidget.company,
          organizationId: 'other-org-id',
        },
      };

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(otherWidget);

      const response = await request(app)
        .get('/api/knowledge-base')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ widgetId: 'widget-test-123' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied to this widget',
      });
    });
  });

  describe('GET /api/knowledge-base/:id', () => {
    it('should get document details', async () => {
      const mockDocument = {
        id: 'kb-test-123',
        title: 'Test Document',
        content: 'Full document content',
        url: 'https://example.com/doc',
        sourceType: 'file',
        status: 'active',
        metadata: {
          fileType: 'pdf',
          fileSize: 1024,
          pages: 5,
        },
        widgetId: 'widget-test-123',
        widget: testWidget,
        organizationId: testOrganization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const response = await request(app)
        .get('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        document: mockDocument,
      });
    });

    it('should return 404 for non-existent document', async () => {
      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/knowledge-base/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Document not found',
      });
    });

    it('should return 403 for document not owned by organization', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: {
          ...testWidget,
          company: {
            ...testWidget.company,
            organizationId: 'other-org-id',
          },
        },
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const response = await request(app)
        .get('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied to this document',
      });
    });
  });

  describe('PUT /api/knowledge-base/:id', () => {
    it('should update document metadata', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: testWidget,
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.update as jest.Mock).mockResolvedValue({
        ...mockDocument,
        title: 'Updated Title',
        metadata: {
          ...mockDocument.metadata,
          tags: ['updated', 'test'],
        },
      });

      const response = await request(app)
        .put('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          title: 'Updated Title',
          metadata: {
            tags: ['updated', 'test'],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Document updated successfully',
        document: expect.objectContaining({
          title: 'Updated Title',
          metadata: expect.objectContaining({
            tags: ['updated', 'test'],
          }),
        }),
      });

      expect(prisma.knowledgeBase.update).toHaveBeenCalledWith({
        where: { id: 'kb-test-123' },
        data: {
          title: 'Updated Title',
          metadata: expect.any(Object),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should not allow updating protected fields', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: testWidget,
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.update as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const response = await request(app)
        .put('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          id: 'different-id',
          widgetId: 'different-widget',
          organizationId: 'different-org',
          content: 'Trying to change content',
        });

      expect(response.status).toBe(200);

      // Verify protected fields were not passed to update
      const updateCall = (prisma.knowledgeBase.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.data).not.toHaveProperty('id');
      expect(updateCall.data).not.toHaveProperty('widgetId');
      expect(updateCall.data).not.toHaveProperty('organizationId');
      expect(updateCall.data).not.toHaveProperty('content');
    });
  });

  describe('DELETE /api/knowledge-base/:id', () => {
    it('should delete document and vectors', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: testWidget,
        vectorIds: ['vec-1', 'vec-2'],
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.delete as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const QdrantClient = require('@qdrant/js-client-rest').QdrantClient;
      const mockQdrant = new QdrantClient();

      const response = await request(app)
        .delete('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Document deleted successfully',
      });

      expect(prisma.knowledgeBase.delete).toHaveBeenCalledWith({
        where: { id: 'kb-test-123' },
      });

      expect(mockQdrant.delete).toHaveBeenCalledWith('knowledge_base', {
        points: ['vec-1', 'vec-2'],
      });
    });

    it('should delete S3 file for file-based documents', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: testWidget,
        sourceType: 'file',
        url: 'https://s3.amazonaws.com/test-bucket/kb-test-123.pdf',
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.delete as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const mockS3Send = jest.fn().mockResolvedValue({});
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockS3Send,
      }));

      const response = await request(app)
        .delete('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(mockS3Send).toHaveBeenCalled();
    });

    it('should return 404 for non-existent document', async () => {
      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/knowledge-base/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Document not found',
      });
    });

    it('should return 403 for document not owned by organization', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: {
          ...testWidget,
          company: {
            ...testWidget.company,
            organizationId: 'other-org-id',
          },
        },
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const response = await request(app)
        .delete('/api/knowledge-base/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Access denied to this document',
      });
    });
  });

  describe('POST /api/knowledge-base/reprocess/:id', () => {
    it('should reprocess document vectors', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: testWidget,
        content: 'Original document content',
        vectorIds: ['old-vec-1', 'old-vec-2'],
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );
      (prisma.knowledgeBase.update as jest.Mock).mockResolvedValue({
        ...mockDocument,
        status: 'processed',
        vectorIds: ['new-vec-1', 'new-vec-2'],
        updatedAt: new Date(),
      });

      const QdrantClient = require('@qdrant/js-client-rest').QdrantClient;
      const mockQdrant = new QdrantClient();

      const response = await request(app)
        .post('/api/knowledge-base/reprocess/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Document reprocessed successfully',
        document: expect.objectContaining({
          status: 'processed',
          vectorIds: ['new-vec-1', 'new-vec-2'],
        }),
      });

      // Verify old vectors were deleted
      expect(mockQdrant.delete).toHaveBeenCalledWith('knowledge_base', {
        points: ['old-vec-1', 'old-vec-2'],
      });

      // Verify new vectors were created
      expect(mockQdrant.upsert).toHaveBeenCalled();
    });

    it('should handle reprocessing errors', async () => {
      const mockDocument = {
        ...testKnowledgeBase,
        widget: testWidget,
      };

      (prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
        mockDocument
      );

      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;
      mockOpenAI.embeddings.create.mockRejectedValueOnce(
        new Error('Embedding error')
      );

      const response = await request(app)
        .post('/api/knowledge-base/reprocess/kb-test-123')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to reprocess document',
      });

      expect(prisma.knowledgeBase.update).toHaveBeenCalledWith({
        where: { id: 'kb-test-123' },
        data: { status: 'failed', error: 'Embedding error' },
      });
    });
  });

  describe('POST /api/knowledge-base/bulk-upload', () => {
    it('should upload multiple files', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.create as jest.Mock)
        .mockResolvedValueOnce({
          id: 'kb-1',
          title: 'File 1',
          status: 'processed',
        })
        .mockResolvedValueOnce({
          id: 'kb-2',
          title: 'File 2',
          status: 'processed',
        });

      const mockS3Send = jest.fn().mockResolvedValue({
        Location: 'https://s3.amazonaws.com/test-bucket/file.pdf',
      });
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockS3Send,
      }));

      const response = await request(app)
        .post('/api/knowledge-base/bulk-upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .attach('files', Buffer.from('file 1 content'), {
          filename: 'file1.pdf',
          contentType: 'application/pdf',
        })
        .attach('files', Buffer.from('file 2 content'), {
          filename: 'file2.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'Bulk upload completed',
        results: [
          { id: 'kb-1', title: 'File 1', status: 'success' },
          { id: 'kb-2', title: 'File 2', status: 'success' },
        ],
        summary: {
          total: 2,
          successful: 2,
          failed: 0,
        },
      });
    });

    it('should handle partial failures in bulk upload', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.create as jest.Mock)
        .mockResolvedValueOnce({
          id: 'kb-1',
          title: 'File 1',
          status: 'processed',
        })
        .mockRejectedValueOnce(new Error('Database error'));

      const mockS3Send = jest.fn().mockResolvedValue({
        Location: 'https://s3.amazonaws.com/test-bucket/file.pdf',
      });
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: mockS3Send,
      }));

      const response = await request(app)
        .post('/api/knowledge-base/bulk-upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123')
        .attach('files', Buffer.from('file 1 content'), {
          filename: 'file1.pdf',
          contentType: 'application/pdf',
        })
        .attach('files', Buffer.from('file 2 content'), {
          filename: 'file2.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(207); // Multi-Status
      expect(response.body.summary).toEqual({
        total: 2,
        successful: 1,
        failed: 1,
      });
    });

    it('should return 400 if no files provided', async () => {
      const response = await request(app)
        .post('/api/knowledge-base/bulk-upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'No files provided',
      });
    });

    it('should return 400 if too many files', async () => {
      const files = Array(11)
        .fill(null)
        .map((_, i) => ({
          filename: `file${i}.pdf`,
          content: Buffer.from(`file ${i} content`),
        }));

      let req = request(app)
        .post('/api/knowledge-base/bulk-upload')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .field('widgetId', 'widget-test-123');

      files.forEach((file) => {
        req = req.attach('files', file.content, {
          filename: file.filename,
          contentType: 'application/pdf',
        });
      });

      const response = await req;

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Too many files. Maximum 10 files allowed',
      });
    });
  });

  describe('GET /api/knowledge-base/search', () => {
    it('should search documents', async () => {
      const mockResults = [
        {
          id: 'kb-1',
          title: 'Relevant Document',
          content: 'This document contains the search query',
          score: 0.95,
          widgetId: 'widget-test-123',
        },
        {
          id: 'kb-2',
          title: 'Another Document',
          content: 'Also contains search terms',
          score: 0.85,
          widgetId: 'widget-test-123',
        },
      ];

      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);
      (prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue(
        mockResults
      );

      const QdrantClient = require('@qdrant/js-client-rest').QdrantClient;
      const mockQdrant = new QdrantClient();
      mockQdrant.search.mockResolvedValue({
        result: [
          { id: 'vec-1', score: 0.95, payload: { documentId: 'kb-1' } },
          { id: 'vec-2', score: 0.85, payload: { documentId: 'kb-2' } },
        ],
      });

      const response = await request(app)
        .get('/api/knowledge-base/search')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          widgetId: 'widget-test-123',
          query: 'search query',
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 'kb-1',
            title: 'Relevant Document',
            score: 0.95,
          }),
          expect.objectContaining({
            id: 'kb-2',
            title: 'Another Document',
            score: 0.85,
          }),
        ]),
        total: 2,
      });
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .get('/api/knowledge-base/search')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({ widgetId: 'widget-test-123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Search query is required',
      });
    });

    it('should return empty results for no matches', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);

      const QdrantClient = require('@qdrant/js-client-rest').QdrantClient;
      const mockQdrant = new QdrantClient();
      mockQdrant.search.mockResolvedValue({ result: [] });

      const response = await request(app)
        .get('/api/knowledge-base/search')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .query({
          widgetId: 'widget-test-123',
          query: 'no matches',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        results: [],
        total: 0,
      });
    });
  });

  describe('POST /api/knowledge-base/sync', () => {
    it('should sync documents from external source', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);

      // Mock external API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          documents: [
            { id: 'ext-1', title: 'External Doc 1', content: 'Content 1' },
            { id: 'ext-2', title: 'External Doc 2', content: 'Content 2' },
          ],
        }),
      });

      (prisma.knowledgeBase.upsert as jest.Mock)
        .mockResolvedValueOnce({ id: 'kb-1', title: 'External Doc 1' })
        .mockResolvedValueOnce({ id: 'kb-2', title: 'External Doc 2' });

      const response = await request(app)
        .post('/api/knowledge-base/sync')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          widgetId: 'widget-test-123',
          sourceUrl: 'https://api.example.com/documents',
          apiKey: 'external-api-key',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Sync completed successfully',
        summary: {
          total: 2,
          created: 2,
          updated: 0,
          failed: 0,
        },
      });
    });

    it('should handle sync errors', async () => {
      (prisma.widget.findFirst as jest.Mock).mockResolvedValue(testWidget);

      global.fetch = jest.fn().mockRejectedValue(new Error('API error'));

      const response = await request(app)
        .post('/api/knowledge-base/sync')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`
        )
        .send({
          widgetId: 'widget-test-123',
          sourceUrl: 'https://api.example.com/documents',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Sync failed',
      });
    });
  });
});
