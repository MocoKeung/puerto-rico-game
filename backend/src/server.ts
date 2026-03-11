// Express + Socket.IO server entry
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/index.js';
import { roomManager } from './game/roomManager.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rooms: roomManager.getAllRooms().length,
    uptime: process.uptime()
  });
});

// Get rooms info
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getAllRooms().map(r => ({
    id: r.id,
    playerCount: r.players.length,
    maxPlayers: r.maxPlayers,
    isGameStarted: r.isGameStarted
  }));
  res.json(rooms);
});

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Setup socket handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Puerto Rico Game Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
});
