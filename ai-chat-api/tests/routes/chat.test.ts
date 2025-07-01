import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import chatRouter from '../../src/routes/chat';
import { authMiddleware } from '../../src/middleware/auth';
import { requireValidWidget } from '../../src/middleware/requireValidWidget';
import {
  testUser,
  testWidget,
  mockAuthToken,
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
jest.mock('../../src/middleware/requireValidWidget');

// Mock OpenAI fetch
global.fetch = jest.fn();

// Mock rate limiter
jest.mock('../../src/utils/rateLimiter', () => ({
  rateLimiter: {
    incrementAndCheck: jest.fn().mockResolvedValue({
      allowed: true,
      remaining: 49,
      resetTime: Date.now() + 3600000,
    }),
  },
}));

// Mock knowledge base service
jest.mock('../../src/services/knowledgeBaseService', () => ({
  searchKnowledgeBase: jest.fn().mockResolvedValue([
    {
      score: 0.9,
      content: 'Test knowledge base content',
      metadata: { title: 'Test Document' },
    },
  ]),
}));

describe('Chat Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });

    (requireValidWidget as jest.Mock).mockImplementation((req, res, next) => {
      req.widget = testWidget;
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('POST /api/chat (authenticated)', () => {
    it('should return chat response for authenticated user', async () => {
      // Mock database queries
      prismaMock.fAQ.findMany.mockResolvedValue([]);
      prismaMock.chatLog.findMany.mockResolvedValue([]);
      prismaMock.chatLog.create.mockResolvedValue({
        id: 'chat-123',
        question: 'Hello',
        answer: 'Hi there!',
        userId: testUser.id,
        widgetId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock OpenAI response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Hi there! How can I help you today?',
              },
            },
          ],
        }),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        answer: 'Hi there! How can I help you today?',
        timestamp: expect.any(String),
        sources: [],
      });

      expect(prismaMock.chatLog.create).toHaveBeenCalledWith({
        data: {
          question: 'Hello',
          answer: 'Hi there! How can I help you today?',
          userId: testUser.id,
          widgetId: null,
        },
      });
    });

    it('should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'メッセージが必要です',
        message: 'Message is required',
      });
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'メッセージが必要です',
        message: 'Message is required',
      });
    });

    it('should return 400 for message too long', async () => {
      const longMessage = 'a'.repeat(2001);

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: longMessage });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'メッセージが長すぎます（2000文字以内）',
        message: 'Message too long (max 2000 characters)',
      });
    });

    it('should handle OpenAI API errors', async () => {
      prismaMock.fAQ.findMany.mockResolvedValue([]);
      prismaMock.chatLog.findMany.mockResolvedValue([]);

      // Mock OpenAI error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error',
          },
        }),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: 'Hello' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: '申し訳ございません。一時的なエラーが発生しました。',
        message: 'Internal server error',
      });
    });

    it('should return mock response when OpenAI API key is not configured', async () => {
      // Temporarily remove API key
      const originalApiKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'your_openai_api_key_here';

      prismaMock.fAQ.findMany.mockResolvedValue([]);
      prismaMock.chatLog.findMany.mockResolvedValue([]);
      prismaMock.chatLog.create.mockResolvedValue({
        id: 'chat-123',
        question: 'Hello',
        answer: 'Mock response',
        userId: testUser.id,
        widgetId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body.answer).toContain('Hello');
      expect(response.body.answer).toContain('テスト');

      // Restore API key
      process.env.OPENAI_API_KEY = originalApiKey;
    });
  });

  describe('POST /api/chat/widget/:widgetKey', () => {
    it('should return chat response for widget request', async () => {
      // Mock database queries
      prismaMock.fAQ.findMany.mockResolvedValue([]);
      prismaMock.chatLog.findMany.mockResolvedValue([]);
      prismaMock.chatLog.create.mockResolvedValue({
        id: 'chat-123',
        question: 'Help with widget',
        answer: 'Widget response',
        userId: null,
        widgetId: testWidget.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock OpenAI response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'I can help you with the widget!',
              },
            },
          ],
        }),
      });

      const response = await request(app)
        .post('/api/chat/widget/wk_test_123')
        .send({ message: 'Help with widget' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        answer: 'I can help you with the widget!',
        timestamp: expect.any(String),
        sources: expect.arrayContaining([
          expect.objectContaining({
            score: 0.9,
            content: 'Test knowledge base content',
          }),
        ]),
      });
    });

    it('should handle rate limiting for widget requests', async () => {
      const { rateLimiter } = require('../../src/utils/rateLimiter');
      rateLimiter.incrementAndCheck.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
      });

      const response = await request(app)
        .post('/api/chat/widget/wk_test_123')
        .send({ message: 'Hello' });

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        error: 'Rate limit exceeded. Please try again later.',
        resetTime: expect.any(Number),
      });
    });

    it('should return 401 for invalid widget key', async () => {
      (requireValidWidget as jest.Mock).mockImplementation((req, res) => {
        res.status(401).json({ error: 'Invalid widget key' });
      });

      const response = await request(app)
        .post('/api/chat/widget/invalid_key')
        .send({ message: 'Hello' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid widget key' });
    });
  });

  describe('GET /api/chat/history', () => {
    it('should return chat history for authenticated user', async () => {
      const mockChats = [
        {
          id: 'chat-1',
          question: 'Question 1',
          answer: 'Answer 1',
          userId: testUser.id,
          widgetId: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'chat-2',
          question: 'Question 2',
          answer: 'Answer 2',
          userId: testUser.id,
          widgetId: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      prismaMock.chatLog.findMany.mockResolvedValue(mockChats);
      prismaMock.chatLog.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', mockAuthToken)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        chats: mockChats,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1,
        },
      });

      expect(prismaMock.chatLog.findMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle pagination', async () => {
      prismaMock.chatLog.findMany.mockResolvedValue([]);
      prismaMock.chatLog.count.mockResolvedValue(50);

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', mockAuthToken)
        .query({ page: 2, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        pages: 5,
      });

      expect(prismaMock.chatLog.findMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
    });

    it('should return 401 when not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/chat/history');

      expect(response.status).toBe(401);
    });

    it('should handle database errors', async () => {
      prismaMock.chatLog.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', mockAuthToken);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'チャット履歴の取得に失敗しました',
        message: 'Failed to fetch chat history',
      });
    });
  });

  describe('Chat functionality with FAQ and Knowledge Base', () => {
    it('should include FAQ results in chat response', async () => {
      const mockFAQs = [
        {
          id: 'faq-1',
          question: 'How to reset password?',
          answer: 'Click on forgot password link',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.fAQ.findMany.mockResolvedValue(mockFAQs);
      prismaMock.chatLog.findMany.mockResolvedValue([]);
      prismaMock.chatLog.create.mockResolvedValue({
        id: 'chat-123',
        question: 'password reset',
        answer: 'Based on FAQ...',
        userId: testUser.id,
        widgetId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock OpenAI response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Based on the FAQ, you can reset your password by clicking the forgot password link.',
              },
            },
          ],
        }),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: 'password reset' });

      expect(response.status).toBe(200);
      expect(prismaMock.fAQ.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { question: { contains: 'password reset' } },
            { answer: { contains: 'password reset' } },
          ],
        },
        take: 3,
      });
    });

    it('should include conversation history in context', async () => {
      const mockHistory = [
        {
          id: 'chat-1',
          question: 'What is your name?',
          answer: 'I am an AI assistant',
          userId: testUser.id,
          widgetId: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'chat-2',
          question: 'Can you help me?',
          answer: 'Of course!',
          userId: testUser.id,
          widgetId: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      prismaMock.fAQ.findMany.mockResolvedValue([]);
      prismaMock.chatLog.findMany.mockResolvedValue(mockHistory);
      prismaMock.chatLog.create.mockResolvedValue({
        id: 'chat-123',
        question: 'Follow up question',
        answer: 'Response with context',
        userId: testUser.id,
        widgetId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      let capturedRequestBody: any;
      (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
        capturedRequestBody = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: 'Response with context from history',
                },
              },
            ],
          }),
        };
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', mockAuthToken)
        .send({ message: 'Follow up question' });

      expect(response.status).toBe(200);
      
      // Verify conversation history was included in OpenAI request
      expect(capturedRequestBody.messages).toContainEqual(
        expect.objectContaining({
          role: 'user',
          content: 'What is your name?',
        })
      );
      expect(capturedRequestBody.messages).toContainEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'I am an AI assistant',
        })
      );
    });
  });
});