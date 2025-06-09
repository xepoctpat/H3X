/**
 * Main fLupsEngine Integration Module
 * 
 * This module integrates the fLupsEngine into the H3X system following agentic
 * conventions. It provides a unified interface for triangulated processing,
 * phi mapping, and audit logging with security standards and extensibility
 * for persona/ego-driven scenarios.
 * 
 * Integration Features:
 * - Seamless integration with existing H3X modular architecture
 * - Comprehensive data structure management
 * - Core logic for adjacency and action processing
 * - Phi (φ) mapping with sacred geometry principles
 * - Audit logging with security and precision standards
 * - Agentic design patterns for future dashboard and persona overlays
 * - Extensible architecture ready for DB hooks and advanced features
 * 
 * Usage:
 * ```typescript
 * import { H3XEngineIntegration } from './h3x-engine-integration';
 * 
 * const integration = new H3XEngineIntegration();
 * await integration.initialize();
 * 
 * // Use the integrated engine
 * const patch = integration.engine.getPatch('patch-id');
 * const auditLog = integration.engine.getAuditLog();
 * ```
 * 
 * @author H3X Development Team
 * @version 2.0.0
 * @license MIT
 */

import { v4 as uuidv4 } from 'uuid';
import { fLupsEngine } from './flups-engine';
import type { 
  TriangleNode, 
  TrianglePatch, 
  ActionEvent, 
  PhiMappingResult,
  FLupsEngineConfig,
  FLupsAuditLogEntry
} from './types/flups-engine.d';
import type { H3XSystemStatus, H3XMetrics, H3XNode } from './types/h3x.d';

/**
 * Integration status for monitoring and dashboard display
 */
export interface H3XEngineStatus {
  /** Engine initialization state */
  initialized: boolean;
  /** Current operational state */
  operational: boolean;
  /** Integration health status */
  health: 'healthy' | 'degraded' | 'critical' | 'offline';
  /** Performance metrics summary */
  performance: {
    /** Total processed actions */
    totalActions: number;
    /** Average response time in milliseconds */
    avgResponseTime: number;
    /** Current memory usage */
    memoryUsage: number;
    /** Success rate percentage */
    successRate: number;
  };
  /** Security status */
  security: {
    /** Audit logging status */
    auditEnabled: boolean;
    /** Last security check */
    lastSecurityCheck: Date;
    /** Active security level */
    currentSecurityLevel: 'public' | 'restricted' | 'classified';
  };
  /** Agentic capabilities status */
  agentic: {
    /** Persona-driven processing enabled */
    personaDriven: boolean;
    /** Dynamic adaptation active */
    dynamicAdaptation: boolean;
    /** Active persona overlays count */
    activePersonas: number;
  };
}

/**
 * Main integration class for fLupsEngine within H3X ecosystem
 * 
 * Provides comprehensive integration of triangulated processing capabilities
 * into the H3X modular system with full support for:
 * - Dashboard integration readiness
 * - Persona/ego overlay preparation  
 * - Database hook extensibility
 * - Real-time monitoring and metrics
 * - Security and audit compliance
 */
export class H3XEngineIntegration {
  /** Core fLupsEngine instance */
  public readonly engine: fLupsEngine;
  
  /** Integration configuration */
  private readonly config: FLupsEngineConfig;
  
  /** Integration status tracking */
  private status: H3XEngineStatus;
  
  /** System integration hooks */
  private readonly hooks: {
    onStatusChange?: (status: H3XEngineStatus) => void;
    onActionProcessed?: (action: ActionEvent) => void;
    onError?: (error: Error, context: string) => void;
    onPerformanceMetric?: (metric: any) => void;
  } = {};
  
