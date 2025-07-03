import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { loadModules, cleanupModules } from '@shared/moduleLoader';
import { prisma } from '@shared/database/prisma';
import { initSentry } from '@shared/config/sentry';
import { logger } from '@shared/logger';
import {
  metricsMiddleware,
  errorTrackingMiddleware,
} from './middleware/metrics';
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';

// Load environment variables
dotenv.config();

// Initialize Sentry
initSentry();

// Create Express app
export const app = express();

// Basic middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https:',
          'http:',
        ],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:'],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", 'https:'],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request tracking middleware
app.use(requestIdMiddleware);

// Metrics middleware
app.use(metricsMiddleware);
app.use(errorTrackingMiddleware);

// Health check (before auth)
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res
      .status(503)
      .json({ status: 'error', message: 'Database connection failed' });
  }
});

// Initialize and load all modules
async function initializeApp() {
  try {
    await loadModules(app);
    logger.info('All modules loaded successfully');

    // Special routes that need to be registered separately
    // These are routes that don't follow the standard /api/{module} pattern

    // Widget loader route (public)
    const { widgetLoaderRoutes } = await import('./routes/widgetLoader');
    app.use('/widget', widgetLoaderRoutes);

    // Embed route (public)
    const { embedRoutes } = await import('./routes/embed');
    app.use('/embed', embedRoutes);

    // Stripe webhook (must be before body parser for raw body)
    const stripeWebhookRoute = await import('./routes/stripe-webhook');
    app.use('/stripe', stripeWebhookRoute.default);
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    throw error;
  }
}

// Initialize the app
initializeApp().catch((error) => {
  logger.error('Fatal error during app initialization:', error);
  process.exit(1);
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await cleanupModules();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await cleanupModules();
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
