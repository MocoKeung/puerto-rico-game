"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomManager = void 0;
const logger_js_1 = require("../utils/logger.js");
class RoomManager {
    rooms = new Map();
    createRoom(roomId, maxPlayers = 5) {
        const room = {
            id: roomId,
            players: [],
            gameState: null,
            maxPlayers,
            isGameStarted: false
        };
        this.rooms.set(roomId, room);
        logger_js_1.logger.info(`Room created: ${roomId}`);
        return room;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    deleteRoom(roomId) {
        const deleted = this.rooms.delete(roomId);
        if (deleted) {
            logger_js_1.logger.info(`Room deleted: ${roomId}`);
        }
        return deleted;
    }
    addPlayer(roomId, player) {
        const room = this.rooms.get(roomId);
        if (!room) {
            logger_js_1.logger.error(`Room not found: ${roomId}`);
            return false;
        }
        if (room.players.length >= room.maxPlayers) {
            logger_js_1.logger.error(`Room ${roomId} is full`);
            return false;
        }
        if (room.isGameStarted) {
            logger_js_1.logger.error(`Game already started in room ${roomId}`);
            return false;
        }
        room.players.push(player);
        logger_js_1.logger.info(`Player ${player.name} joined room ${roomId}`);
        return true;
    }
    removePlayer(roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const playerIndex = room.players.findIndex(p => p.socketId === socketId);
        if (playerIndex === -1)
            return null;
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        logger_js_1.logger.info(`Player ${player.name} left room ${roomId}`);
        // Clean up empty rooms or rooms with no players
        if (room.players.length === 0) {
            this.deleteRoom(roomId);
        }
        return player;
    }
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    roomExists(roomId) {
        return this.rooms.has(roomId);
    }
}
exports.roomManager = new RoomManager();
//# sourceMappingURL=roomManager.js.map