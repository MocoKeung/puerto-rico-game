"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGameEvents = handleGameEvents;
const roomManager_js_1 = require("../game/roomManager.js");
const engine_js_1 = require("../game/engine.js");
const logger_js_1 = require("../utils/logger.js");
function handleGameEvents(socket, io) {
    // Start game
    socket.on('start-game', (roomId) => {
        logger_js_1.logger.info(`Start game request for room ${roomId}`);
        const room = roomManager_js_1.roomManager.getRoom(roomId);
        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }
        const playerId = socket.playerId;
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
        const engine = new engine_js_1.GameEngine(room);
        const gameState = engine.initializeGame();
        if (gameState) {
            io.to(roomId).emit('gameStarted', gameState);
            io.to(roomId).emit('gameStateUpdate', gameState);
            logger_js_1.logger.info(`Game started in room ${roomId}`);
        }
        else {
            socket.emit('error', 'Failed to start game');
        }
    });
    // Select role
    socket.on('select-role', (roomId, roleType) => {
        logger_js_1.logger.info(`Select role request: ${roleType} for room ${roomId}`);
        const room = roomManager_js_1.roomManager.getRoom(roomId);
        if (!room || !room.gameState) {
            socket.emit('error', 'Game not available');
            return;
        }
        const playerId = socket.playerId;
        if (!playerId) {
            socket.emit('error', 'Not authenticated');
            return;
        }
        const engine = new engine_js_1.GameEngine(room);
        const success = engine.selectRole(playerId, roleType);
        if (success) {
            const gameState = engine.getState();
            io.to(roomId).emit('roleSelected', { playerId, role: roleType });
            io.to(roomId).emit('gameStateUpdate', gameState);
        }
        else {
            socket.emit('error', 'Failed to select role');
        }
    });
    // Perform action
    socket.on('perform-action', (roomId, action) => {
        logger_js_1.logger.info(`Perform action request for room ${roomId}`, action);
        const room = roomManager_js_1.roomManager.getRoom(roomId);
        if (!room || !room.gameState) {
            socket.emit('error', 'Game not available');
            return;
        }
        const playerId = socket.playerId;
        if (!playerId) {
            socket.emit('error', 'Not authenticated');
            return;
        }
        // Set player ID on action
        action.playerId = playerId;
        const engine = new engine_js_1.GameEngine(room);
        const success = engine.performAction(action);
        if (success) {
            const gameState = engine.getState();
            io.to(roomId).emit('actionPerformed', { playerId, action });
            io.to(roomId).emit('gameStateUpdate', gameState);
        }
        else {
            socket.emit('error', 'Failed to perform action');
        }
    });
    // Get current game state
    socket.on('get-game-state', (roomId) => {
        const room = roomManager_js_1.roomManager.getRoom(roomId);
        if (room && room.gameState) {
            socket.emit('gameStateUpdate', room.gameState);
        }
    });
}
//# sourceMappingURL=gameHandler.js.map