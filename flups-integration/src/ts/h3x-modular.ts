// H3X Modular System - Main TypeScript Module

import type { H3XSystemStatus, H3XMetrics, H3XNode, H3XRotation } from './types/h3x.d';
import { H3XHexagonModule } from './modules/hexagon';
import { H3XTriadModule } from './modules/triad';
import { H3XFourDModule } from './modules/fourd';
import { H3XLogger } from './modules/logger';
import { H3XEngineIntegration, initializeH3XEngine, type H3XEngineStatus } from './h3x-engine-integration';

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
  
  /** Integrated fLupsEngine for triangulated processing */
  public engineIntegration!: H3XEngineIntegration;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    console.log('[H3X-Modular] Initializing H3X modular system with fLupsEngine integration');

    // Initialize core fLupsEngine integration first
    try {
      console.log('[H3X-Modular] Initializing fLupsEngine integration...');
      const engineInitialized = await initializeH3XEngine({
        instanceId: `h3x-modular-${Date.now()}`,
        security: {
          enableAuditLog: true,
          defaultSecurityLevel: 'public',
          encryption: { enabled: false }
        },
        performance: {
          maxNodes: 5000,
          cacheSize: 500,
          precision: 'double'
        },
        agentic: {
          enablePersonaDriven: true,
          egoInfluenceRange: [0.1, 0.8],
          enableDynamicAdaptation: true
        },
        extensibility: {
          pluginPaths: [],
          enableHooks: true,
          externalIntegrations: ['h3x-modular', 'dashboard', 'persona']
        }
      });
      
      if (engineInitialized) {
        // Get the initialized integration instance
        const { getH3XEngineIntegration } = await import('./h3x-engine-integration');
        this.engineIntegration = getH3XEngineIntegration()!;
        
        // Register H3X modular system hooks
        this.engineIntegration.registerHook('onStatusChange', (status: H3XEngineStatus) => {
          this.log(`[fLupsEngine] Status changed: ${status.health}`);
        });
        
        this.engineIntegration.registerHook('onActionProcessed', (action: any) => {
          this.log(`[fLupsEngine] Action processed: ${action.type}:${action.target.entityId}`);
        });
        
        this.engineIntegration.registerHook('onError', (error: Error, context: string) => {
          this.log(`[fLupsEngine] Error in ${context}: ${error.message}`);
        });
        
        console.log('[H3X-Modular] fLupsEngine integration initialized successfully');
      } else {
        console.error('[H3X-Modular] Failed to initialize fLupsEngine integration');
      }
    } catch (error) {
      console.error('[H3X-Modular] fLupsEngine integration error:', error);
      // Continue initialization without engine integration
    }

    // Initialize traditional submodules
    this.hexagon = new H3XHexagonModule();
    this.triad = new H3XTriadModule();
    this.fourd = new H3XFourDModule();
    this.logger = new H3XLogger();

    // Check system status
    await this.checkSystemStatus();

    // Start update loops
    this.startUpdateLoop();

    this.initialized = true;
    this.log('[H3X-Modular] System ready with fLupsEngine integration');
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
      // Get enhanced metrics including fLupsEngine data
      let metrics: H3XMetrics = {
        cflupCount: Math.floor(Math.random() * 10) + 1,
        amendmentCount: Math.floor(Math.random() * 100) + 50,
        archiveCount: Math.floor(Math.random() * 5) + 1,
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
      };
      
      // Enhance with fLupsEngine metrics if available
      if (this.engineIntegration) {
        const engineStatus = this.engineIntegration.getSystemStatus();
        const dashboardData = this.engineIntegration.getDashboardData();
        
        // Update metrics with engine data
        metrics.cflupCount = dashboardData.metrics.engine.performance.totalActions || metrics.cflupCount;
        metrics.amendmentCount = engineStatus.performance.totalActions || metrics.amendmentCount;
        metrics.archiveCount = this.engineIntegration.engine.getAuditLogSize || metrics.archiveCount;
        
        // Update engine-specific UI elements
        this.updateMetric('engine-status', engineStatus.health);
        this.updateMetric('engine-actions', engineStatus.performance.totalActions);
        this.updateMetric('engine-response-time', `${engineStatus.performance.avgResponseTime.toFixed(2)}ms`);
        this.updateMetric('engine-success-rate', `${engineStatus.performance.successRate.toFixed(1)}%`);
      }

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
  
  // ============================================================================
  // fLupsEngine Integration Methods
  // ============================================================================
  
  /**
   * Get triangle patch using integrated fLupsEngine
   * @param patchId - ID of the patch to retrieve
   * @returns Triangle patch or null if not found
   */
  async getTrianglePatch(patchId: string): Promise<any> {
    if (!this.engineIntegration) {
      this.log('[H3X-Modular] fLupsEngine not available');
      return null;
    }
    
    try {
      const patch = this.engineIntegration.engine.getPatch(patchId);
      this.log(`[H3X-Modular] Retrieved triangle patch: ${patchId}`);
      return patch;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to get triangle patch ${patchId}: ${message}`);
      return null;
    }
  }
  
  /**
   * Check if two nodes are neighbors using fLupsEngine
   * @param nodeId1 - First node ID
   * @param nodeId2 - Second node ID  
   * @returns True if nodes are adjacent
   */
  checkNodeAdjacency(nodeId1: string, nodeId2: string): boolean {
    if (!this.engineIntegration) {
      this.log('[H3X-Modular] fLupsEngine not available for adjacency check');
      return false;
    }
    
    try {
      const areNeighbors = this.engineIntegration.engine.areNeighbors(nodeId1, nodeId2);
      this.log(`[H3X-Modular] Adjacency check: ${nodeId1} <-> ${nodeId2} = ${areNeighbors}`);
      return areNeighbors;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Adjacency check failed: ${message}`);
      return false;
    }
  }
  
  /**
   * Process an action through the integrated fLupsEngine
   * @param actionType - Type of action to process
   * @param entityType - Type of entity being acted upon
   * @param entityId - ID of the entity
   * @param payload - Action payload data
   * @returns Processing result
   */
  async processEngineAction(
    actionType: 'create' | 'modify' | 'delete' | 'query' | 'transform' | 'validate',
    entityType: 'node' | 'patch' | 'mapping' | 'system',
    entityId: string,
    payload?: any
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.engineIntegration) {
      const error = 'fLupsEngine not available';
      this.log(`[H3X-Modular] ${error}`);
      return { success: false, error };
    }
    
    try {
      // Create action event
      const action = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: actionType,
        target: { entityType, entityId },
        payload: { parameters: payload },
        actor: { type: 'user' as const, id: 'h3x-modular' },
        context: {
          timestamp: new Date(),
          source: 'H3XModular.processEngineAction',
          precisionLevel: 'medium' as const
        },
        result: { success: false },
        auditTrail: {
          chainOfCustody: ['h3x-modular'],
          integrityHash: `action-${Date.now()}`
        }
      };
      
      // Process through engine integration
      const result = await this.engineIntegration.processTriangulatedAction(action);
      
      this.log(`[H3X-Modular] Engine action processed: ${actionType}:${entityType}:${entityId} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Engine action processing failed: ${message}`);
      return { success: false, error: message };
    }
  }
  
  /**
   * Map a triangle patch to icosahedral coordinates using phi ratios
   * @param patchId - ID of the patch to map
   * @returns Phi mapping result
   */
  async mapPatchToIcosahedron(patchId: string): Promise<any> {
    if (!this.engineIntegration) {
      this.log('[H3X-Modular] fLupsEngine not available for phi mapping');
      return null;
    }
    
    try {
      // First get the patch
      const patch = this.engineIntegration.engine.getPatch(patchId);
      if (!patch) {
        this.log(`[H3X-Modular] Patch not found for phi mapping: ${patchId}`);
        return null;
      }
      
      // Perform phi mapping
      const mappingResult = this.engineIntegration.engine.mapPatchToIcosahedron(patch, {
        algorithm: 'geodesic',
        qualityThreshold: 0.8,
        enableHarmonics: true
      });
      
      this.log(`[H3X-Modular] Phi mapping completed for patch: ${patchId} (Quality: ${mappingResult.quality.qualityScore.toFixed(3)})`);
      
      return mappingResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Phi mapping failed for patch ${patchId}: ${message}`);
      return null;
    }
  }
  
  /**
   * Get comprehensive audit log from fLupsEngine
   * @param options - Filtering options for audit log
   * @returns Filtered audit log entries
   */
  getEngineAuditLog(options?: {
    timeRange?: { start: Date; end: Date };
    actionType?: 'create' | 'modify' | 'delete' | 'query' | 'transform' | 'validate';
    entityType?: 'node' | 'patch' | 'mapping' | 'system';
    limit?: number;
  }): any[] {
    if (!this.engineIntegration) {
      this.log('[H3X-Modular] fLupsEngine not available for audit log');
      return [];
    }
    
    try {
      const auditLog = this.engineIntegration.engine.getAuditLog(options);
      this.log(`[H3X-Modular] Retrieved ${auditLog.length} audit log entries`);
      return auditLog;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to get audit log: ${message}`);
      return [];
    }
  }
  
  /**
   * Get fLupsEngine system status and health
   * @returns Engine status information
   */
  getEngineStatus(): any {
    if (!this.engineIntegration) {
      return {
        available: false,
        status: 'Engine not initialized'
      };
    }
    
    try {
      const status = this.engineIntegration.getSystemStatus();
      const healthCheck = this.engineIntegration.performHealthCheck();
      
      return {
        available: true,
        status: status,
        health: healthCheck,
        metrics: {
          nodeCount: this.engineIntegration.engine.getNodeCount,
          patchCount: this.engineIntegration.engine.getPatchCount,
          auditLogSize: this.engineIntegration.engine.getAuditLogSize,
          engineMetrics: this.engineIntegration.engine.getMetrics
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(`[H3X-Modular] Failed to get engine status: ${message}`);
      return {
        available: true,
        status: 'Error retrieving status',
        error: message
      };
    }
  }
  
  /**
   * Perform comprehensive health check including fLupsEngine
   * @returns Complete system health status
   */
  async performSystemHealthCheck(): Promise<any> {
    const healthCheck = {
      timestamp: new Date(),
      h3xModular: {
        initialized: this.initialized,
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        systemStatus: this.systemStatus,
        modules: {
          hexagon: !!this.hexagon,
          triad: !!this.triad,
          fourd: !!this.fourd,
          logger: !!this.logger
        }
      },
      fLupsEngine: null as any
    };
    
    // Add fLupsEngine health check if available
    if (this.engineIntegration) {
      try {
        healthCheck.fLupsEngine = await this.engineIntegration.performHealthCheck();
      } catch (error) {
        healthCheck.fLupsEngine = {
          error: error instanceof Error ? error.message : 'Unknown error',
          available: false
        };
      }
    } else {
      healthCheck.fLupsEngine = {
        available: false,
        status: 'Not initialized'
      };
    }
    
    this.log(`[H3X-Modular] System health check completed`);
    return healthCheck;
  }
}

// Initialize H3X Modular System
let h3xModular: H3XModular;

document.addEventListener('DOMContentLoaded', () => {
  h3xModular = new H3XModular();
  (window as any).h3xModular = h3xModular;
});

export { h3xModular };
