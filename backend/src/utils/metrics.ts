// Metrics and monitoring utilities
import { EventEmitter } from 'events';

type EventType = 
  | 'socket_connected'
  | 'socket_disconnected'
  | 'room_created'
  | 'room_deleted'
  | 'player_joined'
  | 'player_left'
  | 'game_started'
  | 'game_ended'
  | 'action_performed'
  | 'error_occurred';

interface MetricEvent {
  type: EventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  peakConnections: number;
  disconnections: number;
}

interface RoomMetrics {
  totalRoomsCreated: number;
  activeRooms: number;
  totalGamesPlayed: number;
  averageGameDuration: number;
}

class MetricsCollector extends EventEmitter {
  private events: MetricEvent[] = [];
  private connectionMetrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    peakConnections: 0,
    disconnections: 0,
  };
  private roomMetrics: RoomMetrics = {
    totalRoomsCreated: 0,
    activeRooms: 0,
    totalGamesPlayed: 0,
    averageGameDuration: 0,
  };
  private gameStartTimes: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();

  // Track metrics from event
  trackEvent(type: EventType, data?: Record<string, unknown>): void {
    const event: MetricEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    this.events.push(event);
    this.emit('metric', event);

    // Update specific counters
    this.updateCounters(type, data);
  }

  private updateCounters(type: EventType, data?: Record<string, unknown>): void {
    switch (type) {
      case 'socket_connected':
        this.connectionMetrics.totalConnections++;
        this.connectionMetrics.activeConnections++;
        if (this.connectionMetrics.activeConnections > this.connectionMetrics.peakConnections) {
          this.connectionMetrics.peakConnections = this.connectionMetrics.activeConnections;
        }
        break;
      
      case 'socket_disconnected':
        this.connectionMetrics.activeConnections = Math.max(0, this.connectionMetrics.activeConnections - 1);
        this.connectionMetrics.disconnections++;
        break;
      
      case 'room_created':
        this.roomMetrics.totalRoomsCreated++;
        this.roomMetrics.activeRooms++;
        break;
      
      case 'room_deleted':
        this.roomMetrics.activeRooms = Math.max(0, this.roomMetrics.activeRooms - 1);
        break;
      
      case 'game_started':
        this.roomMetrics.totalGamesPlayed++;
        if (data?.roomId) {
          this.gameStartTimes.set(data.roomId as string, Date.now());
        }
        break;
      
      case 'game_ended':
        if (data?.roomId && this.gameStartTimes.has(data.roomId as string)) {
          const startTime = this.gameStartTimes.get(data.roomId as string)!;
          const duration = Date.now() - startTime;
          this.gameStartTimes.delete(data.roomId as string);
          
          // Update average game duration
          const totalGames = this.roomMetrics.totalGamesPlayed;
          const currentAvg = this.roomMetrics.averageGameDuration;
          this.roomMetrics.averageGameDuration = 
            ((currentAvg * (totalGames - 1)) + duration) / totalGames;
        }
        break;
      
      case 'error_occurred':
        const errorType = (data?.errorType as string) || 'unknown';
        this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1);
        break;
    }
  }

  // Get current metrics snapshot
  getMetricsSnapshot(): {
    connections: ConnectionMetrics;
    rooms: RoomMetrics;
    errors: Record<string, number>;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    timestamp: string;
  } {
    return {
      connections: { ...this.connectionMetrics },
      rooms: { ...this.roomMetrics },
      errors: Object.fromEntries(this.errorCounts),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  // Get event history (last N events)
  getRecentEvents(count: number = 100): MetricEvent[] {
    return this.events.slice(-count);
  }

  // Get events by time range
  getEventsInRange(startTime: number, endTime: number): MetricEvent[] {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  // Clear old events (keep last 24 hours worth)
  cleanupOldEvents(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp > cutoff);
  }

  // Get error summary
  getErrorSummary(): { total: number; breakdown: Record<string, number> } {
    const total = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    return {
      total,
      breakdown: Object.fromEntries(this.errorCounts),
    };
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Health check helper
export function getHealthStatus(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
} {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

  const checks = {
    memory: heapUsagePercent < 90,
    uptime: process.uptime() > 0,
    connections: metrics.getMetricsSnapshot().connections.activeConnections >= 0,
  };

  const allHealthy = Object.values(checks).every(v => v);
  const status = allHealthy ? 'healthy' : heapUsagePercent > 95 ? 'unhealthy' : 'degraded';

  return { status, checks };
}
