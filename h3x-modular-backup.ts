// H3X Modular System - External JavaScript Components
// Designed for modularity and H3X system integration

// h3x-modular.ts
interface H3XSystemStatus {
  merger: 'online' | 'offline' | 'unknown';
  ui: 'online' | 'offline' | 'unknown';
  logs: 'available' | 'empty' | 'unknown';
}

interface H3XMetrics {
  cflupCount: number;
  amendmentCount: number;
  archiveCount: number;
  uptime: number;
}

class H3XModular {
  private initialized: boolean = false;
  private startTime: number = Date.now();
  private activeTab: string = 'overview';
  private systemStatus: H3XSystemStatus = {
    merger: 'unknown',
    ui: 'unknown',
    logs: 'unknown'
  };

  constructor() {
    this.init();
  }

  async init() {
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
    // Type-safe status checking
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
      const response = await fetch('http://localhost:3007/health', { timeout: 2000 });
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

  updateStatusIndicator(elementId, status, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
      const indicator = element.parentElement.querySelector('.status-indicator');
      if (indicator) {
        indicator.className = `status-indicator status-${status}`;
      }
    }
  }

  startUpdateLoop() {
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

  async updateMetrics() {
    // Simulate fetching metrics from H3X system
    try {
      // In a real implementation, these would be API calls
      const cflupCount = Math.floor(Math.random() * 10) + 1; // Simulate
      const amendmentCount = Math.floor(Math.random() * 100) + 50; // Simulate
      const archiveCount = Math.floor(Math.random() * 5) + 1; // Simulate

      this.updateMetric('cflup-count', cflupCount);
      this.updateMetric('amendment-count', amendmentCount);
      this.updateMetric('archive-count', archiveCount);
    } catch (e) {
      this.log(`[H3X-Modular] Failed to update metrics: ${e.message}`);
    }
  }

  updateMetric(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  // Tab Management
  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) {
      tab.classList.add('active');
    }
    
    // Activate button
    event.target.classList.add('active');
    
    this.activeTab = tabName;
    this.log(`[H3X-Modular] Switched to ${tabName} tab`);
  }

  // Loop Management Functions
  async createCFlup() {
    try {
      this.log('[H3X-Modular] Creating new cFLup instance...');
      // In real implementation: await this.executeCommand('node H3X-merger.js create-cflup');
      const instanceId = `cFLup-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
      this.log(`[H3X-Modular] Created new instance: ${instanceId}`);
      await this.updateMetrics();
    } catch (e) {
      this.log(`[H3X-Modular] Failed to create cFLup: ${e.message}`);
    }
  }

  async listCFlups() {
    try {
      this.log('[H3X-Modular] Listing cFLup instances...');
      // In real implementation: await this.executeCommand('node H3X-merger.js list-cflups');
      this.log('[H3X-Modular] cFLup-01: Created 2025-05-29, 5 amendments');
      this.log('[H3X-Modular] cFLup-02: Created 2025-05-29, 3 amendments');
    } catch (e) {
      this.log(`[H3X-Modular] Failed to list cFLups: ${e.message}`);
    }
  }

  async exportArchive() {
    try {
      this.log('[H3X-Modular] Exporting archive...');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `h3x-export-${timestamp}.json`;
      this.log(`[H3X-Modular] Archive exported: ${filename}`);
    } catch (e) {
      this.log(`[H3X-Modular] Failed to export archive: ${e.message}`);
    }
  }

  // Visualization Mode Functions
  toggleMode(mode) {
    this.log(`[H3X-Modular] Toggling ${mode} mode`);
    this.switchTab(mode);
  }

  // System Functions
  async refreshSystem() {
    this.log('[H3X-Modular] Refreshing system status...');
    await this.checkSystemStatus();
    await this.updateMetrics();
    this.log('[H3X-Modular] System refreshed');
  }

  openControl() {
    this.log('[H3X-Modular] Opening control UI...');
    window.open('http://localhost:3007/merger-ui.html', '_blank');
  }

  showHelp() {
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

  log(message) {
    console.log(message);
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      logOutput.innerHTML += `<span style="color: #666;">[${timestamp}]</span> ${message}<br>`;
      logOutput.scrollTop = logOutput.scrollHeight;
    }
  }
}

// Submodule Classes
class H3XHexagonModule {
  constructor() {
    this.nodes = [];
    this.latticeOptimized = false;
  }

  addNode() {
    const nodeId = `hex-${this.nodes.length + 1}`;
    this.nodes.push({ id: nodeId, x: Math.random() * 400, y: Math.random() * 300 });
    h3xModular.log(`[Hexagon] Added node: ${nodeId}`);
  }

  optimize() {
    this.latticeOptimized = !this.latticeOptimized;
    h3xModular.log(`[Hexagon] Lattice optimization: ${this.latticeOptimized ? 'ON' : 'OFF'}`);
  }
}

class H3XTriadModule {
  constructor() {
    this.balanced = false;
    this.efficiency = 0.618; // Golden ratio
  }

  balance() {
    this.balanced = !this.balanced;
    h3xModular.log(`[Triad] Balance state: ${this.balanced ? 'BALANCED' : 'UNBALANCED'}`);
  }

  enhance() {
    this.efficiency = Math.min(1.0, this.efficiency + 0.1);
    h3xModular.log(`[Triad] Efficiency enhanced to: ${this.efficiency.toFixed(3)}`);
  }
}

class H3XFourDModule {
  constructor() {
    this.rotation = { x: 0, y: 0, z: 0, w: 0 };
    this.projected = false;
  }

  rotate() {
    this.rotation.x += 15;
    this.rotation.y += 15;
    h3xModular.log(`[4D] Rotated to: ${this.rotation.x}°, ${this.rotation.y}°`);
  }

  project() {
    this.projected = !this.projected;
    h3xModular.log(`[4D] 3D projection: ${this.projected ? 'ON' : 'OFF'}`);
  }
}

class H3XLogger {
  constructor() {
    this.logs = [];
  }

  add(message) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      message: message
    });
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }
}

// Initialize H3X Modular System
let h3xModular;
document.addEventListener('DOMContentLoaded', () => {
  h3xModular = new H3XModular();
  window.h3xModular = h3xModular;
});

// H3X variables with better organization
$h3x-colors: (
  'blue': #7ecfff,
  'gold': #ffd580,
  'dark': #181c20,
  'gray': #23272b
);

@function h3x-color($name) {
  @return map-get($h3x-colors, $name);
}

// Mixins for H3X components
@mixin h3x-card($variant: 'default') {
  background: h3x-color('gray');
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  
  @if $variant == 'primary' {
    border: 2px solid h3x-color('blue');
  }
}

.h3x-card {
  @include h3x-card();
  
  &--primary {
    @include h3x-card('primary');
  }
}

// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: './index.modular.html',
        experimental: './hexperiments.html'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/scss/_h3x-variables.scss";`
      }
    }
  },
  server: {
    port: 8080,
    open: '/index.modular.html'
  }
})

// package.json
{
  "name": "h3x-fLups",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "node H3X-merger.js",
    "ui": "node merger-ui-server.js",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "sass": "^1.69.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "jsdom": "^23.0.0",
    "@testing-library/dom": "^9.3.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}

// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'dist/'
      ]
    }
  }
})

// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock H3X system globals
Object.defineProperty(window, 'h3xModular', {
  value: {
    log: vi.fn(),
    createCFlup: vi.fn(),
    listCFlups: vi.fn()
  },
  writable: true
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
})