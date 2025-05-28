import app from './app';

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0'; // Allow external connections in Docker

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
