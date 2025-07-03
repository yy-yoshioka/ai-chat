import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

// Helper function to create standard mock methods for each model
const createMockModel = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
});

export const prisma = {
  // Core models
  user: createMockModel(),
  organization: createMockModel(),
  company: createMockModel(),
  widget: createMockModel(),

  // Chat and FAQ models
  chatLog: createMockModel(),
  fAQ: createMockModel(),
  unansweredMessage: createMockModel(),
  messageFeedback: createMockModel(),

  // Knowledge base models
  knowledgeBase: createMockModel(),
  linkRule: createMockModel(),

  // Usage and billing
  usage: createMockModel(),

  // Events and analytics
  event: createMockModel(),

  // Auth models
  passwordReset: createMockModel(),
  emailVerification: createMockModel(),
  aPIKey: createMockModel(),

  // Notification models
  notificationSettings: createMockModel(),
  notification: createMockModel(),

  // Webhook models
  webhook: createMockModel(),
  webhookLog: createMockModel(),

  // System monitoring
  systemMetric: createMockModel(),
  healthCheck: createMockModel(),
  incident: createMockModel(),
  incidentUpdate: createMockModel(),

  // Data retention
  dataRetentionPolicy: createMockModel(),
  dataRetentionJob: createMockModel(),

  // Security and permissions
  rolePermission: createMockModel(),
  userPermissionOverride: createMockModel(),
  securityAuditLog: createMockModel(),
  dataAccessLog: createMockModel(),

  // Transaction methods
  $transaction: jest.fn((fn) => {
    if (typeof fn === 'function') {
      return fn(prisma);
    }
    return Promise.all(fn);
  }),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};
