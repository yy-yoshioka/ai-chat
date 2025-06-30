// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.OPENAI_API_KEY = 'sk-test-mock';
process.env.NODE_ENV = 'test';

// Mock prisma globally
jest.mock('../src/lib/prisma');
