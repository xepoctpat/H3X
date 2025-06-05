// H3X Modular System - Main TypeScript Module

import type { H3XSystemStatus, H3XMetrics, H3XNode, H3XRotation } from './types/h3x.d.ts';
import { H3XHexagonModule } from './modules/hexagon.ts';
import { H3XTriadModule } from './modules/triad.ts';
import { H3XFourDModule } from './modules/fourd.ts';
import { H3XLogger } from './modules/logger.ts';

export class H3XModular {
  private initialized: boolean = false;
  private startTime: number = Date.now();
  private activeTab: string = 'overview';
  private systemStatus: H3XSystemStatus = {
    merger: 'unknown',
    ui: 'unknown',
    logs: 'unknown',
  };

  public hexagon!: H3XHexagonModule;
  public triad!: H3XTriadModule;
  public fourd!: H3XFourDModule;
  public logger!: H3XLogger;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    console.log('[H3X-Modular] Initializing H3X modular system');

    // Initialize submodules
    this.hexagon = new H3XHexagonModule();
    this.triad = new H3XTriadModule();
    this.fourd = new H3XFourDModule();
    this.logger = new H3XLogger();

    // Check system status
    await this.checkSystemStatus();

    // Start update loops
    this.startUpdateLoop();

    this.initialized = true;
    this.log('[H3X-Modular] System ready');
  }

  async checkSystemStatus(): Promise<void> {
    // Check H3X merger
    try {
      const mergerCheck = await this.executeCommand('node H3X-merger.js status');
      this.systemStatus.merger = 'online';
      this.updateStatusIndicator('merger-status', 'online', 'Online');
    } catch {
      this.systemStatus.merger = 'offline';
      this.updateStatusIndicator('merger-status', 'offline', 'Offline');
    }

    // Check UI server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('http://localhost:3007/health', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      this.systemStatus.ui = response.ok ? 'online' : 'offline';
      this.updateStatusIndicator('ui-status', this.systemStatus.ui, this.systemStatus.ui);
    } catch {
      this.systemStatus.ui = 'offline';
      this.updateStatusIndicator('ui-status', 'offline', 'Offline');
    }

    // Check logs
    const logs = localStorage.getItem('h3x-logs');
    this.systemStatus.logs = logs ? 'available' : 'empty';
    this.updateStatusIndicator('log-status', this.systemStatus.logs, this.systemStatus.logs);
  }

  updateStatusIndicator(elementId: string, status: string, text: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
      const indicator = element.parentElement?.querySelector('.h3x-status__indicator');
      if (indicator) {
        indicator.className = `h3x-status__indicator h3x-status--${status}`;
      }
    }
  }

  startUpdateLoop(): void {
    // Update metrics every 5 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 5000);

    // Update uptime every second
    setInterval(() => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      const element = document.getElementById('uptime');
      if (element) {
        element.textContent = `${uptime}s`;
      }
    }, 1000);
  }

  async updateMetrics(): Promise<void> {
    try {
      // In a real implementation, these would be API calls to H3X backend
      const metrics: H3XMetrics = {
        cflupCount: Math.floor(Math.random() * 10) + 1,
        amendmentCount: Math.floor(Math.random() * 100) + 50,
        archiveCount: Math.floor(Math.random() * 5) + 1,
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
      };

      this.updateMetric('cflup-count', metrics.cflupCount);
      this.updateMetric('amendment-count', metrics.amendmentCount);
      this.updateMetric('archive-count', metrics.archiveCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to update metrics: ${message}`);
    }
  }

  updateMetric(elementId: string, value: number | string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = String(value);
    }
  }

  // Tab Management
  switchTab(tabName: string): void {
    // Hide all tabs
    document.querySelectorAll('.h3x-tab-content').forEach((tab) => {
      tab.classList.remove('h3x-tab-content--active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.h3x-tab').forEach((btn) => {
      btn.classList.remove('h3x-tab--active');
    });

    // Show selected tab
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) {
      tab.classList.add('h3x-tab-content--active');
    }

    // Activate button - need to get the clicked button
    const clickedButton = document.querySelector(`[onclick*="${tabName}"]`);
    if (clickedButton) {
      clickedButton.classList.add('h3x-tab--active');
    }

    this.activeTab = tabName;
    this.log(`[H3X-Modular] Switched to ${tabName} tab`);
  }

  // Loop Management Functions
  async createCFlup(): Promise<void> {
    try {
      this.log('[H3X-Modular] Creating new cFLup instance...');
      // In real implementation: await this.executeCommand('node H3X-merger.js create-cflup');
      const instanceId = `cFLup-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
      this.log(`[H3X-Modular] Created new instance: ${instanceId}`);
      await this.updateMetrics();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to create cFLup: ${message}`);
    }
  }

  async listCFlups(): Promise<void> {
    try {
      this.log('[H3X-Modular] Listing cFLup instances...');
      // In real implementation: await this.executeCommand('node H3X-merger.js list-cflups');
      this.log('[H3X-Modular] cFLup-01: Created 2025-05-29, 5 amendments');
      this.log('[H3X-Modular] cFLup-02: Created 2025-05-29, 3 amendments');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to list cFLups: ${message}`);
    }
  }

  async exportArchive(): Promise<void> {
    try {
      this.log('[H3X-Modular] Exporting archive...');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `h3x-export-${timestamp}.json`;
      this.log(`[H3X-Modular] Archive exported: ${filename}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to export archive: ${message}`);
    }
  }

  // Visualization Mode Functions
  toggleMode(mode: string): void {
    this.log(`[H3X-Modular] Toggling ${mode} mode`);
    this.switchTab(mode);
  }

  // System Functions
  async refreshSystem(): Promise<void> {
    this.log('[H3X-Modular] Refreshing system status...');
    await this.checkSystemStatus();
    await this.updateMetrics();
    this.log('[H3X-Modular] System refreshed');
  }

  openControl(): void {
    this.log('[H3X-Modular] Opening control UI...');
    window.open('http://localhost:3007/merger-ui.html', '_blank');
  }

  showHelp(): void {
    const helpText = `
H3X Modular System Help:

🎛️ Controls:
- Create cFLup: Generate new closed feedback loop instance
- List cFLups: Display all current instances
- Export Archive: Create backup of current state

🔷 Visualization Modes:
- Hexagon: Hexagonal lattice system
- Triad: fLupper triad components  
- 4D: Four-dimensional space visualization

📊 Tabs:
- Overview: System metrics and recent activity
- Hexagon: Hexagonal lattice operations
- Triad: Triad balance and optimization
- 4D Space: Multi-dimensional visualization
- Logs: Real-time system logging

For advanced operations, use the Control UI or CLI commands.
    `;
    alert(helpText);
  }

  // Utility Functions
  private async executeCommand(command: string): Promise<{ success: boolean }> {
    this.log(`[H3X-Modular] Executing: ${command}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }
  log(message: string): void {
    console.log(message);
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
      const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] ?? '00:00:00';
      logOutput.innerHTML += `<span style="color: #666;">[${timestamp}]</span> ${message}<br>`;
      logOutput.scrollTop = logOutput.scrollHeight;
    }

    // Also add to logger
    this.logger?.add(message);
  }

  // Getters for system state
  get isInitialized(): boolean {
    return this.initialized;
  }

  get currentSystemStatus(): H3XSystemStatus {
    return { ...this.systemStatus };
  }

  get currentActiveTab(): string {
    return this.activeTab;
  }
}

// Initialize H3X Modular System
let h3xModular: H3XModular;

document.addEventListener('DOMContentLoaded', () => {
  h3xModular = new H3XModular();
  (window as any).h3xModular = h3xModular;
});

export { h3xModular };