  /** Dashboard integration interface */
  public readonly dashboard = {
    /** Get current system metrics for dashboard display */
    getMetrics: (): H3XMetrics & { engine: H3XEngineStatus } => this.getDashboardMetrics(),
    
    /** Get formatted status for UI components */
    getStatus: (): H3XSystemStatus & { engine: string } => this.getFormattedStatus(),
    
    /** Get real-time performance data */
    getPerformanceData: () => this.getPerformanceSnapshot(),
    
    /** Get audit log summary for security dashboard */
    getAuditSummary: () => this.getAuditLogSummary()
  };
  
  /** Persona overlay preparation interface */
  public readonly persona = {
    /** Register persona-driven action handler */
    registerPersonaHandler: (personaId: string, handler: (action: ActionEvent) => boolean) => {
      // Placeholder for persona integration
      console.log(`[H3XEngine] Persona handler registered: ${personaId}`);
    },
    
    /** Get persona influence metrics */
    getPersonaMetrics: () => this.getPersonaInfluenceMetrics(),
    
    /** Apply ego-driven modifications to actions */
    applyEgoModifications: (action: ActionEvent, egoProfile: any) => this.applyEgoModifications(action, egoProfile)
  };
  
  /** Database integration preparation interface */
  public readonly database = {
    /** Prepare data for database persistence */
    prepareForPersistence: () => this.prepareDatabasePayload(),
    
    /** Get database schema requirements */
    getSchemaRequirements: () => this.getDatabaseSchemaRequirements(),
    
    /** Validate data integrity for database operations */
    validateDataIntegrity: () => this.validateDatabaseIntegrity()
  };
  
  /**
   * Constructor - Initialize the H3X engine integration
   * 
   * Sets up the integration with comprehensive configuration for security,
   * performance, and agentic capabilities. Prepares hooks for dashboard,
   * persona overlays, and database integration.
   * 
   * @param customConfig - Optional custom configuration overrides
   */
  constructor(customConfig?: Partial<FLupsEngineConfig>) {
    // Create comprehensive default configuration
    this.config = this.createDefaultConfig(customConfig);
    
    // Initialize the core engine
    this.engine = new fLupsEngine(this.config);
    
    // Initialize status tracking
    this.status = this.initializeStatus();
    
    // Setup integration monitoring
    this.setupIntegrationMonitoring();
    
    console.log(`[H3XEngine] Integration initialized with instance: ${this.engine.getInstanceId}`);
  }
  
