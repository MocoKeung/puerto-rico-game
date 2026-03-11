// Socket event handlers registry
import { Server, Socket } from 'socket.io';
import { handleRoomEvents } from './roomHandler.js';
import { handleGameEvents } from './gameHandler.js';
import { logger } from '../utils/logger.js';

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Handle room events
    handleRoomEvents(socket, io);

    // Handle game events
    handleGameEvents(socket, io);

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    // Ping/Pong for connection health
    socket.on('ping', (callback) => {
      callback('pong');
    });
  });
}
