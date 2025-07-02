import request from 'supertest';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { prisma } from '../../src/lib/prisma';
import chatRouter from '../../src/routes/chat';
import { authMiddleware } from '../../src/middleware/auth';
import { requireValidWidget } from '../../src/middleware/requireValidWidget';
import { 
  testUser, 
  testOrganization,
  testWidget, 
  testChatLog,
  generateTestToken,
  createMockSocket 
} from '../fixtures/test-data';
import Redis from 'ioredis';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('ioredis');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/requireValidWidget');

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock AI response',
                role: 'assistant',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        }),
      },
    },
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
      metadata: { title: 'Test Document', url: 'https://example.com/doc' },
    },
  ]),
}));

// Mock email service
jest.mock('../../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe('Chat Routes', () => {
  let app: express.Application;
  let server: any;
  let io: SocketIOServer;
  let redis: Redis;

  beforeEach(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRouter);

    // Setup HTTP server and Socket.IO
    server = createServer(app);
    io = new SocketIOServer(server);
    app.set('io', io);

    // Setup Redis mock
    redis = new Redis();
    app.set('redis', redis);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    (requireValidWidget as jest.Mock).mockImplementation((req, res, next) => {
      req.widget = testWidget;
      next();
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    server?.close();
  });

  describe('POST /api/chat (authenticated)', () => {
    it('should return chat response for authenticated user', async () => {
      // Mock database queries
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.create as jest.Mock).mockResolvedValue({
        id: 'chat-123',
        question: 'Hello',
        answer: 'Mock AI response',
        userId: testUser.id,
        widgetId: null,
        sessionId: 'session-123',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (prisma.usage.create as jest.Mock).mockResolvedValue({
        id: 'usage-123',
        organizationId: testOrganization.id,
        endpoint: '/api/chat',
        tokens: 15,
        cost: 0.0001,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ 
          message: 'Hello',
          sessionId: 'session-123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        answer: 'Mock AI response',
        timestamp: expect.any(String),
        sources: [],
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
        },
      });

      expect(prisma.chatLog.create).toHaveBeenCalledWith({
        data: {
          question: 'Hello',
          answer: 'Mock AI response',
          userId: testUser.id,
          widgetId: null,
          sessionId: 'session-123',
          metadata: expect.any(Object),
        },
      });

      expect(prisma.usage.create).toHaveBeenCalledWith({
        data: {
          organizationId: testOrganization.id,
          endpoint: '/api/chat',
          tokens: 15,
          cost: expect.any(Number),
          metadata: expect.any(Object),
        },
      });
    });

    it('should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Message is required',
      });
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ message: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Message is required',
      });
    });

    it('should return 400 for message too long', async () => {
      const longMessage = 'a'.repeat(4001);

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ message: longMessage });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Message too long (max 4000 characters)',
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('OpenAI API error'));

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ message: 'Hello' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to generate response',
      });
    });

    it('should handle rate limit errors from OpenAI', async () => {
      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(rateLimitError);

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ message: 'Hello' });

      expect(response.status).toBe(429);
      expect(response.body).toEqual({
        error: 'Rate limit exceeded. Please try again later.',
      });
    });

    it('should include context from previous messages', async () => {
      const mockHistory = [
        {
          id: 'chat-1',
          question: 'What is TypeScript?',
          answer: 'TypeScript is a typed superset of JavaScript',
          userId: testUser.id,
          sessionId: 'session-123',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'chat-2',
          question: 'Tell me more',
          answer: 'TypeScript adds static typing to JavaScript',
          userId: testUser.id,
          sessionId: 'session-123',
          createdAt: new Date('2024-01-02'),
        },
      ];

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockHistory);
      (prisma.chatLog.create as jest.Mock).mockResolvedValue({
        id: 'chat-123',
        question: 'What are its benefits?',
        answer: 'Mock AI response',
        userId: testUser.id,
        sessionId: 'session-123',
        createdAt: new Date(),
      });

      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;
      let capturedMessages: any[];
      mockOpenAI.chat.completions.create.mockImplementationOnce((options: any) => {
        capturedMessages = options.messages;
        return Promise.resolve({
          choices: [
            {
              message: {
                content: 'TypeScript provides type safety and better IDE support',
                role: 'assistant',
              },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
        });
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ 
          message: 'What are its benefits?',
          sessionId: 'session-123'
        });

      expect(response.status).toBe(200);
      expect(capturedMessages).toContainEqual(
        expect.objectContaining({
          role: 'user',
          content: 'What is TypeScript?',
        })
      );
      expect(capturedMessages).toContainEqual(
        expect.objectContaining({
          role: 'assistant',
          content: 'TypeScript is a typed superset of JavaScript',
        })
      );
    });
  });

  describe('POST /api/chat/widget/:widgetKey', () => {
    it('should return chat response for widget request', async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.create as jest.Mock).mockResolvedValue({
        id: 'chat-123',
        question: 'Help with widget',
        answer: 'Mock AI response',
        widgetId: testWidget.id,
        sessionId: 'widget-session-123',
        createdAt: new Date(),
      });

      (prisma.unansweredMessage.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .post('/api/chat/widget/wk_test_123')
        .send({ 
          message: 'Help with widget',
          sessionId: 'widget-session-123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        answer: 'Mock AI response',
        timestamp: expect.any(String),
        sources: expect.arrayContaining([
          expect.objectContaining({
            score: 0.9,
            content: 'Test knowledge base content',
          }),
        ]),
      });

      const { searchKnowledgeBase } = require('../../src/services/knowledgeBaseService');
      expect(searchKnowledgeBase).toHaveBeenCalledWith(
        testWidget.id,
        'Help with widget'
      );
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
      (requireValidWidget as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Invalid widget key' });
      });

      const response = await request(app)
        .post('/api/chat/widget/invalid_key')
        .send({ message: 'Hello' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid widget key' });
    });

    it('should track unanswered messages when confidence is low', async () => {
      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'I am not sure about this question.',
              role: 'assistant',
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 },
      });

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.create as jest.Mock).mockResolvedValue({
        id: 'chat-123',
        question: 'Complex technical question',
        answer: 'I am not sure about this question.',
        widgetId: testWidget.id,
        metadata: { confidence: 'low' },
        createdAt: new Date(),
      });

      (prisma.unansweredMessage.create as jest.Mock).mockResolvedValue({
        id: 'unanswered-123',
        chatLogId: 'chat-123',
        organizationId: testOrganization.id,
        status: 'pending',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/chat/widget/wk_test_123')
        .send({ message: 'Complex technical question' });

      expect(response.status).toBe(200);
      expect(prisma.unansweredMessage.create).toHaveBeenCalledWith({
        data: {
          chatLogId: 'chat-123',
          organizationId: testWidget.company.organizationId,
          status: 'pending',
          metadata: expect.any(Object),
        },
      });
    });
  });

  describe('POST /api/chat/stream (authenticated)', () => {
    it('should stream chat response', async () => {
      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;

      // Mock streaming response
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Hello' }, finish_reason: null }] };
          yield { choices: [{ delta: { content: ' there!' }, finish_reason: null }] };
          yield { choices: [{ delta: { content: '' }, finish_reason: 'stop' }] };
        },
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockStream);

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.create as jest.Mock).mockResolvedValue({
        id: 'chat-123',
        question: 'Hello',
        answer: 'Hello there!',
        userId: testUser.id,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .set('Accept', 'text/event-stream')
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    it('should handle stream errors gracefully', async () => {
      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;

      // Mock streaming error
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Hello' }, finish_reason: null }] };
          throw new Error('Stream error');
        },
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockStream);

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/chat/stream')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .set('Accept', 'text/event-stream')
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');
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
          sessionId: 'session-1',
          feedback: 'positive',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'chat-2',
          question: 'Question 2',
          answer: 'Answer 2',
          userId: testUser.id,
          sessionId: 'session-1',
          feedback: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockChats);
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
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

      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by session ID', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ sessionId: 'session-123' });

      expect(response.status).toBe(200);
      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        where: { 
          userId: testUser.id,
          sessionId: 'session-123'
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by date range', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(0);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ startDate, endDate });

      expect(response.status).toBe(200);
      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        where: { 
          userId: testUser.id,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate + 'T23:59:59.999Z'),
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle pagination correctly', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.count as jest.Mock).mockResolvedValue(50);

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ page: 3, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        pages: 5,
      });

      expect(prisma.chatLog.findMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        skip: 20,
        take: 10,
      });
    });

    it('should return 401 when not authenticated', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/chat/history');

      expect(response.status).toBe(401);
    });

    it('should handle database errors', async () => {
      (prisma.chatLog.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch chat history',
      });
    });
  });

  describe('POST /api/chat/:chatId/feedback', () => {
    it('should update chat feedback', async () => {
      const mockChat = {
        ...testChatLog,
        userId: testUser.id,
      };

      (prisma.chatLog.findUnique as jest.Mock).mockResolvedValue(mockChat);
      (prisma.chatLog.update as jest.Mock).mockResolvedValue({
        ...mockChat,
        feedback: 'positive',
      });

      (prisma.messageFeedback.create as jest.Mock).mockResolvedValue({
        id: 'feedback-123',
        chatLogId: testChatLog.id,
        feedback: 'positive',
        comment: 'Very helpful!',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/chat/${testChatLog.id}/feedback`)
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ 
          feedback: 'positive',
          comment: 'Very helpful!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Feedback recorded successfully',
      });

      expect(prisma.chatLog.update).toHaveBeenCalledWith({
        where: { id: testChatLog.id },
        data: { feedback: 'positive' },
      });

      expect(prisma.messageFeedback.create).toHaveBeenCalledWith({
        data: {
          chatLogId: testChatLog.id,
          feedback: 'positive',
          comment: 'Very helpful!',
          metadata: {},
        },
      });
    });

    it('should return 404 for non-existent chat', async () => {
      (prisma.chatLog.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/chat/non-existent-id/feedback')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ feedback: 'positive' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Chat not found',
      });
    });

    it('should return 403 for chat not owned by user', async () => {
      const mockChat = {
        ...testChatLog,
        userId: 'other-user-id',
      };

      (prisma.chatLog.findUnique as jest.Mock).mockResolvedValue(mockChat);

      const response = await request(app)
        .post(`/api/chat/${testChatLog.id}/feedback`)
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ feedback: 'positive' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Forbidden',
      });
    });

    it('should return 400 for invalid feedback value', async () => {
      const response = await request(app)
        .post(`/api/chat/${testChatLog.id}/feedback`)
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ feedback: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid feedback value. Must be positive, negative, or neutral',
      });
    });
  });

  describe('DELETE /api/chat/:chatId', () => {
    it('should delete chat message', async () => {
      const mockChat = {
        ...testChatLog,
        userId: testUser.id,
      };

      (prisma.chatLog.findUnique as jest.Mock).mockResolvedValue(mockChat);
      (prisma.chatLog.delete as jest.Mock).mockResolvedValue(mockChat);

      const response = await request(app)
        .delete(`/api/chat/${testChatLog.id}`)
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Chat deleted successfully',
      });

      expect(prisma.chatLog.delete).toHaveBeenCalledWith({
        where: { id: testChatLog.id },
      });
    });

    it('should return 404 for non-existent chat', async () => {
      (prisma.chatLog.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/chat/non-existent-id')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Chat not found',
      });
    });

    it('should return 403 for chat not owned by user', async () => {
      const mockChat = {
        ...testChatLog,
        userId: 'other-user-id',
      };

      (prisma.chatLog.findUnique as jest.Mock).mockResolvedValue(mockChat);

      const response = await request(app)
        .delete(`/api/chat/${testChatLog.id}`)
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Forbidden',
      });
    });
  });

  describe('WebSocket chat functionality', () => {
    it('should handle WebSocket chat messages', (done) => {
      const mockSocket = createMockSocket();
      
      io.on('connection', (socket) => {
        socket.on('chat:message', async (data) => {
          expect(data).toEqual({
            widgetKey: 'wk_test_123',
            message: 'Hello WebSocket',
            sessionId: 'ws-session-123',
          });

          socket.emit('chat:response', {
            answer: 'WebSocket response',
            timestamp: new Date().toISOString(),
          });
        });
      });

      // Simulate WebSocket connection
      io.emit('connection', mockSocket);

      // Simulate chat message
      mockSocket.on.mock.calls
        .find(([event]) => event === 'chat:message')[1]({
          widgetKey: 'wk_test_123',
          message: 'Hello WebSocket',
          sessionId: 'ws-session-123',
        });

      // Verify response was emitted
      setTimeout(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('chat:response', 
          expect.objectContaining({
            answer: 'WebSocket response',
            timestamp: expect.any(String),
          })
        );
        done();
      }, 100);
    });

    it('should handle WebSocket errors', (done) => {
      const mockSocket = createMockSocket();

      io.on('connection', (socket) => {
        socket.on('chat:message', async () => {
          socket.emit('chat:error', {
            error: 'Failed to process message',
          });
        });
      });

      io.emit('connection', mockSocket);

      mockSocket.on.mock.calls
        .find(([event]) => event === 'chat:message')[1]({
          widgetKey: 'invalid_key',
          message: 'Hello',
        });

      setTimeout(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('chat:error', 
          expect.objectContaining({
            error: 'Failed to process message',
          })
        );
        done();
      }, 100);
    });

    it('should handle typing indicators', (done) => {
      const mockSocket = createMockSocket();

      io.on('connection', (socket) => {
        socket.on('chat:typing', (data) => {
          expect(data).toEqual({
            sessionId: 'session-123',
            isTyping: true,
          });

          // Broadcast to room
          socket.to(`session:session-123`).emit('chat:typing', data);
        });
      });

      io.emit('connection', mockSocket);

      mockSocket.on.mock.calls
        .find(([event]) => event === 'chat:typing')[1]({
          sessionId: 'session-123',
          isTyping: true,
        });

      done();
    });
  });

  describe('Chat analytics and monitoring', () => {
    it('should track response time metrics', async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.create as jest.Mock).mockResolvedValue({
        id: 'chat-123',
        question: 'Hello',
        answer: 'Mock AI response',
        userId: testUser.id,
        metadata: {
          responseTime: expect.any(Number),
          tokensUsed: 15,
        },
        createdAt: new Date(),
      });

      (prisma.systemMetric.create as jest.Mock).mockResolvedValue({
        id: 'metric-123',
        type: 'chat_response_time',
        value: expect.any(Number),
        metadata: {},
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(prisma.systemMetric.create).toHaveBeenCalledWith({
        data: {
          type: 'chat_response_time',
          value: expect.any(Number),
          metadata: {
            userId: testUser.id,
            organizationId: testOrganization.id,
          },
        },
      });
    });

    it('should track error metrics', async () => {
      const OpenAI = require('openai').default;
      const mockOpenAI = OpenAI.mock.results[0].value;
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('API Error'));

      (prisma.fAQ.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.systemMetric.create as jest.Mock).mockResolvedValue({
        id: 'metric-123',
        type: 'chat_error',
        value: 1,
        metadata: { error: 'API Error' },
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({ message: 'Hello' });

      expect(response.status).toBe(500);
      expect(prisma.systemMetric.create).toHaveBeenCalledWith({
        data: {
          type: 'chat_error',
          value: 1,
          metadata: expect.objectContaining({
            error: expect.any(String),
            userId: testUser.id,
          }),
        },
      });
    });
  });

  describe('Export functionality', () => {
    it('should export chat history as CSV', async () => {
      const mockChats = [
        {
          id: 'chat-1',
          question: 'Question 1',
          answer: 'Answer 1',
          userId: testUser.id,
          feedback: 'positive',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'chat-2',
          question: 'Question 2',
          answer: 'Answer 2',
          userId: testUser.id,
          feedback: null,
          createdAt: new Date('2024-01-02'),
        },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockChats);

      const response = await request(app)
        .get('/api/chat/export')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('Question,Answer,Feedback,Date');
      expect(response.text).toContain('Question 1,Answer 1,positive');
    });

    it('should export chat history as JSON', async () => {
      const mockChats = [
        {
          id: 'chat-1',
          question: 'Question 1',
          answer: 'Answer 1',
          userId: testUser.id,
          feedback: 'positive',
          createdAt: new Date('2024-01-01'),
        },
      ];

      (prisma.chatLog.findMany as jest.Mock).mockResolvedValue(mockChats);

      const response = await request(app)
        .get('/api/chat/export')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ format: 'json' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toEqual({
        exportDate: expect.any(String),
        totalChats: 1,
        chats: mockChats,
      });
    });

    it('should return 400 for invalid export format', async () => {
      const response = await request(app)
        .get('/api/chat/export')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ format: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid export format. Supported formats: csv, json',
      });
    });
  });
});