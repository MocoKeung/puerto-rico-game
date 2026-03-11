"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = setupSocketHandlers;
const roomHandler_js_1 = require("./roomHandler.js");
const gameHandler_js_1 = require("./gameHandler.js");
const logger_js_1 = require("../utils/logger.js");
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        logger_js_1.logger.info(`Socket connected: ${socket.id}`);
        // Handle room events
        (0, roomHandler_js_1.handleRoomEvents)(socket, io);
        // Handle game events
        (0, gameHandler_js_1.handleGameEvents)(socket, io);
        // Handle disconnect
        socket.on('disconnect', () => {
            logger_js_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
        // Ping/Pong for connection health
        socket.on('ping', (callback) => {
            callback('pong');
        });
    });
}
//# sourceMappingURL=index.js.map