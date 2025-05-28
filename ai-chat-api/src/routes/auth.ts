import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { signToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /auth/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    // Simple validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT and set cookie
    signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin }, res);

    // Return user data (excluding password)
    const { password: _password, ...userData } = user;
    res.status(200).json({
      message: 'Login successful',
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/signup - User registration
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Simple validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    // Generate JWT and set cookie
    signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin }, res);

    // Return user data (excluding password)
    const { password: _password, ...userData } = user;
    res.status(201).json({
      message: 'User created successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /auth/me - Get current user info (protected route)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user from database using the ID from JWT
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (excluding password)
    const { password: _password, ...userData } = user;
    res.status(200).json({
      message: 'User authenticated',
      user: userData,
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
