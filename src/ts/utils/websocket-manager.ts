// H3X WebSocket Integration
// Real-time WebSocket communication with performance monitoring and automatic reconnection

import { performanceMonitor } from './performance-monitor.ts';

export interface WebSocketOptions {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueueLimit: number;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
  id?: string;
}

export class H3XWebSocketManager {
  private ws: WebSocket | null = null;
  private options: WebSocketOptions;
  private reconnectAttempts: number = 0;
  private reconnectTimer?: number;
  private heartbeatTimer?: number;
  private messageQueue: WebSocketMessage[] = [];
  private subscriptions: Set<string> = new Set();
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private lastPingTime: number = 0;
  private latencyHistory: number[] = [];

  constructor(options: Partial<WebSocketOptions> = {}) {
    this.options = {
      url: 'ws://localhost:3008',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageQueueLimit: 100,
      ...options
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
        resolve();
        return;
      }

      this.connectionState = 'connecting';
      
      try {
        this.ws = new WebSocket(this.options.url);
        
        this.ws.onopen = () => {
          console.log('[H3X-WS] Connected to WebSocket server');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          
          // Process queued messages
          this.processMessageQueue();
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Re-subscribe to channels
          if (this.subscriptions.size > 0) {
            this.send({
              type: 'subscribe',
              data: { channels: Array.from(this.subscriptions) }
            });
          }

          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('[H3X-WS] Connection closed:', event.code, event.reason);
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('[H3X-WS] WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('[H3X-WS] Failed to create WebSocket:', error);
        this.connectionState = 'disconnected';
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.connectionState = 'disconnected';
    this.emit('disconnected', { code: 1000, reason: 'Manual disconnect' });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('[H3X-WS] Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;
    
    console.log(`[H3X-WS] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error('[H3X-WS] Reconnection failed:', error);
      });
    }, this.options.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.connectionState === 'connected') {
        this.ping();
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      // Handle pong response for latency calculation
      if (message.type === 'pong' && message.timestamp) {
        const latency = Date.now() - message.timestamp;
        this.latencyHistory.push(latency);
        
        // Keep only last 10 latency measurements
        if (this.latencyHistory.length > 10) {
          this.latencyHistory = this.latencyHistory.slice(-10);
        }
        
        // Record latency for performance monitoring
        const avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
        performanceMonitor.recordLatency('websocket', avgLatency);
        
        return;
      }

      // Emit the message to registered handlers
      this.emit(message.type, message.data);
      
    } catch (error) {
      console.error('[H3X-WS] Failed to parse message:', error, data);
    }
  }

  send(message: WebSocketMessage): void {
    if (!message.id) {
      message.id = Math.random().toString(36).substr(2, 9);
    }
    
    message.timestamp = Date.now();

    if (this.connectionState === 'connected' && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[H3X-WS] Failed to send message:', error);
        this.queueMessage(message);
      }
    } else {
      this.queueMessage(message);
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > this.options.messageQueueLimit) {
      this.messageQueue = this.messageQueue.slice(-this.options.messageQueueLimit);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.connectionState === 'connected') {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Event handling
  on(event: string, handler: (data: any) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  off(event: string, handler?: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    if (handler) {
      handlers.delete(handler);
    } else {
      handlers.clear();
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[H3X-WS] Error in ${event} handler:`, error);
        }
      });
    }
  }

  // Subscription management
  subscribe(channels: string | string[]): void {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    channelArray.forEach(channel => this.subscriptions.add(channel));

    this.send({
      type: 'subscribe',
      data: { channels: channelArray }
    });
  }

  unsubscribe(channels: string | string[]): void {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    channelArray.forEach(channel => this.subscriptions.delete(channel));

    this.send({
      type: 'unsubscribe',
      data: { channels: channelArray }
    });
  }

  // API methods
  ping(): void {
    this.lastPingTime = Date.now();
    this.send({
      type: 'ping',
      timestamp: this.lastPingTime
    });
  }

  getSystemStatus(): void {
    this.send({ type: 'get_status' });
  }

  createAmendment(amendment: any): void {
    this.send({
      type: 'create_amendment',
      data: amendment
    });
  }

  createLoop(type: string, data: any = {}): void {
    this.send({
      type: 'create_loop',
      data: { type, ...data }
    });
  }

  updateConfig(config: any): void {
    this.send({
      type: 'update_config',
      data: config
    });
  }

  // Status and diagnostics
  getConnectionState(): string {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  getLatency(): number {
    if (this.latencyHistory.length === 0) return 0;
    return this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  getDiagnostics(): {
    state: string;
    reconnectAttempts: number;
    queueSize: number;
    subscriptions: string[];
    averageLatency: number;
    latencyHistory: number[];
  } {
    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      subscriptions: Array.from(this.subscriptions),
      averageLatency: this.getLatency(),
      latencyHistory: [...this.latencyHistory]
    };
  }
}

// Global WebSocket manager instance
export const wsManager = new H3XWebSocketManager();

// Auto-connect in development
if (process.env.NODE_ENV === 'development') {
  wsManager.connect().catch(error => {
    console.warn('[H3X-WS] Auto-connect failed:', error);
  });
}
