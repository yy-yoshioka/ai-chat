import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { signToken, verifyToken } from '../../../src/utils/jwt';

describe('JWT Utils', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      cookie: jest.fn(),
    };
  });

  describe('signToken', () => {
    it('should sign a token and set cookie', () => {
      const user = { id: '123', email: 'test@example.com', isAdmin: false };

      const token = signToken(user, mockResponse as Response);

      expect(token).toBeDefined();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        token,
        expect.objectContaining({
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: false, // NODE_ENV is test
          sameSite: 'lax',
        })
      );
    });

    it('should set secure cookie in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const user = { id: '123', email: 'test@example.com' };
      signToken(user, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        expect.any(String),
        expect.objectContaining({
          secure: true,
          sameSite: 'strict',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should throw error if JWT_SECRET is not defined', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => {
        signToken(
          { id: '123', email: 'test@example.com' },
          mockResponse as Response
        );
      }).toThrow('JWT_SECRET is not defined');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);

      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const token = jwt.sign(
        { id: '123', email: 'test@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' }
      );

      expect(() => {
        verifyToken(token);
      }).toThrow('Invalid token');
    });

    it('should throw error if JWT_SECRET is not defined', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => {
        verifyToken('some-token');
      }).toThrow('JWT_SECRET is not defined');

      process.env.JWT_SECRET = originalSecret;
    });
  });
});
