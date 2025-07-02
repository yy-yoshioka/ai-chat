import {
  PlanType,
  Role,
  DocumentStatus,
  DocumentSourceType,
} from '@prisma/client';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Generate a test password hash
export const testPasswordHash = bcrypt.hashSync('password123', 10);

export const testUser = {
  id: 'user-test-123',
  email: 'test@example.com',
  name: 'Test User',
  password: testPasswordHash,
  roles: [Role.owner],
  organizationId: 'org-test-123',
  emailVerified: true,
  emailVerificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  lastLoginAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testOrganization = {
  id: 'org-test-123',
  name: 'Test Organization',
  slug: 'test-org',
  plan: PlanType.pro,
  stripeCustomerId: 'cus_test_123',
  stripeSubscriptionId: 'sub_test_123',
  trialEndsAt: null,
  settings: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testCompany = {
  id: 'company-test-123',
  name: 'Test Company',
  organizationId: 'org-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testWidget = {
  id: 'widget-test-123',
  name: 'Test Widget',
  widgetKey: 'wk_test_123',
  themeColor: '#3B82F6',
  welcomeMessage: 'Welcome to our support!',
  placeholderText: 'Type your question here...',
  status: 'active',
  settings: {},
  companyId: 'company-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testChatLog = {
  id: 'chat-test-123',
  widgetId: 'widget-test-123',
  sessionId: 'session-test-123',
  userMessage: 'Hello, I need help',
  aiResponse: 'Hello! How can I assist you today?',
  feedback: null,
  metadata: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testFAQ = {
  id: 'faq-test-123',
  question: 'How do I reset my password?',
  answer:
    'You can reset your password by clicking the "Forgot Password" link on the login page.',
  category: 'Account',
  isPublished: true,
  organizationId: 'org-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testKnowledgeBase = {
  id: 'kb-test-123',
  title: 'Test Document',
  content: 'This is test content for knowledge base',
  url: 'https://example.com/test.pdf',
  metadata: {},
  widgetId: 'widget-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testWebhook = {
  id: 'webhook-test-123',
  name: 'Test Webhook',
  url: 'https://example.com/webhook',
  events: ['chat.message', 'chat.feedback'],
  isActive: true,
  secret: 'webhook-secret-123',
  metadata: {},
  organizationId: 'org-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testIncident = {
  id: 'incident-test-123',
  title: 'Test Service Outage',
  description: 'Testing incident management',
  severity: 'medium',
  status: 'investigating',
  affectedServices: ['chat', 'api'],
  startedAt: new Date('2024-01-01'),
  resolvedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testDataRetentionPolicy = {
  id: 'retention-test-123',
  name: 'Test Retention Policy',
  dataType: 'chat_logs',
  retentionDays: 90,
  isActive: true,
  organizationId: 'org-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testSecurityAuditLog = {
  id: 'audit-test-123',
  userId: 'user-test-123',
  action: 'user.login',
  resourceType: 'user',
  resourceId: 'user-test-123',
  metadata: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  },
  organizationId: 'org-test-123',
  createdAt: new Date('2024-01-01'),
};

export const testAPIKey = {
  id: 'apikey-test-123',
  name: 'Test API Key',
  key: 'ak_test_123456789',
  hashedKey: bcrypt.hashSync('ak_test_123456789', 10),
  permissions: ['read:widgets', 'write:widgets'],
  expiresAt: new Date('2025-01-01'),
  lastUsedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// JWT test tokens
export const generateTestToken = (
  userId: string,
  organizationId: string,
  expiresIn = '1h'
) => {
  return jwt.sign(
    { id: userId, organizationId }, 
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn }
  );
};

export const generateExpiredToken = (
  userId: string,
  organizationId: string
) => {
  return jwt.sign(
    { id: userId, organizationId }, 
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '-1h' }
  );
};

// Mock authentication header
export const mockAuthHeader = (
  userId = 'user-test-123',
  organizationId = 'org-test-123'
) => ({
  authorization: `Bearer ${generateTestToken(userId, organizationId)}`,
});

// Mock file for upload tests
export const mockFile = {
  fieldname: 'file',
  originalname: 'test.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  destination: '/tmp',
  filename: 'test-123.pdf',
  path: '/tmp/test-123.pdf',
  size: 1024 * 1024, // 1MB
  buffer: Buffer.from('test file content'),
  stream: null as any,
};

// Mock request and response objects
export const createMockRequest = (overrides = {}) => ({
  headers: {},
  params: {},
  query: {},
  body: {},
  user: null,
  file: null,
  files: [],
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();

// Mock WebSocket connection
export const createMockSocket = (id = 'socket-test-123') => ({
  id,
  emit: jest.fn(),
  on: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  disconnect: jest.fn(),
  rooms: new Set([id]),
  data: {},
});

// Mock Prisma transaction
export const mockPrismaTransaction = (prisma: any) => {
  return jest.fn((callback) => {
    if (typeof callback === 'function') {
      return callback(prisma);
    }
    return Promise.all(callback);
  });
};
