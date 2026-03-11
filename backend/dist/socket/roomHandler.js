"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoomEvents = handleRoomEvents;
const roomManager_js_1 = require("../game/roomManager.js");
const logger_js_1 = require("../utils/logger.js");
const crypto_1 = require("crypto");
function handleRoomEvents(socket, io) {
    // Create room
    socket.on('create-room', (roomId, playerName) => {
        logger_js_1.logger.info(`Create room request: ${roomId} by ${playerName}`);
        if (!roomId || !playerName) {
            socket.emit('error', 'Room ID and player name are required');
            return;
        }
        if (roomManager_js_1.roomManager.roomExists(roomId)) {
            socket.emit('error', 'Room already exists');
            return;
        }
        // Create room
        const room = roomManager_js_1.roomManager.createRoom(roomId);
        // Create player
        const player = {
            id: (0, crypto_1.randomUUID)(),
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
        roomManager_js_1.roomManager.addPlayer(roomId, player);
        // Store player info on socket
        socket.playerId = player.id;
        socket.roomId = roomId;
        socket.emit('roomJoined', room);
        socket.to(roomId).emit('playerJoined', player);
        logger_js_1.logger.info(`Room ${roomId} created by player ${playerName}`);
    });
    // Join room
    socket.on('join-room', (roomId, playerName) => {
        logger_js_1.logger.info(`Join room request: ${roomId} by ${playerName}`);
        if (!roomId || !playerName) {
            socket.emit('error', 'Room ID and player name are required');
            return;
        }
        const room = roomManager_js_1.roomManager.getRoom(roomId);
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
        const player = {
            id: (0, crypto_1.randomUUID)(),
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
        roomManager_js_1.roomManager.addPlayer(roomId, player);
        // Store player info on socket
        socket.playerId = player.id;
        socket.roomId = roomId;
        socket.emit('roomJoined', room);
        socket.to(roomId).emit('playerJoined', player);
        logger_js_1.logger.info(`Player ${playerName} joined room ${roomId}`);
    });
    // Leave room / Disconnect
    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        if (roomId) {
            const playerId = socket.playerId;
            const player = roomManager_js_1.roomManager.removePlayer(roomId, socket.id);
            if (player) {
                io.to(roomId).emit('playerLeft', player.id);
                logger_js_1.logger.info(`Player ${player.name} left room ${roomId}`);
            }
        }
    });
    // Handle explicit leave
    socket.on('leave-room', () => {
        const roomId = socket.roomId;
        if (roomId) {
            const player = roomManager_js_1.roomManager.removePlayer(roomId, socket.id);
            if (player) {
                socket.leave(roomId);
                io.to(roomId).emit('playerLeft', player.id);
                logger_js_1.logger.info(`Player ${player.name} left room ${roomId}`);
            }
            delete socket.playerId;
            delete socket.roomId;
        }
    });
}
//# sourceMappingURL=roomHandler.js.map