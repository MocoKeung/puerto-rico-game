// Structured logging with Winston
import winston from 'winston';

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    service: 'puerto-rico-game-server',
    pid: process.pid,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        devFormat
      ),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: combine(timestamp(), json()),
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: combine(timestamp(), json()),
  }));
}

// Game-specific logging helper
export function logGameEvent(
  event: string,
  roomId: string,
  playerId: string,
  details?: Record<string, unknown>
) {
  logger.info(`Game event: ${event}`, {
    type: 'game_event',
    event,
    roomId,
    playerId,
    ...details,
  });
}

// Security logging helper
export function logSecurityEvent(
  event: string,
  socketId: string,
  details?: Record<string, unknown>
) {
  logger.warn(`Security event: ${event}`, {
    type: 'security_event',
    event,
    socketId,
    ...details,
  });
}

// Error logging helper with stack trace
export function logError(
  error: Error,
  context?: Record<string, unknown>
) {
  logger.error(error.message, {
    type: 'error',
    stack: error.stack,
    ...context,
  });
}
