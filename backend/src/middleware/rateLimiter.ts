// Rate limiting for Socket.IO events
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger.js';

// Rate limiters for different event types
const rateLimiters = {
  // General events: 30 per minute
  general: new RateLimiterMemory({
    keyPrefix: 'general',
    points: 30,
    duration: 60,
  }),
  // Game actions: 20 per minute
  gameAction: new RateLimiterMemory({
    keyPrefix: 'game_action',
    points: 20,
    duration: 60,
  }),
  // Room creation: 5 per minute
  roomCreate: new RateLimiterMemory({
    keyPrefix: 'room_create',
    points: 5,
    duration: 60,
  }),
  // Auth/connection: 10 per minute
  auth: new RateLimiterMemory({
    keyPrefix: 'auth',
    points: 10,
    duration: 60,
  }),
};

export type RateLimitType = keyof typeof rateLimiters;

export async function checkRateLimit(
  socketId: string,
  type: RateLimitType
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  const limiter = rateLimiters[type];
  
  try {
    const res = await limiter.consume(socketId, 1);
    return {
      allowed: true,
      remaining: res.remainingPoints,
    };
  } catch (rejRes: any) {
    logger.warn(`Rate limit exceeded for ${type} by socket ${socketId}`);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.round(rejRes.msBeforeNext / 1000),
    };
  }
}

// Middleware wrapper for socket events
export function withRateLimit(type: RateLimitType) {
  return async function rateLimitMiddleware(
    socketId: string,
    callback: () => void | Promise<void>
  ): Promise<boolean> {
    const result = await checkRateLimit(socketId, type);
    
    if (!result.allowed) {
      return false;
    }
    
    await callback();
    return true;
  };
}
