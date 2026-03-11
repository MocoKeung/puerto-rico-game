// Game action handlers
import { Socket } from 'socket.io';
import { roomManager } from '../game/roomManager.js';
import { GameEngine } from '../game/engine.js';
import { Role, GameAction } from '../types/index.js';
import { logger } from '../utils/logger.js';

export function handleGameEvents(socket: Socket, io: any): void {
  // Start game
  socket.on('start-game', (roomId: string) => {
    logger.info(`Start game request for room ${roomId}`);

    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const playerId = (socket as any).playerId;
    if (!playerId || !room.players.some(p => p.id === playerId)) {
      socket.emit('error', 'Not authorized');
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', 'Need at least 2 players');
      return;
    }

    if (room.isGameStarted) {
      socket.emit('error', 'Game already started');
      return;
    }

    const engine = new GameEngine(room);
    const gameState = engine.initializeGame();

    if (gameState) {
      io.to(roomId).emit('gameStarted', gameState);
      io.to(roomId).emit('gameStateUpdate', gameState);
      logger.info(`Game started in room ${roomId}`);
    } else {
      socket.emit('error', 'Failed to start game');
    }
  });

  // Select role
  socket.on('select-role', (roomId: string, roleType: Role) => {
    logger.info(`Select role request: ${roleType} for room ${roomId}`);

    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameState) {
      socket.emit('error', 'Game not available');
      return;
    }

    const playerId = (socket as any).playerId;
    if (!playerId) {
      socket.emit('error', 'Not authenticated');
      return;
    }

    const engine = new GameEngine(room);
    const success = engine.selectRole(playerId, roleType);

    if (success) {
      const gameState = engine.getState();
      io.to(roomId).emit('roleSelected', { playerId, role: roleType });
      io.to(roomId).emit('gameStateUpdate', gameState);
    } else {
      socket.emit('error', 'Failed to select role');
    }
  });

  // Perform action
  socket.on('perform-action', (roomId: string, action: GameAction) => {
    logger.info(`Perform action request for room ${roomId}`, action);

    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameState) {
      socket.emit('error', 'Game not available');
      return;
    }

    const playerId = (socket as any).playerId;
    if (!playerId) {
      socket.emit('error', 'Not authenticated');
      return;
    }

    // Set player ID on action
    action.playerId = playerId;

    const engine = new GameEngine(room);
    const success = engine.performAction(action);

    if (success) {
      const gameState = engine.getState();
      io.to(roomId).emit('actionPerformed', { playerId, action });
      io.to(roomId).emit('gameStateUpdate', gameState);
    } else {
      socket.emit('error', 'Failed to perform action');
    }
  });

  // Get current game state
  socket.on('get-game-state', (roomId: string) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.gameState) {
      socket.emit('gameStateUpdate', room.gameState);
    }
  });
}
