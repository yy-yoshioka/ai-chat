// Set up test environment
import 'reflect-metadata';
import { TextEncoder, TextDecoder } from 'util';

// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.SENDGRID_API_KEY = 'SG.test-key';
process.env.QDRANT_URL = 'http://localhost:6333';
process.env.QDRANT_API_KEY = 'test-qdrant-key';
process.env.AWS_ACCESS_KEY_ID = 'test-aws-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-aws-secret';
process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.OPENAI_API_KEY = 'sk-test-mock';

// Mock global objects
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Prisma
jest.mock('../src/lib/prisma');

// Mock Redis
jest.mock('ioredis');

// Mock logger to reduce noise in tests
jest.mock('../src/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

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
            },
          ],
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

// Mock Stripe
jest.mock('stripe', () => ({
  default: jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_test' }),
      update: jest.fn().mockResolvedValue({ id: 'cus_test' }),
    },
    prices: {
      list: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'price_test',
            product: 'prod_test',
            unit_amount: 1000,
            currency: 'usd',
            recurring: { interval: 'month' },
          },
        ],
      }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'sub_test' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'sub_test' }),
      update: jest.fn().mockResolvedValue({ id: 'sub_test' }),
      cancel: jest.fn().mockResolvedValue({ id: 'sub_test' }),
    },
    checkout: {
      sessions: {
        create: jest
          .fn()
          .mockResolvedValue({
            id: 'cs_test',
            url: 'https://checkout.stripe.com/test',
          }),
      },
    },
    billingPortal: {
      sessions: {
        create: jest
          .fn()
          .mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
      },
    },
    webhookEndpoints: {
      create: jest.fn().mockResolvedValue({ id: 'we_test' }),
    },
  })),
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{}]),
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
            metadata: {},
          },
        },
      ],
    }),
    delete: jest.fn().mockResolvedValue({ operation_id: 1 }),
  })),
}));

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

// Mock Socket.IO
jest.mock('socket.io', () => {
  const mockSocket = {
    id: 'test-socket-id',
    emit: jest.fn(),
    on: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockIo = {
    on: jest.fn((event, handler) => {
      if (event === 'connection') {
        // Simulate a connection
        setImmediate(() => handler(mockSocket));
      }
    }),
    emit: jest.fn(),
    to: jest.fn(() => mockIo),
    in: jest.fn(() => mockIo),
    sockets: {
      sockets: new Map([[mockSocket.id, mockSocket]]),
    },
  };

  return {
    Server: jest.fn(() => mockIo),
  };
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(30000);

// Test helpers
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  organizationId: 'test-org-id',
  roles: ['admin'],
};

// Mock date for consistent testing
const mockDate = new Date('2024-01-01T00:00:00Z');
jest.useFakeTimers();
jest.setSystemTime(mockDate);

// Helper to reset all mocks
global.resetAllMocks = () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
};
