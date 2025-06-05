// H3X Data Integration Layer
// Connects visualization system with real H3X backend data

import { apiClient } from './api-client';
import { wsManager } from './websocket-manager';
import { performanceMonitor } from './performance-monitor';
import type { H3XNode, H3XTriad, H3XSystemStatus, H3XMetrics } from '../types/h3x';

export interface DataUpdateEvent {
  type: 'nodes' | 'triads' | 'metrics' | 'status' | 'config';
  data: any;
  timestamp: number;
}

export interface DataCache {
  nodes: Map<string, H3XNode>;
  triads: Map<string, H3XTriad>;
  metrics: H3XMetrics | null;
  status: H3XSystemStatus | null;
  config: any;
  lastUpdate: number;
}

export class H3XDataIntegration {
  private cache: DataCache;
  private updateCallbacks: Map<string, Set<(event: DataUpdateEvent) => void>> = new Map();
  private pollingInterval?: number;
  private isPolling: boolean = false;
  private pollingRate: number = 5000; // 5 seconds
  private realTimeEnabled: boolean = true;

  constructor() {
    this.cache = {
      nodes: new Map(),
      triads: new Map(),
      metrics: null,
      status: null,
      config: null,
      lastUpdate: 0,
    };

    this.setupRealtimeUpdates();
  }

  private setupRealtimeUpdates(): void {
    // WebSocket event handlers for real-time updates
    wsManager.on('system_status', (data) => {
      this.updateCache('status', data);
    });

    wsManager.on('metrics_update', (data) => {
      this.updateCache('metrics', data);
    });

    wsManager.on('config_updated', (data) => {
      this.updateCache('config', data);
    });

    wsManager.on('node_created', (data) => {
      this.cache.nodes.set(data.id, data);
      this.emitUpdate('nodes', this.getNodes());
    });

    wsManager.on('node_updated', (data) => {
      if (this.cache.nodes.has(data.id)) {
        this.cache.nodes.set(data.id, {
          ...this.cache.nodes.get(data.id)!,
          ...data,
        });
        this.emitUpdate('nodes', this.getNodes());
      }
    });

    wsManager.on('node_deleted', (data) => {
      if (this.cache.nodes.delete(data.id)) {
        this.emitUpdate('nodes', this.getNodes());
      }
    });

    wsManager.on('triad_created', (data) => {
      this.cache.triads.set(data.id, data);
      this.emitUpdate('triads', this.getTriads());
    });

    wsManager.on('triad_updated', (data) => {
      if (this.cache.triads.has(data.id)) {
        this.cache.triads.set(data.id, {
          ...this.cache.triads.get(data.id)!,
          ...data,
        });
        this.emitUpdate('triads', this.getTriads());
      }
    });

    wsManager.on('connected', () => {
      console.log('[H3X-Data] WebSocket connected, subscribing to data channels');
      wsManager.subscribe(['system', 'metrics', 'nodes', 'triads', 'config']);
      this.refreshAllData();
    });

    wsManager.on('disconnected', () => {
      console.log('[H3X-Data] WebSocket disconnected, falling back to polling');
      if (this.realTimeEnabled) {
        this.startPolling();
      }
    });
  }

  private updateCache(type: keyof DataCache, data: any): void {
    this.cache[type] = data;
    this.cache.lastUpdate = Date.now();
    this.emitUpdate(type as any, data);
  }

