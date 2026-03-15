import { RateLimiterMemory } from 'rate-limiter-flexible';
declare const rateLimiters: {
    general: RateLimiterMemory;
    gameAction: RateLimiterMemory;
    roomCreate: RateLimiterMemory;
    auth: RateLimiterMemory;
};
export type RateLimitType = keyof typeof rateLimiters;
export declare function checkRateLimit(socketId: string, type: RateLimitType): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfter?: number;
}>;
export declare function withRateLimit(type: RateLimitType): (socketId: string, callback: () => void | Promise<void>) => Promise<boolean>;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map