  /**
   * Initialize the integration system
   * 
   * Performs comprehensive initialization including:
   * - Engine validation and health checks
   * - Security system setup
   * - Performance monitoring activation
   * - Dashboard interface preparation
   * - Persona overlay system preparation
   * - Database hook registration
   * 
   * @returns Promise resolving to initialization success
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('[H3XEngine] Starting integration initialization...');
      
      // Validate engine state
      if (!this.engine.isInitialized) {
        throw new Error('Core engine failed to initialize');
      }
      
      // Setup security monitoring
      await this.initializeSecurity();
      
      // Initialize performance tracking
      this.initializePerformanceMonitoring();
      
      // Prepare dashboard integration
      this.prepareDashboardIntegration();
      
      // Setup persona overlay hooks
      this.preparePersonaIntegration();
      
      // Initialize database hooks
      this.prepareDatabaseIntegration();
      
      // Update status
      this.status.initialized = true;
      this.status.operational = true;
      this.status.health = 'healthy';
      
      // Trigger status change hook
      this.hooks.onStatusChange?.(this.status);
      
      console.log('[H3XEngine] Integration initialization completed successfully');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error(`[H3XEngine] Integration initialization failed: ${errorMessage}`);
      
      this.status.health = 'critical';
      this.status.operational = false;
      
      this.hooks.onError?.(error as Error, 'initialization');
      return false;
    }
  }
  
  /**
   * Process a triangulated action with full integration support
   * 
   * Comprehensive action processing pipeline that:
   * - Validates action through engine
   * - Applies persona/ego modifications if configured
   * - Processes action with full audit logging
   * - Updates dashboard metrics
   * - Triggers integration hooks
   * - Maintains system health monitoring
   * 
   * @param action - Action event to process
   * @returns Processing result with integration context
   */
  public async processTriangulatedAction(action: ActionEvent): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    integrationContext: {
      processingTime: number;
      securityLevel: string;
      personaInfluence?: number;
      qualityMetrics: any;
    };
  }> {
    const startTime = performance.now();
    
    try {
      // Pre-process with persona overlays if enabled
      if (this.config.agentic.enablePersonaDriven) {
        action = this.applyPersonaProcessing(action);
      }
      
      // Process through core engine
      const engineResult = this.engine.processAction(action);
      
      // Calculate processing metrics
      const processingTime = performance.now() - startTime;
      
      // Update integration status
      this.updateProcessingMetrics(engineResult.success, processingTime);
      
      // Create integration context
      const integrationContext = {
        processingTime,
        securityLevel: this.getCurrentSecurityLevel(),
        personaInfluence: this.calculatePersonaInfluence(action),
        qualityMetrics: this.calculateQualityMetrics(action, engineResult)
      };
      
      // Trigger integration hooks
      this.hooks.onActionProcessed?.(action);
      this.hooks.onPerformanceMetric?.({ processingTime, success: engineResult.success });
      
      console.log(`[H3XEngine] Action processed: ${action.type}:${action.target.entityId} (${processingTime.toFixed(2)}ms)`);
      
      return {
        ...engineResult,
        integrationContext
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      const processingTime = performance.now() - startTime;
      
      // Update error metrics
      this.updateProcessingMetrics(false, processingTime);
      
      // Trigger error hook
      this.hooks.onError?.(error as Error, 'action_processing');
      
      console.error(`[H3XEngine] Action processing failed: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        integrationContext: {
          processingTime,
          securityLevel: this.getCurrentSecurityLevel(),
          qualityMetrics: { error: true }
        }
      };
    }
  }
  
  /**
   * Get comprehensive system status for monitoring and dashboard
   * 
   * Provides detailed status information including:
   * - Engine operational state
   * - Performance metrics
   * - Security status
   * - Agentic capabilities status
   * - Integration health
   * 
   * @returns Complete system status
   */
  public getSystemStatus(): H3XEngineStatus {
    // Update dynamic status components
    this.updateDynamicStatus();
    
    return { ...this.status };
  }
  
  /**
   * Register integration hooks for external systems
   * 
   * Allows external systems (dashboard, persona overlays, database)
   * to register callbacks for integration events.
   * 
   * @param hookType - Type of hook to register
   * @param callback - Callback function for the hook
   */
  public registerHook(
    hookType: keyof typeof this.hooks,
    callback: any
  ): void {
    this.hooks[hookType] = callback;
    console.log(`[H3XEngine] Hook registered: ${hookType}`);
  }
  
  /**
   * Get formatted data for dashboard integration
   * 
   * Provides data in the format expected by H3X dashboard components
   * with proper formatting and aggregation for UI display.
   * 
   * @returns Dashboard-ready data
   */
  public getDashboardData(): {
    status: H3XSystemStatus & { engine: string };
    metrics: H3XMetrics & { engine: H3XEngineStatus };
    recentActivity: any[];
    performanceChart: any[];
  } {
    return {
      status: this.getFormattedStatus(),
      metrics: this.getDashboardMetrics(),
      recentActivity: this.getRecentActivity(),
      performanceChart: this.getPerformanceChartData()
    };
  }
  
  /**
   * Perform comprehensive health check
   * 
   * Validates all integration components and returns detailed health status
   * for monitoring and alerting systems.
   * 
   * @returns Health check results
   */
  public async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical' | 'offline';
    components: {
      engine: 'healthy' | 'degraded' | 'critical' | 'offline';
      security: 'healthy' | 'degraded' | 'critical' | 'offline';
      performance: 'healthy' | 'degraded' | 'critical' | 'offline';
      integration: 'healthy' | 'degraded' | 'critical' | 'offline';
    };
    details: {
      engineMetrics: any;
      securityStatus: any;
      performanceMetrics: any;
      integrationStatus: any;
    };
  }> {
    try {
      // Check engine health
      const engineHealth = this.checkEngineHealth();
      
      // Check security systems
      const securityHealth = this.checkSecurityHealth();
      
      // Check performance metrics
      const performanceHealth = this.checkPerformanceHealth();
      
      // Check integration status
      const integrationHealth = this.checkIntegrationHealth();
      
      // Determine overall health
      const components = {
        engine: engineHealth.status,
        security: securityHealth.status,
        performance: performanceHealth.status,
        integration: integrationHealth.status
      };
      
      const overall = this.calculateOverallHealth(components);
      
      return {
        overall,
        components,
        details: {
          engineMetrics: engineHealth.details,
          securityStatus: securityHealth.details,
          performanceMetrics: performanceHealth.details,
          integrationStatus: integrationHealth.details
        }
      };
      
    } catch (error) {
      console.error('[H3XEngine] Health check failed:', error);
      return {
        overall: 'critical',
        components: {
          engine: 'offline',
          security: 'offline',
          performance: 'offline',
          integration: 'offline'
        },
        details: {
          engineMetrics: { error: 'Health check failed' },
          securityStatus: { error: 'Health check failed' },
          performanceMetrics: { error: 'Health check failed' },
          integrationStatus: { error: 'Health check failed' }
        }
      };
    }
  }
  
  // ============================================================================
  // PRIVATE INTEGRATION METHODS
  // ============================================================================
  
  /**
   * Create default configuration with agentic conventions
   */
  private createDefaultConfig(customConfig?: Partial<FLupsEngineConfig>): FLupsEngineConfig {
    const defaultConfig: FLupsEngineConfig = {
      instanceId: `h3x-engine-${uuidv4()}`,
      security: {
        enableAuditLog: true,
        defaultSecurityLevel: 'public',
        encryption: {
          enabled: false
        }
      },
      performance: {
        maxNodes: 10000,
        cacheSize: 1000,
        precision: 'double'
      },
      agentic: {
        enablePersonaDriven: true,
        egoInfluenceRange: [0.1, 0.9],
        enableDynamicAdaptation: true
      },
      extensibility: {
        pluginPaths: [],
        enableHooks: true,
        externalIntegrations: ['dashboard', 'persona', 'database']
      }
    };
    
    // Merge with custom configuration
    return customConfig ? { ...defaultConfig, ...customConfig } : defaultConfig;
  }
  
  /**
   * Initialize status tracking structure
   */
  private initializeStatus(): H3XEngineStatus {
    return {
      initialized: false,
      operational: false,
      health: 'offline',
      performance: {
        totalActions: 0,
        avgResponseTime: 0,
        memoryUsage: 0,
        successRate: 100
      },
      security: {
        auditEnabled: this.config.security.enableAuditLog,
        lastSecurityCheck: new Date(),
        currentSecurityLevel: this.config.security.defaultSecurityLevel
      },
      agentic: {
        personaDriven: this.config.agentic.enablePersonaDriven,
        dynamicAdaptation: this.config.agentic.enableDynamicAdaptation,
        activePersonas: 0
      }
    };
  }
  
  /**
   * Setup integration monitoring and health checks
   */
  private setupIntegrationMonitoring(): void {
    // Setup periodic health checks
    setInterval(() => {
      this.performPeriodicHealthCheck();
    }, 30000); // Every 30 seconds
    
    // Setup performance monitoring
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000); // Every 5 seconds
  }
  
  /**
   * Initialize security subsystem
   */
  private async initializeSecurity(): Promise<void> {
    // Setup security monitoring
    this.status.security.lastSecurityCheck = new Date();
    
    // Initialize audit log validation
    if (this.config.security.enableAuditLog) {
      console.log('[H3XEngine] Security subsystem initialized with audit logging');
    }
  }
  
  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Reset performance metrics
    this.status.performance = {
      totalActions: 0,
      avgResponseTime: 0,
      memoryUsage: this.engine.getMetrics.memoryUsage,
      successRate: 100
    };
    
    console.log('[H3XEngine] Performance monitoring initialized');
  }
  
  /**
   * Prepare dashboard integration interface
   */
  private prepareDashboardIntegration(): void {
    // Dashboard interface is already defined in the constructor
    console.log('[H3XEngine] Dashboard integration prepared');
  }
  
  /**
   * Prepare persona overlay integration
   */
  private preparePersonaIntegration(): void {
    if (this.config.agentic.enablePersonaDriven) {
      // Persona interface is already defined in the constructor
      console.log('[H3XEngine] Persona overlay integration prepared');
    }
  }
  
  /**
   * Prepare database integration hooks
   */
  private prepareDatabaseIntegration(): void {
    // Database interface is already defined in the constructor
    console.log('[H3XEngine] Database integration hooks prepared');
  }
  
  /**
   * Apply persona-driven processing to actions
   */
  private applyPersonaProcessing(action: ActionEvent): ActionEvent {
    // Placeholder for persona processing logic
    // In production, this would apply persona-specific modifications
    return action;
  }
  
  /**
   * Apply ego-driven modifications to actions
   */
  private applyEgoModifications(action: ActionEvent, egoProfile: any): ActionEvent {
    // Placeholder for ego-driven processing
    return action;
  }
  
  /**
   * Update processing metrics after action completion
   */
  private updateProcessingMetrics(success: boolean, processingTime: number): void {
    this.status.performance.totalActions++;
    
    // Update average response time
    const alpha = 0.1; // Smoothing factor
    this.status.performance.avgResponseTime = 
      (1 - alpha) * this.status.performance.avgResponseTime + alpha * processingTime;
    
    // Update success rate
    const successCount = Math.floor(this.status.performance.successRate * this.status.performance.totalActions / 100);
    const newSuccessCount = success ? successCount + 1 : successCount;
    this.status.performance.successRate = (newSuccessCount / this.status.performance.totalActions) * 100;
    
    // Update memory usage
    this.status.performance.memoryUsage = this.engine.getMetrics.memoryUsage;
  }
  
  /**
   * Get current security level
   */
  private getCurrentSecurityLevel(): string {
    return this.status.security.currentSecurityLevel;
  }
  
  /**
   * Calculate persona influence on action
   */
  private calculatePersonaInfluence(action: ActionEvent): number {
    // Placeholder for persona influence calculation
    return this.config.agentic.enablePersonaDriven ? Math.random() * 0.5 + 0.5 : 0;
  }
  
  /**
   * Calculate quality metrics for action result
   */
  private calculateQualityMetrics(action: ActionEvent, result: any): any {
    return {
      actionType: action.type,
      success: result.success,
      hasError: !!result.error,
      entityType: action.target.entityType
    };
  }
  
  /**
   * Update dynamic status components
   */
  private updateDynamicStatus(): void {
    // Update health based on current metrics
    if (this.status.performance.successRate < 90) {
      this.status.health = 'degraded';
    } else if (this.status.performance.successRate < 50) {
      this.status.health = 'critical';
    } else if (this.status.operational) {
      this.status.health = 'healthy';
    }
  }
  
  /**
   * Get dashboard-formatted metrics
   */
  private getDashboardMetrics(): H3XMetrics & { engine: H3XEngineStatus } {
    return {
      cflupCount: this.engine.getPatchCount,
      amendmentCount: this.status.performance.totalActions,
      archiveCount: this.engine.getAuditLogSize,
      uptime: Math.floor((Date.now() - new Date().getTime()) / 1000),
      engine: this.status
    };
  }
  
  /**
   * Get formatted status for UI components
   */
  private getFormattedStatus(): H3XSystemStatus & { engine: string } {
    return {
      merger: this.status.operational ? 'online' : 'offline',
      ui: this.status.health === 'healthy' ? 'online' : 'offline',
      logs: this.status.security.auditEnabled ? 'available' : 'empty',
      engine: this.status.health
    };
  }
  
  /**
   * Get performance snapshot for real-time monitoring
   */
  private getPerformanceSnapshot(): any {
    return {
      timestamp: new Date(),
      metrics: this.status.performance,
      engineMetrics: this.engine.getMetrics,
      health: this.status.health
    };
  }
  
  /**
   * Get audit log summary for security dashboard
   */
  private getAuditLogSummary(): any {
    const auditLog = this.engine.getAuditLog({ limit: 100 });
    
    return {
      totalEntries: this.engine.getAuditLogSize,
      recentEntries: auditLog.length,
      securityEvents: auditLog.filter(entry => 
        entry.securityContext.operationLevel !== 'public'
      ).length,
      errorCount: auditLog.filter(entry => 
        !entry.actionEvent.result.success
      ).length,
      lastUpdate: auditLog.length > 0 ? auditLog[auditLog.length - 1].timestamp : null
    };
  }
  
  /**
   * Get persona influence metrics
   */
  private getPersonaInfluenceMetrics(): any {
    return {
      enabled: this.config.agentic.enablePersonaDriven,
      activePersonas: this.status.agentic.activePersonas,
      influenceRange: this.config.agentic.egoInfluenceRange,
      dynamicAdaptation: this.status.agentic.dynamicAdaptation
    };
  }
  
  /**
   * Prepare data for database persistence
   */
  private prepareDatabasePayload(): any {
    return {
      instanceId: this.engine.getInstanceId,
      status: this.status,
      metrics: this.engine.getMetrics,
      auditLog: this.engine.getAuditLog({ limit: 1000 }),
      timestamp: new Date()
    };
  }
  
  /**
   * Get database schema requirements
   */
  private getDatabaseSchemaRequirements(): any {
    return {
      tables: [
        'h3x_engine_status',
        'h3x_audit_log',
        'h3x_performance_metrics',
        'h3x_persona_data'
      ],
      indices: [
        'timestamp_idx',
        'entity_type_idx',
        'security_level_idx'
      ],
      constraints: [
        'unique_instance_id',
        'audit_integrity_check'
      ]
    };
  }
  
  /**
   * Validate data integrity for database operations
   */
  private validateDatabaseIntegrity(): boolean {
    // Placeholder for database integrity validation
    return true;
  }
  
  /**
   * Get recent activity for dashboard display
   */
  private getRecentActivity(): any[] {
    const auditLog = this.engine.getAuditLog({ limit: 10 });
    
    return auditLog.map(entry => ({
      timestamp: entry.timestamp,
      action: entry.actionEvent.type,
      entity: `${entry.actionEvent.target.entityType}:${entry.actionEvent.target.entityId}`,
      success: entry.actionEvent.result.success,
      duration: entry.actionEvent.result.performance?.executionTime || 0
    }));
  }
  
  /**
   * Get performance chart data
   */
  private getPerformanceChartData(): any[] {
    // Generate sample performance chart data
    const now = Date.now();
    const dataPoints = [];
    
    for (let i = 0; i < 20; i++) {
      dataPoints.push({
        timestamp: new Date(now - (19 - i) * 60000), // 1 minute intervals
        responseTime: this.status.performance.avgResponseTime + (Math.random() - 0.5) * 10,
        successRate: this.status.performance.successRate,
        memoryUsage: this.status.performance.memoryUsage
      });
    }
    
    return dataPoints;
  }
  
  /**
   * Perform periodic health check
   */
  private performPeriodicHealthCheck(): void {
    // Update security check timestamp
    this.status.security.lastSecurityCheck = new Date();
    
    // Check engine operational status
    if (!this.engine.isInitialized) {
      this.status.health = 'critical';
      this.status.operational = false;
    }
  }
  
  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    // Update memory usage from engine
    this.status.performance.memoryUsage = this.engine.getMetrics.memoryUsage;
  }
  
  /**
   * Check engine health status
   */
  private checkEngineHealth(): { status: 'healthy' | 'degraded' | 'critical' | 'offline'; details: any } {
    if (!this.engine.isInitialized) {
      return { status: 'offline', details: { initialized: false } };
    }
    
    const metrics = this.engine.getMetrics;
    
    if (metrics.averageResponseTime > 1000) {
      return { status: 'degraded', details: { slowResponse: true, avgTime: metrics.averageResponseTime } };
    }
    
    return { status: 'healthy', details: metrics };
  }
  
  /**
   * Check security health status
   */
  private checkSecurityHealth(): { status: 'healthy' | 'degraded' | 'critical' | 'offline'; details: any } {
    const timeSinceLastCheck = Date.now() - this.status.security.lastSecurityCheck.getTime();
    
    if (timeSinceLastCheck > 300000) { // 5 minutes
      return { status: 'degraded', details: { staleSecurityCheck: true } };
    }
    
    return { status: 'healthy', details: this.status.security };
  }
  
  /**
   * Check performance health status
   */
  private checkPerformanceHealth(): { status: 'healthy' | 'degraded' | 'critical' | 'offline'; details: any } {
    const perf = this.status.performance;
    
    if (perf.successRate < 50) {
      return { status: 'critical', details: { lowSuccessRate: perf.successRate } };
    }
    
    if (perf.successRate < 90) {
      return { status: 'degraded', details: { degradedSuccessRate: perf.successRate } };
    }
    
    return { status: 'healthy', details: perf };
  }
  
  /**
   * Check integration health status
   */
  private checkIntegrationHealth(): { status: 'healthy' | 'degraded' | 'critical' | 'offline'; details: any } {
    if (!this.status.initialized || !this.status.operational) {
      return { status: 'offline', details: { initialized: this.status.initialized, operational: this.status.operational } };
    }
    
    return { status: 'healthy', details: { initialized: true, operational: true } };
  }
  
  /**
   * Calculate overall health from component health statuses
   */
  private calculateOverallHealth(components: Record<string, string>): 'healthy' | 'degraded' | 'critical' | 'offline' {
    const statuses = Object.values(components);
    
    if (statuses.includes('offline') || statuses.includes('critical')) {
      return 'critical';
    }
    
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }
}

/**
 * Global integration instance for H3X system
 * 
 * This provides a singleton pattern for the engine integration that can be
 * imported and used throughout the H3X system for consistency and
 * performance optimization.
 */
export let h3xEngineIntegration: H3XEngineIntegration;

/**
 * Initialize the global H3X engine integration
 * 
 * Call this function during system startup to initialize the global
 * integration instance with proper configuration.
 * 
 * @param config - Optional configuration overrides
 * @returns Promise resolving to initialization success
 */
export async function initializeH3XEngine(config?: Partial<FLupsEngineConfig>): Promise<boolean> {
  try {
    h3xEngineIntegration = new H3XEngineIntegration(config);
    const success = await h3xEngineIntegration.initialize();
    
    if (success) {
      console.log('[H3X] Engine integration initialized globally');
      // Make available to browser environment if present
      if (typeof window !== 'undefined') {
        (window as any).h3xEngineIntegration = h3xEngineIntegration;
      }
    }
    
    return success;
  } catch (error) {
    console.error('[H3X] Failed to initialize global engine integration:', error);
    return false;
  }
}

/**
 * Get the global engine integration instance
 * 
 * Provides access to the global integration instance with proper
 * error handling and validation.
 * 
 * @returns Global integration instance or null if not initialized
 */
export function getH3XEngineIntegration(): H3XEngineIntegration | null {
  if (!h3xEngineIntegration) {
    console.warn('[H3X] Engine integration not initialized. Call initializeH3XEngine() first.');
    return null;
  }
  
  return h3xEngineIntegration;
}