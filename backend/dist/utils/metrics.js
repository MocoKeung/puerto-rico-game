"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = void 0;
exports.getHealthStatus = getHealthStatus;
// Metrics and monitoring utilities
const events_1 = require("events");
class MetricsCollector extends events_1.EventEmitter {
    events = [];
    connectionMetrics = {
        totalConnections: 0,
        activeConnections: 0,
        peakConnections: 0,
        disconnections: 0,
    };
    roomMetrics = {
        totalRoomsCreated: 0,
        activeRooms: 0,
        totalGamesPlayed: 0,
        averageGameDuration: 0,
    };
    gameStartTimes = new Map();
    errorCounts = new Map();
    // Track metrics from event
    trackEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data,
        };
        this.events.push(event);
        this.emit('metric', event);
        // Update specific counters
        this.updateCounters(type, data);
    }
    updateCounters(type, data) {
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
                    this.gameStartTimes.set(data.roomId, Date.now());
                }
                break;
            case 'game_ended':
                if (data?.roomId && this.gameStartTimes.has(data.roomId)) {
                    const startTime = this.gameStartTimes.get(data.roomId);
                    const duration = Date.now() - startTime;
                    this.gameStartTimes.delete(data.roomId);
                    // Update average game duration
                    const totalGames = this.roomMetrics.totalGamesPlayed;
                    const currentAvg = this.roomMetrics.averageGameDuration;
                    this.roomMetrics.averageGameDuration =
                        ((currentAvg * (totalGames - 1)) + duration) / totalGames;
                }
                break;
            case 'error_occurred':
                const errorType = data?.errorType || 'unknown';
                this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1);
                break;
        }
    }
    // Get current metrics snapshot
    getMetricsSnapshot() {
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
    getRecentEvents(count = 100) {
        return this.events.slice(-count);
    }
    // Get events by time range
    getEventsInRange(startTime, endTime) {
        return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    }
    // Clear old events (keep last 24 hours worth)
    cleanupOldEvents() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        this.events = this.events.filter(e => e.timestamp > cutoff);
    }
    // Get error summary
    getErrorSummary() {
        const total = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
        return {
            total,
            breakdown: Object.fromEntries(this.errorCounts),
        };
    }
}
// Singleton instance
exports.metrics = new MetricsCollector();
// Health check helper
function getHealthStatus() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    const checks = {
        memory: heapUsagePercent < 90,
        uptime: process.uptime() > 0,
        connections: exports.metrics.getMetricsSnapshot().connections.activeConnections >= 0,
    };
    const allHealthy = Object.values(checks).every(v => v);
    const status = allHealthy ? 'healthy' : heapUsagePercent > 95 ? 'unhealthy' : 'degraded';
    return { status, checks };
}
//# sourceMappingURL=metrics.js.map