import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import {
  metricsMiddleware,
  errorTrackingMiddleware,
} from './middleware/metrics';
import authRoutes from './routes/auth';
import faqRoutes from './routes/faqs';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import widgetsRoutes from './routes/widgets';
import { widgetLoaderRoutes } from './routes/widgetLoader';
import { prisma } from './lib/prisma';
import { embedRoutes } from './routes/embed';
import { analyticsRoutes } from './routes/analytics';
import { translationRoutes } from './routes/translation';
import { billingRoutes } from './routes/billing';
import { companyRoutes } from './routes/companies';
import organizationsRoutes from './routes/organizations';
import usersRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import reportsRoutes from './routes/reports';
import knowledgeBaseRoutes from './routes/knowledge-base';
import trainingRoutes from './routes/training';
import settingsRoutes from './routes/settings';
import webhooksRoutes from './routes/webhooks';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Add metrics middleware early
app.use(metricsMiddleware);

// Security headers (except for widget loader which needs to be embeddable)
app.use('/widget-loader', (req, res, next) => {
  // Allow widget loader to be embedded in any site
  res.removeHeader('X-Frame-Options');
  next();
});

app.use(
  helmet({
    frameguard: { action: 'sameorigin' }, // Default frame protection
  })
);

// CORS middleware with different configs for different routes
app.use(
  '/api/widgets/:widgetKey',
  cors({
    origin: '*', // Allow any origin for public widget config
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(
  '/api/chat/widget',
  cors({
    origin: '*', // Allow any origin for widget chat
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'X-Widget-Key'],
  })
);

app.use(
  '/widget-loader',
  cors({
    origin: '*', // Allow any origin for widget loader
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
  })
);

// Default CORS for admin/auth routes
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ], // Your frontend URL(s)
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

// Widget loader routes (serve JS files)
app.use('/widget-loader', widgetLoaderRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/widgets', widgetsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/embed', embedRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api', knowledgeBaseRoutes);
app.use('/api', trainingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/v1/settings', settingsRoutes);
app.use('/v1/organizations', organizationsRoutes);
app.use('/v1/widgets', widgetsRoutes);

// Legacy routes (backwards compatibility)
app.use('/auth', authRoutes);
app.use('/faqs', faqRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);

// For checking that Prisma is connected
app.get('/debug/db', async (_req, res) => {
  try {
    // Count users in the database
    const userCount = await prisma.user.count();
    const widgetCount = await prisma.widget.count();
    const companyCount = await prisma.company.count();

    res.json({
      message: 'Database connection working',
      userCount,
      widgetCount,
      companyCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

// ✅ [A] ヘルスチェック
app.get('/health', (_req, res) => res.sendStatus(200));

// Add error tracking middleware at the end
app.use(errorTrackingMiddleware);

export default app;
