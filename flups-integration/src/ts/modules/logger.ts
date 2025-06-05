// H3X Logger Module

import type { IH3XLogger, H3XLogEntry } from '../types/h3x.d.ts';

export class H3XLogger implements IH3XLogger {
  public logs: H3XLogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.initialize();
  }

  initialize(): void {
    console.log('[H3X-Logger] Module initialized');
  }

  add(message: string): void {
    const entry: H3XLogEntry = {
      timestamp: new Date().toISOString(),
      message: message,
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  clear(): void {
    this.logs = [];
    console.log('[H3X-Logger] Logs cleared');
  }

  export(): H3XLogEntry[] {
    return [...this.logs]; // Return copy
  }

  destroy(): void {
    this.logs = [];
    console.log('[H3X-Logger] Module destroyed');
  }
}
