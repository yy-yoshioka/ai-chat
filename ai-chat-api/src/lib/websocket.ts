import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  widgetKey?: string;
}

interface ChatMessageData {
  message: string;
  conversationId?: string;
}

interface TypingData {
  isTyping: boolean;
}

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      const widgetKey = socket.handshake.auth.widgetKey;

      if (token) {
        // Authenticated user
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
        };
        socket.userId = decoded.userId;
      } else if (widgetKey) {
        // Widget user
        const widget = await prisma.widget.findUnique({
          where: { widgetKey, isActive: true },
        });

        if (!widget) {
          return next(new Error('Invalid widget key'));
        }

        socket.widgetKey = widgetKey;
      } else {
        return next(new Error('Authentication required'));
      }

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room based on user type
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    } else if (socket.widgetKey) {
      socket.join(`widget:${socket.widgetKey}`);
    }

    // Handle chat messages
    socket.on('chat:message', async (data: ChatMessageData) => {
      try {
        const { message } = data;

        // Save message to database
        const chatLog = await prisma.chatLog.create({
          data: {
            question: message,
            answer: '', // Will be updated when AI responds
            userId: socket.userId || null,
            widgetId: socket.widgetKey
              ? (
                  await prisma.widget.findUnique({
                    where: { widgetKey: socket.widgetKey },
                  })
                )?.id
              : null,
          },
        });

        // Emit message received confirmation
        socket.emit('chat:message:received', {
          messageId: chatLog.id,
          timestamp: chatLog.createdAt,
        });

        // TODO: Process with AI and emit response
        // This would integrate with your existing AI chat logic

        // Simulate AI response for now
        setTimeout(async () => {
          const aiResponse =
            'This is a WebSocket response. AI integration pending.';

          // Update chat log with AI response
          await prisma.chatLog.update({
            where: { id: chatLog.id },
            data: { answer: aiResponse },
          });

          // Emit AI response
          socket.emit('chat:response', {
            messageId: chatLog.id,
            response: aiResponse,
            timestamp: new Date(),
          });
        }, 1000);
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('chat:error', {
          error: 'Failed to process message',
        });
      }
    });

    // Handle typing indicators
    socket.on('chat:typing', (data: TypingData) => {
      const room = socket.userId
        ? `user:${socket.userId}`
        : `widget:${socket.widgetKey}`;
      socket.to(room).emit('chat:typing', {
        userId: socket.userId || 'anonymous',
        isTyping: data.isTyping,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
