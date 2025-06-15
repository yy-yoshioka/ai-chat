// Initialize Sentry first, before any other imports
import { initSentry } from './lib/sentry';
initSentry();

import { createServer } from 'http';
import app from './app';
import { initializeWebSocket } from './lib/websocket';

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
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

export default server;
