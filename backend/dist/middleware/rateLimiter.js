"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.withRateLimit = withRateLimit;
// Rate limiting for Socket.IO events
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const logger_js_1 = require("../utils/logger.js");
// Rate limiters for different event types
const rateLimiters = {
    // General events: 30 per minute
    general: new rate_limiter_flexible_1.RateLimiterMemory({
        keyPrefix: 'general',
        points: 30,
        duration: 60,
    }),
    // Game actions: 20 per minute
    gameAction: new rate_limiter_flexible_1.RateLimiterMemory({
        keyPrefix: 'game_action',
        points: 20,
        duration: 60,
    }),
    // Room creation: 5 per minute
    roomCreate: new rate_limiter_flexible_1.RateLimiterMemory({
        keyPrefix: 'room_create',
        points: 5,
        duration: 60,
    }),
    // Auth/connection: 10 per minute
    auth: new rate_limiter_flexible_1.RateLimiterMemory({
        keyPrefix: 'auth',
        points: 10,
        duration: 60,
    }),
};
async function checkRateLimit(socketId, type) {
    const limiter = rateLimiters[type];
    try {
        const res = await limiter.consume(socketId, 1);
        return {
            allowed: true,
            remaining: res.remainingPoints,
        };
    }
    catch (rejRes) {
        logger_js_1.logger.warn(`Rate limit exceeded for ${type} by socket ${socketId}`);
        return {
            allowed: false,
            remaining: 0,
            retryAfter: Math.round(rejRes.msBeforeNext / 1000),
        };
    }
}
// Middleware wrapper for socket events
function withRateLimit(type) {
    return async function rateLimitMiddleware(socketId, callback) {
        const result = await checkRateLimit(socketId, type);
        if (!result.allowed) {
            return false;
        }
        await callback();
        return true;
    };
}
//# sourceMappingURL=rateLimiter.js.map