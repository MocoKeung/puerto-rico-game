// Enhanced room manager with auto-cleanup and reconnection support
import { Room, Player } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';
import { randomUUID } from 'crypto';

interface DisconnectedPlayer {
  player: Player;
  roomId: string;
  disconnectedAt: number;
  reconnectTimeout: NodeJS.Timeout;
}

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private disconnectedPlayers: Map<string, DisconnectedPlayer> = new Map(); // socketId -> DisconnectedPlayer
  private playerSessions: Map<string, string> = new Map(); // playerId -> socketId
  
  // Configuration
  private readonly RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly ROOM_INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  createRoom(roomId: string, maxPlayers: number = 5, password?: string): Room {
    const room: Room = {
      id: roomId,
      players: [],
      gameState: null,
      maxPlayers,
      isGameStarted: false,
      password: password || undefined,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    this.rooms.set(roomId, room);
    logger.info(`Room created: ${roomId}`, { maxPlayers, hasPassword: !!password });
    metrics.trackEvent('room_created', { roomId, maxPlayers });
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      // Clear any disconnect timeouts for players in this room
      for (const [socketId, data] of this.disconnectedPlayers.entries()) {
        if (data.roomId === roomId) {
          clearTimeout(data.reconnectTimeout);
          this.disconnectedPlayers.delete(socketId);
        }
      }
    }
    
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      logger.info(`Room deleted: ${roomId}`);
      metrics.trackEvent('room_deleted', { roomId });
    }
    return deleted;
  }

  validatePassword(roomId: string, password?: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (!room.password) return true;
    return room.password === password;
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
    room.lastActivity = Date.now();
    this.playerSessions.set(player.id, player.socketId);
    logger.info(`Player ${player.name} joined room ${roomId}`);
    metrics.trackEvent('player_joined', { roomId, playerId: player.id });
    return true;
  }

  removePlayer(roomId: string, socketId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return null;

    const player = room.players[playerIndex];
    
    // If game is in progress, mark player as disconnected instead of removing
    if (room.isGameStarted) {
      this.handleDisconnection(socketId, player, roomId);
      return player;
    }

    // Otherwise, remove player from room
    room.players.splice(playerIndex, 1);
    room.lastActivity = Date.now();
    this.playerSessions.delete(player.id);
    logger.info(`Player ${player.name} left room ${roomId}`);
    metrics.trackEvent('player_left', { roomId, playerId: player.id });

    // Clean up empty rooms
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
    }

    return player;
  }

  private handleDisconnection(socketId: string, player: Player, roomId: string): void {
    // Set reconnection timeout
    const reconnectTimeout = setTimeout(() => {
      this.handleReconnectTimeout(socketId);
    }, this.RECONNECT_TIMEOUT);

    this.disconnectedPlayers.set(socketId, {
      player,
      roomId,
      disconnectedAt: Date.now(),
      reconnectTimeout,
    });

    logger.info(`Player ${player.name} disconnected from room ${roomId} - waiting for reconnection`, {
      playerId: player.id,
      reconnectTimeout: this.RECONNECT_TIMEOUT,
    });
  }

  private handleReconnectTimeout(socketId: string): void {
    const disconnected = this.disconnectedPlayers.get(socketId);
    if (!disconnected) return;

    const { player, roomId } = disconnected;
    const room = this.rooms.get(roomId);

    if (room) {
      // Remove player from room
      const playerIndex = room.players.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        logger.info(`Player ${player.name} removed from room ${roomId} after reconnection timeout`);
        metrics.trackEvent('player_left', { roomId, playerId: player.id, reason: 'timeout' });
      }

      // If room is empty, delete it
      if (room.players.length === 0) {
        this.deleteRoom(roomId);
      }
    }

    this.disconnectedPlayers.delete(socketId);
    this.playerSessions.delete(player.id);
  }

  // Attempt to reconnect a player
  tryReconnect(playerId: string, newSocketId: string): { success: boolean; room?: Room; player?: Player } {
    const oldSocketId = this.playerSessions.get(playerId);
    if (!oldSocketId) {
      return { success: false };
    }

    const disconnected = this.disconnectedPlayers.get(oldSocketId);
    if (!disconnected) {
      return { success: false };
    }

    // Clear reconnection timeout
    clearTimeout(disconnected.reconnectTimeout);
    this.disconnectedPlayers.delete(oldSocketId);

    // Update player socket ID
    const room = this.rooms.get(disconnected.roomId);
    if (room) {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.socketId = newSocketId;
        room.lastActivity = Date.now();
        this.playerSessions.set(playerId, newSocketId);
        logger.info(`Player ${player.name} reconnected to room ${room.id}`);
        return { success: true, room, player };
      }
    }

    return { success: false };
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  getDisconnectedPlayers(): string[] {
    return Array.from(this.disconnectedPlayers.keys());
  }

  // Update room activity timestamp
  updateRoomActivity(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.lastActivity = Date.now();
    }
  }

  // Cleanup inactive rooms and expired reconnections
  private cleanup(): void {
    const now = Date.now();
    let cleanedRooms = 0;
    let cleanedReconnects = 0;

    // Clean up inactive rooms
    for (const [roomId, room] of this.rooms.entries()) {
      // Skip rooms with active games
      if (room.isGameStarted) continue;
      
      // Check if room has been inactive
      if (now - room.lastActivity > this.ROOM_INACTIVE_TIMEOUT) {
        this.deleteRoom(roomId);
        cleanedRooms++;
        logger.info(`Inactive room cleaned up: ${roomId}`);
      }
    }

    // Clean up expired reconnections (shouldn't happen with timeouts, but just in case)
    for (const [socketId, data] of this.disconnectedPlayers.entries()) {
      if (now - data.disconnectedAt > this.RECONNECT_TIMEOUT) {
        clearTimeout(data