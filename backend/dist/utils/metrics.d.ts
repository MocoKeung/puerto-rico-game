import { EventEmitter } from 'events';
type EventType = 'socket_connected' | 'socket_disconnected' | 'room_created' | 'room_deleted' | 'player_joined' | 'player_left' | 'game_started' | 'game_ended' | 'action_performed' | 'error_occurred';
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
declare class MetricsCollector extends EventEmitter {
    private events;
    private connectionMetrics;
    private roomMetrics;
    private gameStartTimes;
    private errorCounts;
    trackEvent(type: EventType, data?: Record<string, unknown>): void;
    private updateCounters;
    getMetricsSnapshot(): {
        connections: ConnectionMetrics;
        rooms: RoomMetrics;
        errors: Record<string, number>;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        timestamp: string;
    };
    getRecentEvents(count?: number): MetricEvent[];
    getEventsInRange(startTime: number, endTime: number): MetricEvent[];
    cleanupOldEvents(): void;
    getErrorSummary(): {
        total: number;
        breakdown: Record<string, number>;
    };
}
export declare const metrics: MetricsCollector;
export declare function getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
};
export {};
//# sourceMappingURL=metrics.d.ts.map