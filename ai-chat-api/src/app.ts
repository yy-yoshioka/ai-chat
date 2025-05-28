import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import faqRoutes from './routes/faqs';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import { prisma } from './lib/prisma';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (_req, res) => {
  res.send('Hello from Express + TypeScript!');
});

// Auth routes - add /api prefix
app.use('/auth', authRoutes);
app.use('/faqs', faqRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);

// For checking that Prisma is connected
app.get('/debug/db', async (_req, res) => {
  try {
    // Count users in the database
    const count = await prisma.user.count();
    res.json({ message: 'Database connection working', userCount: count });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

export default app;
