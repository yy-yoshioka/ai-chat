// Initialize Sentry first, before any other imports
import { initSentry } from './lib/sentry';
initSentry();

import { createServer } from 'http';
import app from './app';
import { initializeWebSocket } from './lib/websocket';
import { initializeTelemetry } from './lib/telemetry';
import { healthMonitorService } from './services/healthMonitorService';
import { alertService } from './services/alertService';
import { logger } from './lib/logger';

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0'; // Allow external connections in Docker

// Add error handlers for debugging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

const server = httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server initialized`);

  // Initialize telemetry
  initializeTelemetry();

  // Start health monitoring
  const healthCheckInterval = parseInt(
    process.env.HEALTH_CHECK_INTERVAL || '30000'
  );
  healthMonitorService.startMonitoring(healthCheckInterval);
  alertService.startMonitoring(60000); // Check alerts every minute

  logger.info('System health monitoring started', { healthCheckInterval });

  // Schedule cleanup of old metrics data
  setInterval(
    () => {
      healthMonitorService.cleanupOldData(7).catch((error) => {
        logger.error('Failed to cleanup old metrics data', error);
      });
    },
    24 * 60 * 60 * 1000
  ); // Run daily
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  // Stop monitoring
  healthMonitorService.stopMonitoring();
  alertService.stopMonitoring();

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default server;
