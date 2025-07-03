import request from 'supertest';
import express from 'express';
import authRouter from '../../src/routes/auth';
import {
  testUser,
  testOrganization,
  generateTestToken,
} from '../fixtures/test-data';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/email');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

// Get mocked functions
const { prisma } = require('../../src/lib/prisma');
const { signToken, verifyToken } = require('../../src/utils/jwt');
const { hashPassword, verifyPassword } = require('../../src/utils/password');
const { sendEmail } = require('../../src/utils/email');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = { ...testUser };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      verifyPassword.mockResolvedValue(true);
      signToken.mockReturnValue('mock-token');

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue(testUser);
      verifyPassword.mockResolvedValue(false);

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and organization', async () => {
      const mockNewUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashed-password',
        organizationId: 'new-org-id',
        roles: ['owner'],
        emailVerified: true,
        emailVerificationToken: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewOrg = {
        id: 'new-org-id',
        name: 'New Organization',
        slug: 'new-organization',
        plan: 'free',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEndsAt: null,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findFirst.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed-password');
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const transactionPrisma = {
          organization: {
            create: jest.fn().mockResolvedValue(mockNewOrg),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockNewUser),
          },
        };
        return callback(transactionPrisma);
      });
      signToken.mockReturnValue('mock-token');
      sendEmail.mockResolvedValue(undefined);

      const response = await request(app).post('/auth/signup').send({
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        name: 'New User',
        organizationName: 'New Organization',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        // missing name and organizationName
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return 400 if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue(testUser);

      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        organizationName: 'Test Organization',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email', async () => {
      prisma.user.findUnique.mockResolvedValue(testUser);
      prisma.user.update.mockResolvedValue({
        ...testUser,
        resetPasswordToken: 'reset-token',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      });
      sendEmail.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset email sent');
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const mockUserWithToken = {
        ...testUser,
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      prisma.user.findFirst.mockResolvedValue(mockUserWithToken);
      hashPassword.mockResolvedValue('new-hashed-password');
      prisma.user.update.mockResolvedValue({
        ...testUser,
        password: 'new-hashed-password',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      const response = await request(app).post('/auth/reset-password').send({
        token: 'valid-token',
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset successful');
    });

    it('should return 400 if token is invalid or expired', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app).post('/auth/reset-password').send({
        token: 'invalid-token',
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });
  });
});
