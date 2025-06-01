// Real H3X Backend Integration
import type { H3XSystemStatus, H3XCommandResult } from '../types/h3x.js';

export class H3XApiService {
  private baseUrl: string;
  
  constructor(baseUrl = 'http://localhost:3007') {
    this.baseUrl = baseUrl;
  }

  async getSystemStatus(): Promise<H3XSystemStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      return await response.json();
    } catch (error) {
      return { merger: 'offline', ui: 'offline', logs: 'unknown' };
    }
  }

  async createCFlup(config?: any): Promise<H3XCommandResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cflup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config || {})
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create cFLup' };
    }
  }

  async listCFlups(): Promise<H3XCommandResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cflup/list`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to list cFLups' };
    }
  }
}