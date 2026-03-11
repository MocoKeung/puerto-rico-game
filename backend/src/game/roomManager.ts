// In-memory room storage
import { Room, Player } from '../types/index.js';
import { logger } from '../utils/logger.js';

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string, maxPlayers: number = 5): Room {
    const room: Room = {
      id: roomId,
      players: [],
      gameState: null,
      maxPlayers,
      isGameStarted: false
    };
    this.rooms.set(roomId, room);
    logger.info(`Room created: ${roomId}`);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): boolean {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      logger.info(`Room deleted: ${roomId}`);
    }
    return deleted;
  }

  addPlayer(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      logger.error(`Room not found: ${roomId}`);
      return false;
    }
    if (room.players.length >= room.maxPlayers) {
      logger.error(`Room ${roomId} is full`);
      return false;
    }
    if (room.isGameStarted) {
      logger.error(`Game already started in room ${roomId}`);
      return false;
    }
    room.players.push(player);
    logger.info(`Player ${player.name} joined room ${roomId}`);
    return true;
  }

  removePlayer(roomId: string, socketId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return null;

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    logger.info(`Player ${player.name} left room ${roomId}`);

    // Clean up empty rooms or rooms with no players
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
    }

    return player;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }
}

export const roomManager = new RoomManager();