  private emitUpdate(type: DataUpdateEvent['type'], data: any): void {
    const event: DataUpdateEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    const callbacks = this.updateCallbacks.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[H3X-Data] Error in ${type} callback:`, error);
        }
      });
    }

    // Also emit to 'all' listeners
    const allCallbacks = this.updateCallbacks.get('all');
    if (allCallbacks) {
      allCallbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('[H3X-Data] Error in all callback:', error);
        }
      });
    }
  }

  // Data retrieval methods
  async getSystemStatus(forceRefresh: boolean = false): Promise<H3XSystemStatus> {
    if (!forceRefresh && this.cache.status && this.isDataFresh('status')) {
      return this.cache.status;
    }

    try {
      const response = await apiClient.getSystemStatus();
      if (response.success && response.data) {
        this.updateCache('status', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[H3X-Data] Failed to fetch system status:', error);
    }

    return (
      this.cache.status || {
        merger: 'unknown',
        ui: 'unknown',
        logs: 'unknown',
      }
    );
  }

  async getMetrics(forceRefresh: boolean = false): Promise<H3XMetrics> {
    if (!forceRefresh && this.cache.metrics && this.isDataFresh('metrics')) {
      return this.cache.metrics;
    }

    try {
      const response = await apiClient.getMetrics();
      if (response.success && response.data) {
        this.updateCache('metrics', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[H3X-Data] Failed to fetch metrics:', error);
    }

    return (
      this.cache.metrics || {
        cflupCount: 0,
        amendmentCount: 0,
        archiveCount: 0,
        uptime: 0,
      }
    );
  }

  async getConfig(forceRefresh: boolean = false): Promise<any> {
    if (!forceRefresh && this.cache.config && this.isDataFresh('config')) {
      return this.cache.config;
    }

    try {
      const response = await apiClient.getConfig();
      if (response.success && response.data) {
        this.updateCache('config', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[H3X-Data] Failed to fetch config:', error);
    }

    return this.cache.config || {};
  }

  // Node management
  getNodes(): H3XNode[] {
    return Array.from(this.cache.nodes.values());
  }

  getNode(id: string): H3XNode | undefined {
    return this.cache.nodes.get(id);
  }

  async createNode(node: Omit<H3XNode, 'id'>): Promise<H3XNode | null> {
    try {
      const nodeWithId: H3XNode = {
        id: Math.random().toString(36).substr(2, 9),
        ...node,
      };

      // Add to local cache immediately for responsiveness
      this.cache.nodes.set(nodeWithId.id, nodeWithId);
      this.emitUpdate('nodes', this.getNodes());

      // Send to backend via WebSocket for real-time sync
      if (wsManager.isConnected()) {
        wsManager.send({
          type: 'create_node',
          data: nodeWithId,
        });
      }

      return nodeWithId;
    } catch (error) {
      console.error('[H3X-Data] Failed to create node:', error);
      return null;
    }
  }

  async updateNode(id: string, updates: Partial<H3XNode>): Promise<boolean> {
    try {
      const existingNode = this.cache.nodes.get(id);
      if (!existingNode) return false;

      const updatedNode = { ...existingNode, ...updates };
      this.cache.nodes.set(id, updatedNode);
      this.emitUpdate('nodes', this.getNodes());

      // Send to backend
      if (wsManager.isConnected()) {
        wsManager.send({
          type: 'update_node',
          data: { id, updates },
        });
      }

      return true;
    } catch (error) {
      console.error('[H3X-Data] Failed to update node:', error);
      return false;
    }
  }

  async deleteNode(id: string): Promise<boolean> {
    try {
      if (!this.cache.nodes.delete(id)) return false;

      this.emitUpdate('nodes', this.getNodes());

      // Send to backend
      if (wsManager.isConnected()) {
        wsManager.send({
          type: 'delete_node',
          data: { id },
        });
      }

      return true;
    } catch (error) {
      console.error('[H3X-Data] Failed to delete node:', error);
      return false;
    }
  }

  // Triad management
  getTriads(): H3XTriad[] {
    return Array.from(this.cache.triads.values());
  }

  getTriad(id: string): H3XTriad | undefined {
    return this.cache.triads.get(id);
  }

  async createTriad(triad: Omit<H3XTriad, 'id'>): Promise<H3XTriad | null> {
    try {
      const triadWithId: H3XTriad = {
        id: Math.random().toString(36).substr(2, 9),
        ...triad,
      };

      this.cache.triads.set(triadWithId.id, triadWithId);
      this.emitUpdate('triads', this.getTriads());

      if (wsManager.isConnected()) {
        wsManager.send({
          type: 'create_triad',
          data: triadWithId,
        });
      }

      return triadWithId;
    } catch (error) {
      console.error('[H3X-Data] Failed to create triad:', error);
      return null;
    }
  }

  // Data generation for visualization (when no real data available)
  generateSampleNodes(count: number = 10): H3XNode[] {
    const nodes: H3XNode[] = [];
    const colors = [0x7ecfff, 0xffd580, 0xff7e7e, 0x7eff7e, 0xff7eff];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2 + Math.random() * 3;

      nodes.push({
        id: `node_${i}`,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 2,
        color: colors[i % colors.length],
        radius: 0.1 + Math.random() * 0.2,
        visible: true,
        data: {
          type: 'sample',
          index: i,
          created: Date.now(),
        },
      });
    }

    return nodes;
  }

  generateSampleTriads(nodes: H3XNode[]): H3XTriad[] {
    const triads: H3XTriad[] = [];
    for (let i = 0; i < nodes.length - 2; i += 3) {
      if (i + 2 < nodes.length) {
        const node1 = nodes[i];
        const node2 = nodes[i + 1];
        const node3 = nodes[i + 2];

        if (node1 && node2 && node3) {
          triads.push({
            id: `triad_${Math.floor(i / 3)}`,
            nodeIds: [node1.id, node2.id, node3.id],
            strength: Math.random(),
            type: 'hexagonal',
            visible: true,
            data: {
              efficiency: Math.random(),
              balance: Math.random() > 0.5,
            },
          });
        }
      }
    }

    return triads;
  }

  // Populate cache with sample data
  populateSampleData(): void {
    const nodes = this.generateSampleNodes(12);
    const triads = this.generateSampleTriads(nodes);

    nodes.forEach((node) => this.cache.nodes.set(node.id, node));
    triads.forEach((triad) => this.cache.triads.set(triad.id, triad));

    this.emitUpdate('nodes', this.getNodes());
    this.emitUpdate('triads', this.getTriads());

    console.log('[H3X-Data] Sample data populated:', {
      nodes: nodes.length,
      triads: triads.length,
    });
  }

  // Polling fallback when WebSocket is not available
  startPolling(): void {
    if (this.isPolling) return;

    this.isPolling = true;
    this.pollingInterval = window.setInterval(async () => {
      if (wsManager.isConnected()) {
        this.stopPolling();
        return;
      }

      await this.refreshAllData();
    }, this.pollingRate);

    console.log('[H3X-Data] Started polling mode');
  }

  stopPolling(): void {
    if (!this.isPolling) return;

    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    console.log('[H3X-Data] Stopped polling mode');
  }

  async refreshAllData(): Promise<void> {
    try {
      await Promise.all([this.getSystemStatus(true), this.getMetrics(true), this.getConfig(true)]);
    } catch (error) {
      console.error('[H3X-Data] Failed to refresh data:', error);
    }
  }

  // Event subscription
  onUpdate(
    type: DataUpdateEvent['type'] | 'all',
    callback: (event: DataUpdateEvent) => void,
  ): () => void {
    if (!this.updateCallbacks.has(type)) {
      this.updateCallbacks.set(type, new Set());
    }

    this.updateCallbacks.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(type);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Utility methods
  private isDataFresh(type: keyof DataCache, maxAge: number = 10000): boolean {
    return Date.now() - this.cache.lastUpdate < maxAge;
  }

  setPollingRate(rate: number): void {
    this.pollingRate = Math.max(1000, rate); // Minimum 1 second

    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  enableRealTime(enabled: boolean): void {
    this.realTimeEnabled = enabled;

    if (enabled && !wsManager.isConnected()) {
      wsManager.connect();
    } else if (!enabled && wsManager.isConnected()) {
      wsManager.disconnect();
      this.startPolling();
    }
  }

  getCacheStats(): {
    nodes: number;
    triads: number;
    lastUpdate: number;
    age: number;
  } {
    return {
      nodes: this.cache.nodes.size,
      triads: this.cache.triads.size,
      lastUpdate: this.cache.lastUpdate,
      age: Date.now() - this.cache.lastUpdate,
    };
  }

  clearCache(): void {
    this.cache.nodes.clear();
    this.cache.triads.clear();
    this.cache.metrics = null;
    this.cache.status = null;
    this.cache.config = null;
    this.cache.lastUpdate = 0;

    console.log('[H3X-Data] Cache cleared');
  }
}

// Global data integration instance
export const dataIntegration = new H3XDataIntegration();

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).h3xData = dataIntegration;

  // Populate sample data in development
  setTimeout(() => {
    if (dataIntegration.getNodes().length === 0) {
      dataIntegration.populateSampleData();
    }
  }, 2000);
}
