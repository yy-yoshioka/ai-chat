import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../../src/middleware/auth';
import { prisma } from '../../../src/lib/prisma';

// Mock prisma
jest.mock('../../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate valid token', async () => {
    const userId = 'test-user-id';
    const token = jwt.sign(
      { id: userId, email: 'test@example.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    mockRequest.cookies = { token: token };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      email: 'test@example.com',
      roles: ['viewer'],
    });

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { id: true, email: true, roles: true },
    });
    expect(mockRequest.user).toEqual(
      expect.objectContaining({
        id: userId,
        email: 'test@example.com',
        roles: ['viewer'],
      })
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject request without token', async () => {
    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    mockRequest.cookies = { token: 'invalid-token' };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject expired token', async () => {
    // Create an actually expired token
    const token = jwt.sign(
      { id: 'test-user-id', email: 'test@example.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '-1s' } // Expired 1 second ago
    );

    mockRequest.cookies = { token: token };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token expired' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject token for non-existent user', async () => {
    const token = jwt.sign(
      { id: 'non-existent', email: 'test@example.com' },
      process.env.JWT_SECRET!
    );

    mockRequest.cookies = { token: token };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    const token = jwt.sign(
      { id: 'test-user-id', email: 'test@example.com' },
      process.env.JWT_SECRET!
    );

    mockRequest.cookies = { token: token };
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error('DB Error')
    );

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
