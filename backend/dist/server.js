"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express + Socket.IO server entry
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./socket/index.js");
const roomManager_js_1 = require("./game/roomManager.js");
const logger_js_1 = require("./utils/logger.js");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Configure CORS
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
// Parse JSON
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        rooms: roomManager_js_1.roomManager.getAllRooms().length,
        uptime: process.uptime()
    });
});
// Get rooms info
app.get('/api/rooms', (req, res) => {
    const rooms = roomManager_js_1.roomManager.getAllRooms().map(r => ({
        id: r.id,
        playerCount: r.players.length,
        maxPlayers: r.maxPlayers,
        isGameStarted: r.isGameStarted
    }));
    res.json(rooms);
});
// Setup Socket.IO
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
// Setup socket handlers
(0, index_js_1.setupSocketHandlers)(io);
// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    logger_js_1.logger.info(`🚀 Puerto Rico Game Server running on port ${PORT}`);
    logger_js_1.logger.info(`Health check: http://localhost:${PORT}/health`);
});
// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger_js_1.logger.info('SIGTERM received, shutting down gracefully');
    io.close(() => {
        httpServer.close(() => {
            process.exit(0);
        });
    });
});
process.on('SIGINT', () => {
    logger_js_1.logger.info('SIGINT received, shutting down gracefully');
    io.close(() => {
        httpServer.close(() => {
            process.exit(0);
        });
    });
});
//# sourceMappingURL=server.js.map