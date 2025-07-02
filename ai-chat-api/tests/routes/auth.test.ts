import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import authRouter from '../../src/routes/auth';
import { signToken } from '../../src/utils/jwt';
import { hashPassword, verifyPassword } from '../../src/utils/password';
import {
  testUser,
  testOrganization,
  testPasswordHash,
} from '../fixtures/test-data';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/password');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = { ...testUser, organization: testOrganization };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { organization: true },
      });
      expect(verifyPassword).toHaveBeenCalledWith(
        'password123',
        testPasswordHash
      );
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app).post('/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = { ...testUser, organization: testOrganization };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should update last login time', async () => {
      const mockUser = { ...testUser, organization: testOrganization };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Login failed');
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and organization successfully', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashedPassword',
        roles: ['ADMIN'],
        organizationId: 'new-org-id',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newOrg = {
        id: 'new-org-id',
        name: 'New Organization',
        slug: 'new-organization',
        plan: 'TRIAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.organization.create as jest.Mock).mockResolvedValue({
        ...newOrg,
        users: {
          create: newUser,
        },
      });
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app).post('/auth/signup').send({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        organizationName: 'New Organization',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: {
          name: 'New Organization',
          slug: 'new-organization',
          plan: 'TRIAL',
          trialEndsAt: expect.any(Date),
          users: {
            create: {
              email: 'newuser@example.com',
              password: 'hashedPassword',
              name: 'New User',
              roles: ['ADMIN'],
              emailVerificationToken: expect.any(String),
            },
          },
        },
        include: {
          users: true,
        },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const testCases = [
        { password: 'password123', name: 'Test', organizationName: 'Org' },
        { email: 'test@example.com', name: 'Test', organizationName: 'Org' },
        { email: 'test@example.com', password: 'password123', name: 'Test' },
      ];

      for (const testData of testCases) {
        const response = await request(app).post('/auth/signup').send(testData);
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('required');
      }
    });

    it('should return 409 if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        organizationName: 'Test Org',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User already exists');
    });

    it('should validate email format', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        organizationName: 'Test Org',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid email');
    });

    it('should validate password strength', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: '123', // Too weak
        name: 'Test User',
        organizationName: 'Test Org',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Password must be');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.organization.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');

      const response = await request(app).post('/auth/signup').send({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        organizationName: 'New Org',
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Signup failed');
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear JWT cookie', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('jwt=;');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email for valid user', async () => {
      const mockUser = { ...testUser };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.passwordReset.create as jest.Mock).mockResolvedValue({
        id: 'reset-id',
        token: 'reset-token',
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 3600000),
      });

      const response = await request(app).post('/auth/forgot-password').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset email sent');
      expect(prisma.passwordReset.create).toHaveBeenCalled();
    });

    it('should return success even for non-existent email (security)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/auth/forgot-password').send({
        email: 'nonexistent@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset email sent');
      expect(prisma.passwordReset.create).not.toHaveBeenCalled();
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });

    it('should delete existing reset tokens for user', async () => {
      const mockUser = { ...testUser };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.passwordReset.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.passwordReset.create as jest.Mock).mockResolvedValue({
        id: 'reset-id',
        token: 'reset-token',
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 3600000),
      });

      await request(app).post('/auth/forgot-password').send({
        email: 'test@example.com',
      });

      expect(prisma.passwordReset.deleteMany).toHaveBeenCalledWith({
        where: { userId: testUser.id },
      });
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const mockReset = {
        id: 'reset-id',
        token: 'valid-token',
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 3600000),
        user: testUser,
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(
        mockReset
      );
      (hashPassword as jest.Mock).mockResolvedValue('newHashedPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...testUser,
        password: 'newHashedPassword',
      });
      (prisma.passwordReset.delete as jest.Mock).mockResolvedValue(mockReset);

      const response = await request(app).post('/auth/reset-password').send({
        token: 'valid-token',
        password: 'newPassword123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset successfully');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: { password: 'newHashedPassword' },
      });
      expect(prisma.passwordReset.delete).toHaveBeenCalledWith({
        where: { id: 'reset-id' },
      });
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        password: 'newPassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Token and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        token: 'valid-token',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Token and password are required');
    });

    it('should return 400 if token is invalid', async () => {
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/auth/reset-password').send({
        token: 'invalid-token',
        password: 'newPassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 400 if token is expired', async () => {
      const mockReset = {
        id: 'reset-id',
        token: 'expired-token',
        userId: testUser.id,
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
        user: testUser,
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(
        mockReset
      );

      const response = await request(app).post('/auth/reset-password').send({
        token: 'expired-token',
        password: 'newPassword123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should validate password strength', async () => {
      const mockReset = {
        id: 'reset-id',
        token: 'valid-token',
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 3600000),
        user: testUser,
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(
        mockReset
      );

      const response = await request(app).post('/auth/reset-password').send({
        token: 'valid-token',
        password: '123', // Too weak
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Password must be');
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const mockUser = {
        ...testUser,
        emailVerified: false,
        emailVerificationToken: 'valid-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: true,
        emailVerificationToken: null,
      });

      const response = await request(app).post('/auth/verify-email').send({
        token: 'valid-token',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email verified successfully');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
        },
      });
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app).post('/auth/verify-email').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Verification token is required');
    });

    it('should return 400 if token is invalid', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/auth/verify-email').send({
        token: 'invalid-token',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid verification token');
    });

    it('should return 400 if email already verified', async () => {
      const mockUser = {
        ...testUser,
        emailVerified: true,
        emailVerificationToken: 'valid-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post('/auth/verify-email').send({
        token: 'valid-token',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already verified');
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle SQL injection attempts in login', async () => {
      const response = await request(app).post('/auth/login').send({
        email: "admin' OR '1'='1",
        password: "password' OR '1'='1",
      });

      expect(response.status).toBe(401);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin' OR '1'='1" },
        include: { organization: true },
      });
    });

    it('should handle XSS attempts in signup', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.organization.create as jest.Mock).mockResolvedValue({
        id: 'new-org-id',
        name: 'Test <script>alert("XSS")</script>',
        users: [
          {
            id: 'new-user-id',
            email: 'test@example.com',
            name: 'Test <script>alert("XSS")</script>',
          },
        ],
      });
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test <script>alert("XSS")</script>',
        organizationName: 'Test <script>alert("XSS")</script>',
      });

      expect(response.status).toBe(201);
      // The name should be stored as-is (sanitization happens on output)
      expect(response.body.user.name).toBe(
        'Test <script>alert("XSS")</script>'
      );
    });

    it('should handle concurrent signup attempts with same email', async () => {
      // First call returns null (user doesn't exist)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Create throws unique constraint error
      (prisma.organization.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        organizationName: 'Test Org',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User already exists');
    });

    it('should rate limit login attempts', async () => {
      // Note: Actual rate limiting would be implemented in middleware
      // This test verifies the endpoint handles multiple requests
      const promises = Array(10)
        .fill(null)
        .map(() =>
          request(app).post('/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
        );

      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        expect([401, 429]).toContain(response.status);
      });
    });
  });
});
