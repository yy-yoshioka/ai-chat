import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import authRouter from '../../src/routes/auth';
import {
  testUser,
  testPasswordHash,
  generateTestToken,
  generateExpiredToken,
  createMockRequest,
  createMockResponse,
} from '../fixtures/test-data';
import { hashPassword, verifyPassword } from '../../src/utils/password';
import { signToken } from '../../src/utils/jwt';
import { authMiddleware } from '../../src/middleware/auth';

// Mock the utils
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/jwt');

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
      const mockUser = { ...testUser };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(verifyPassword).toHaveBeenCalledWith('password123', testPasswordHash);
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = { ...testUser };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashedPassword',
        isAdmin: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password: 'hashedPassword',
          name: 'New User',
        },
      });
    });

    it('should create user without name', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: null,
        password: 'hashedPassword',
        isAdmin: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password: 'hashedPassword',
          name: null,
        },
      });
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 409 if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User already exists');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /auth/me', () => {
    // Create a test app with middleware for these tests
    const appWithAuth = express();
    appWithAuth.use(express.json());
    
    // Mock the authMiddleware to set req.user
    appWithAuth.use((req: any, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === 'valid-token') {
          req.user = { id: testUser.id, email: testUser.email, isAdmin: testUser.isAdmin };
        }
      }
      next();
    });
    
    appWithAuth.use('/auth', authRouter);

    it('should return current user data when authenticated', async () => {
      const mockUser = { ...testUser };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(appWithAuth)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User authenticated');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser.id },
      });
    });

    it('should return 401 when no authorization header provided', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 404 if authenticated user not found in database', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(appWithAuth)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(appWithAuth)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle SQL injection attempts in login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: "admin' OR '1'='1",
          password: "password' OR '1'='1",
        });

      expect(response.status).toBe(401);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin' OR '1'='1" },
      });
    });

    it('should handle extremely long input values', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const longPassword = 'p'.repeat(1000);

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: longEmail,
          password: longPassword,
          name: 'Test User',
        });

      // Should still process the request (validation would be done at schema level)
      expect([201, 409, 500]).toContain(response.status);
    });

    it('should handle special characters in input', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: 'test+special@example.com',
        name: 'Test <script>alert("XSS")</script>',
        password: 'hashedPassword',
        isAdmin: false,
      });
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (signToken as jest.Mock).mockImplementation((payload, res) => {
        res.cookie('jwt', 'mock-token');
      });

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test+special@example.com',
          password: 'p@$$w0rd!',
          name: 'Test <script>alert("XSS")</script>',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.name).toBe('Test <script>alert("XSS")</script>');
    });

    it('should handle concurrent signup attempts with same email', async () => {
      // First call returns null (user doesn't exist), second returns user (already created)
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(testUser);

      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint violation')
      );

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(500);
    });
  });
});