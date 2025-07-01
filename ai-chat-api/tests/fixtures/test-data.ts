import {
  Organization,
  User,
  Widget,
  Company,
  KnowledgeBaseItem,
} from '@prisma/client';

export const testOrganization: Organization = {
  id: 'org-test-123',
  name: 'Test Organization',
  plan: 'pro',
  settings: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  stripeCustomerId: 'cus_test_123',
  stripeSubscriptionId: 'sub_test_123',
  trialEndsAt: null,
};

export const testUser: User & { organizations: Organization[] } = {
  id: 'user-test-123',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2b$10$mockHashedPassword',
  roles: ['admin'],
  organizationId: 'org-test-123',
  emailVerified: true,
  emailVerificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  lastLoginAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  organizations: [testOrganization],
};

export const testCompany: Company = {
  id: 'company-test-123',
  name: 'Test Company',
  organizationId: 'org-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const testWidget: Widget = {
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

export const testKnowledgeBaseItem: KnowledgeBaseItem = {
  id: 'kb-test-123',
  title: 'Test Document',
  content: 'This is test content for knowledge base',
  fileName: 'test.pdf',
  fileUrl: 'https://s3.amazonaws.com/test-bucket/test.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
  status: 'processed',
  vectorIds: ['vec-1', 'vec-2'],
  error: null,
  metadata: {},
  widgetId: 'widget-test-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAuthToken =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLXRlc3QtMTIzIiwib3JnYW5pemF0aW9uSWQiOiJvcmctdGVzdC0xMjMiLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6OTk5OTk5OTk5OX0.mock';

export const mockPrismaKnowledgeBase = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

export const mockPrismaWidget = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
