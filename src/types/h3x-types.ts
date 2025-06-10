/**
 * H3X Types for integration with existing system
 */

export interface H3XSystemStatus {
  merger: 'online' | 'offline' | 'unknown';
  ui: 'online' | 'offline' | 'unknown';
  logs: 'online' | 'offline' | 'unknown';
}

export interface H3XMetrics {
  active_modules: number;
  system_health: 'healthy' | 'degraded' | 'offline' | 'initializing';
  uptime_seconds: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

export interface H3XNode {
  id: string;
  position: { x: number; y: number; z?: number };
  data: any;
  connections: string[];
}

export interface H3XRotation {
  x: number;
  y: number;
  z: number;
  w: number;
}
