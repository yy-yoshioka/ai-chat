import { prisma } from '@shared/database/prisma';
import { hashPassword, verifyPassword } from '@shared/utils/password';
import { User } from '@prisma/client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<Omit<User, 'password'>> {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Return user data (excluding password)
    const { password: _password, ...userData } = user;
    return userData;
  }

  /**
   * Register a new user
   */
  async signup(data: SignupData): Promise<Omit<User, 'password'>> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
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

    // Return user data (excluding password)
    const { password: _password, ...userData } = user;
    return userData;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // Return user data (excluding password)
    const { password: _password, ...userData } = user;
    return userData;
  }
}

export const authService = new AuthService();
