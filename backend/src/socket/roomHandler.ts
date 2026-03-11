// Room create/join/leave logic
import { Socket } from 'socket.io';
import { roomManager } from '../game/roomManager.js';
import { Player } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

export function handleRoomEvents(socket: Socket, io: any): void {
  // Create room
  socket.on('create-room', (roomId: string, playerName: string) => {
    logger.info(`Create room request: ${roomId} by ${playerName}`);

    if (!roomId || !playerName) {
      socket.emit('error', 'Room ID and player name are required');
      return;
    }

    if (roomManager.roomExists(roomId)) {
      socket.emit('error', 'Room already exists');
      return;
    }

    // Create room
    const room = roomManager.createRoom(roomId);

    // Create player
    const player: Player = {
      id: randomUUID(),
      name: playerName,
      socketId: socket.id,
      color: '',
      doubloons: 0,
      colonists: 0,
      colonistsOnBoard: 0,
      victoryPoints: 0,
      plantations: [],
      buildings: [],
      resources: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
      shippedGoods: []
    };

    // Join room
    socket.join(roomId);
    roomManager.addPlayer(roomId, player);

    // Store player info on socket
    (socket as any).playerId = player.id;
    (socket as any).roomId = roomId;

    socket.emit('roomJoined', room);
    socket.to(roomId).emit('playerJoined', player);

    logger.info(`Room ${roomId} created by player ${playerName}`);
  });

  // Join room
  socket.on('join-room', (roomId: string, playerName: string) => {
    logger.info(`Join room request: ${roomId} by ${playerName}`);

    if (!roomId || !playerName) {
      socket.emit('error', 'Room ID and player name are required');
      return;
    }

    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.isGameStarted) {
      socket.emit('error', 'Game already started');
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', 'Room is full');
      return;
    }

    // Create player
    const player: Player = {
      id: randomUUID(),
      name: playerName,
      socketId: socket.id,
      color: '',
      doubloons: 0,
      colonists: 0,
      colonistsOnBoard: 0,
      victoryPoints: 0,
      plantations: [],
      buildings: [],
      resources: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
      shippedGoods: []
    };

    // Join room
    socket.join(roomId);
    roomManager.addPlayer(roomId, player);

    // Store player info on socket
    (socket as any).playerId = player.id;
    (socket as any).roomId = roomId;

    socket.emit('roomJoined', room);
    socket.to(roomId).emit('playerJoined', player);

    logger.info(`Player ${playerName} joined room ${roomId}`);
  });

  // Leave room / Disconnect
  socket.on('disconnect', () => {
    const roomId = (socket as any).roomId;
    if (roomId) {
      const playerId = (socket as any).playerId;
      const player = roomManager.removePlayer(roomId, socket.id);

      if (player) {
        io.to(roomId).emit('playerLeft', player.id);
        logger.info(`Player ${player.name} left room ${roomId}`);
      }
    }
  });

  // Handle explicit leave
  socket.on('leave-room', () => {
    const roomId = (socket as any).roomId;
    if (roomId) {
      const player = roomManager.removePlayer(roomId, socket.id);

      if (player) {
        socket.leave(roomId);
        io.to(roomId).emit('playerLeft', player.id);
        logger.info(`Player ${player.name} left room ${roomId}`);
      }

      delete (socket as any).playerId;
      delete (socket as any).roomId;
    }
  });
}
