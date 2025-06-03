import app from './app';

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

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

export default server;
