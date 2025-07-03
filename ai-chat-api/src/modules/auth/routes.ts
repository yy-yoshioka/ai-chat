import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { signToken } from '@shared/utils/jwt';
import { authService } from './services/authService';

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

    // Authenticate user
    const userData = await authService.login({ email, password });

    // Generate JWT and set cookie
    signToken(
      { id: userData.id, email: userData.email, isAdmin: userData.isAdmin },
      res
    );
    res.status(200).json({
      message: 'Login successful',
      user: userData,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: error.message });
    }
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

    // Register new user
    const userData = await authService.signup({ email, password, name });

    // Generate JWT and set cookie
    signToken(
      { id: userData.id, email: userData.email, isAdmin: userData.isAdmin },
      res
    );
    res.status(201).json({
      message: 'User created successfully',
      user: userData,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /auth/me - Get current user info (protected route)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user from database using the ID from JWT
    const userData = await authService.getUserById(req.user?.id!);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
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
