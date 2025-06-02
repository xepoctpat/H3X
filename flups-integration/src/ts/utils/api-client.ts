// H3X API Client
// Centralized API communication with the H3X backend system

import { performanceMonitor } from './performance-monitor';
import type { H3XSystemStatus, H3XMetrics, H3XCommandResult } from '../types/h3x';

export interface APIOptions {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  latency: number;
}

export class H3XAPIClient {
  private options: APIOptions;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(options: Partial<APIOptions> = {}) {
    this.options = {
      baseUrl: 'http://localhost:3007/api',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...options
    };
  }

  // Core request method with performance monitoring
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false,
    cacheTTL: number = 30000
  ): Promise<APIResponse<T>> {
    const startTime = performance.now();
    const url = `${this.options.baseUrl}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // Check cache if enabled
    if (useCache && options.method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return {
          success: true,
          data: cached.data,
          timestamp: Date.now(),
          latency: 0
        };
      }
    }    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Create timeout controller for request cancellation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    requestOptions.signal = controller.signal;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        const latency = performance.now() - startTime;
        
        // Record latency for performance monitoring
        performanceMonitor.recordLatency('api', latency);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful GET requests
        if (useCache && options.method === 'GET') {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl: cacheTTL
          });        }

        // Clear timeout on success
        clearTimeout(timeoutId);

        return {
          success: true,
          data,
          timestamp: Date.now(),
          latency
        };

      } catch (error) {
        lastError = error as Error;
        
        // Clear timeout on error
        clearTimeout(timeoutId);
        
        if (attempt < this.options.retries) {
          await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
          continue;
        }

        const latency = performance.now() - startTime;
        performanceMonitor.recordLatency('api', latency);

        return {
          success: false,
          error: lastError.message,
          timestamp: Date.now(),
          latency
        };
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: 'Unexpected error',
      timestamp: Date.now(),
      latency: performance.now() - startTime
    };
  }

  // System API endpoints
  async getSystemStatus(): Promise<APIResponse<H3XSystemStatus>> {
    return this.request<H3XSystemStatus>('/system/status', {}, true, 5000);
  }

  async getMetrics(): Promise<APIResponse<H3XMetrics>> {
    return this.request<H3XMetrics>('/metrics', {}, true, 2000);
  }

  async getHealth(): Promise<APIResponse<{ status: string; timestamp: string; uptime: number }>> {
    return this.request('/health', {}, false);
  }

  // Configuration API endpoints
  async getConfig(): Promise<APIResponse<any>> {
    return this.request('/config', {}, true, 10000);
  }

  async updateConfig(config: any): Promise<APIResponse<any>> {
    return this.request('/config', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async resetConfig(): Promise<APIResponse<any>> {
    return this.request('/config/reset', {
      method: 'PUT'
    });
  }

  // Loop Management API endpoints
  async getLoopData(type: string): Promise<APIResponse<any>> {
    return this.request(`/loops/${type}`, {}, true, 5000);
  }

  async createLoop(type: string, data?: any): Promise<APIResponse<any>> {
    return this.request(`/loops/${type}/create`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  }

  async getLoopInstances(type: string): Promise<APIResponse<any>> {
    return this.request(`/loops/${type}/instances`, {}, true, 5000);
  }

  async deleteLoopInstance(type: string, instanceId: string): Promise<APIResponse<any>> {
    return this.request(`/loops/${type}/${instanceId}`, {
      method: 'DELETE'
    });
  }

  // Amendment API endpoints
  async getAmendments(): Promise<APIResponse<any>> {
    return this.request('/amendments', {}, true, 5000);
  }

  async createAmendment(amendment: any): Promise<APIResponse<any>> {
    return this.request('/amendments', {
      method: 'POST',
      body: JSON.stringify(amendment)
    });
  }

  async getAmendmentsByType(type: string): Promise<APIResponse<any>> {
    return this.request(`/amendments/${type}`, {}, true, 5000);
  }

  // Archive API endpoints
  async listArchives(): Promise<APIResponse<any>> {
    return this.request('/archives', {}, true, 10000);
  }

  async exportArchive(filename: string, type?: string): Promise<APIResponse<any>> {
    return this.request('/archives/export', {
      method: 'POST',
      body: JSON.stringify({ filename, type })
    });
  }

  async importArchive(file: File): Promise<APIResponse<any>> {
    const formData = new FormData();
    formData.append('archive', file);

    return this.request('/archives/import', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  }

  async deleteArchive(filename: string): Promise<APIResponse<any>> {
    return this.request(`/archives/${filename}`, {
      method: 'DELETE'
    });
  }

  // System Operations API endpoints
  async createCheckpoint(): Promise<APIResponse<any>> {
    return this.request('/system/checkpoint', {
      method: 'POST'
    });
  }

  async createBackup(): Promise<APIResponse<any>> {
    return this.request('/system/backup', {
      method: 'POST'
    });
  }

  async getSystemLogs(): Promise<APIResponse<any>> {
    return this.request('/system/logs', {}, true, 5000);
  }

  async restartSystem(): Promise<APIResponse<any>> {
    return this.request('/system/restart', {
      method: 'POST'
    });
  }

  // Real-time Data API endpoints
  async getRealtimeActivity(): Promise<APIResponse<any>> {
    return this.request('/realtime/activity', {}, false);
  }

  async getRealtimeStats(): Promise<APIResponse<any>> {
    return this.request('/realtime/stats', {}, false);
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
    console.log('[H3X-API] Cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  setBaseUrl(baseUrl: string): void {
    this.options.baseUrl = baseUrl;
    this.clearCache(); // Clear cache when base URL changes
  }

  // Batch requests for efficiency
  async batchRequest<T>(requests: Array<{
    endpoint: string;
    options?: RequestInit;
    useCache?: boolean;
    cacheTTL?: number;
  }>): Promise<APIResponse<T>[]> {
    const promises = requests.map(req => 
      this.request<T>(req.endpoint, req.options, req.useCache, req.cacheTTL)
    );

    return Promise.all(promises);
  }

  // Health check with timeout
  async healthCheck(timeout: number = 5000): Promise<boolean> {
    try {
      const originalTimeout = this.options.timeout;
      this.options.timeout = timeout;
      
      const response = await this.getHealth();
      
      this.options.timeout = originalTimeout;
      return response.success;
    } catch {
      return false;
    }
  }
}

// Global API client instance
export const apiClient = new H3XAPIClient();

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).h3xAPI = apiClient;
}
