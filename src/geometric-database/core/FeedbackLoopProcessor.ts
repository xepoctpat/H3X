/**
 * H3X Feedback Loop-Driven Processing Engine
 * 
 * Implements geometric feedback loops as the primary data processing mechanism
 * with triangle-to-triangle communication and self-optimizing lattice reorganization.
 */

import * as THREE from 'three';
import { GeometricDataPoint, GeometricQuery } from './GeometricDatabase';

export interface FeedbackLoop {
  id: string;
  type: 'processing' | 'optimization' | 'communication' | 'reorganization';
  source: string;
  target: string;
  strength: number;
  frequency: number;
  lastExecution: number;
  totalExecutions: number;
  averageLatency: number;
  active: boolean;
}

export interface FeedbackSignal {
  id: string;
  loopId: string;
  data: any;
  timestamp: number;
  priority: number;
  propagationPath: string[];
  transformations: THREE.Matrix4[];
}

export interface ProcessingNode {
  id: string;
  position: THREE.Vector3;
  type: 'triangle' | 'polyhedron' | 'assembly';
  processingCapacity: number;
  currentLoad: number;
  connectedLoops: string[];
  lastActivity: number;
}

export interface OptimizationMetrics {
  latticeEfficiency: number;
  communicationLatency: number;
  processingThroughput: number;
  reorganizationFrequency: number;
  feedbackStability: number;
}

export class FeedbackLoopProcessor {
  private feedbackLoops: Map<string, FeedbackLoop> = new Map();
  private processingNodes: Map<string, ProcessingNode> = new Map();
  private activeSignals: Map<string, FeedbackSignal> = new Map();
  private scene: THREE.Scene | null = null;
  private triangleStates: Map<string, any> = new Map();
  
  private optimizationMetrics: OptimizationMetrics = {
    latticeEfficiency: 0,
    communicationLatency: 0,
    processingThroughput: 0,
    reorganizationFrequency: 0,
    feedbackStability: 0
  };
  
  // Processing parameters
  private readonly MAX_SIGNAL_PROPAGATION_DEPTH = 10;
  private readonly OPTIMIZATION_THRESHOLD = 0.8;
  private readonly REORGANIZATION_COOLDOWN = 5000; // 5 seconds
  private lastReorganization = 0;
  
  constructor() {
    this.initializeDefaultLoops();
  }

  /**
   * Initialize feedback loop processor with scene and triangle states
   */
  initialize(scene: THREE.Scene, triangleStates: Map<string, any>): void {
    this.scene = scene;
    this.triangleStates = triangleStates;
    
    // Create processing nodes for existing triangles
    for (const [triangleId, state] of triangleStates) {
      this.createProcessingNode(triangleId, 'triangle');
    }
    
    console.log('🔄 Feedback Loop Processor initialized');
  }

  /**
   * Process data creation event through feedback loops
   */
  processCreation(dataPoint: GeometricDataPoint): void {
    const signal: FeedbackSignal = {
      id: this.generateSignalId(),
      loopId: 'creation_feedback',
      data: { event: 'create', dataPoint },
      timestamp: Date.now(),
      priority: 5,
      propagationPath: [dataPoint.triangleAddress],
      transformations: []
    };
    
    this.propagateSignal(signal);
    this.updateOptimizationMetrics();
  }

  /**
   * Process data update event through feedback loops
   */
  processUpdate(dataPoint: GeometricDataPoint): void {
    const signal: FeedbackSignal = {
      id: this.generateSignalId(),
      loopId: 'update_feedback',
      data: { event: 'update', dataPoint },
      timestamp: Date.now(),
      priority: 3,
      propagationPath: [dataPoint.triangleAddress],
      transformations: []
    };
    
    this.propagateSignal(signal);
    this.triggerOptimizationIfNeeded();
  }

  /**
   * Process data deletion event through feedback loops
   */
  processDeletion(dataPoint: GeometricDataPoint): void {
    const signal: FeedbackSignal = {
      id: this.generateSignalId(),
      loopId: 'deletion_feedback',
      data: { event: 'delete', dataPoint },
      timestamp: Date.now(),
      priority: 4,
      propagationPath: [dataPoint.triangleAddress],
      transformations: []
    };
    
    this.propagateSignal(signal);
    this.scheduleGarbageCollection();
  }

  /**
   * Process query through feedback-driven computation
   */
  async processQuery(query: GeometricQuery, depth: number): Promise<GeometricDataPoint[]> {
    const signal: FeedbackSignal = {
      id: this.generateSignalId(),
      loopId: 'query_feedback',
      data: { event: 'query', query, depth },
      timestamp: Date.now(),
      priority: 8,
      propagationPath: [],
      transformations: []
    };
    
    // Propagate query signal through feedback network
    const results = await this.propagateQuerySignal(signal, depth);
    
    return results;
  }

  /**
   * Create feedback loop between processing nodes
   */
  createFeedbackLoop(
    source: string,
    target: string,
    type: 'processing' | 'optimization' | 'communication' | 'reorganization',
    strength: number = 1.0
  ): string {
    const loopId = this.generateLoopId();
    
    const loop: FeedbackLoop = {
      id: loopId,
      type,
      source,
      target,
      strength,
      frequency: this.calculateOptimalFrequency(type),
      lastExecution: 0,
      totalExecutions: 0,
      averageLatency: 0,
      active: true
    };
    
    this.feedbackLoops.set(loopId, loop);
    
    // Update processing nodes
    const sourceNode = this.processingNodes.get(source);
    const targetNode = this.processingNodes.get(target);
    
    if (sourceNode) sourceNode.connectedLoops.push(loopId);
    if (targetNode) targetNode.connectedLoops.push(loopId);
    
    console.log(`🔗 Created ${type} feedback loop: ${source} -> ${target}`);
    return loopId;
  }

  /**
   * Propagate signal through feedback network
   */
  private propagateSignal(signal: FeedbackSignal): void {
    this.activeSignals.set(signal.id, signal);
    
    // Find relevant feedback loops
    const relevantLoops = this.findRelevantLoops(signal);
    
    for (const loop of relevantLoops) {
      if (loop.active && this.shouldExecuteLoop(loop)) {
        this.executeLoop(loop, signal);
      }
    }
    
    // Clean up processed signal
    setTimeout(() => {
      this.activeSignals.delete(signal.id);
    }, 1000);
  }

  /**
   * Propagate query signal and collect results
   */
  private async propagateQuerySignal(signal: FeedbackSignal, depth: number): Promise<GeometricDataPoint[]> {
    const results: GeometricDataPoint[] = [];
    const visitedNodes = new Set<string>();
    
    await this.recursiveQueryPropagation(signal, depth, visitedNodes, results);
    
    return results;
  }

  /**
   * Recursive query propagation through feedback network
   */
  private async recursiveQueryPropagation(
    signal: FeedbackSignal,
    remainingDepth: number,
    visitedNodes: Set<string>,
    results: GeometricDataPoint[]
  ): Promise<void> {
    if (remainingDepth <= 0) return;
    
    const currentNode = signal.propagationPath[signal.propagationPath.length - 1];
    if (visitedNodes.has(currentNode)) return;
    
    visitedNodes.add(currentNode);
    
    // Process current node
    const nodeResults = await this.processNodeQuery(currentNode, signal.data.query);
    results.push(...nodeResults);
    
    // Find connected nodes through feedback loops
    const connectedNodes = this.getConnectedNodes(currentNode);
    
    for (const connectedNode of connectedNodes) {
      if (!visitedNodes.has(connectedNode)) {
        const newSignal: FeedbackSignal = {
          ...signal,
          id: this.generateSignalId(),
          propagationPath: [...signal.propagationPath, connectedNode]
        };
        
        await this.recursiveQueryPropagation(newSignal, remainingDepth - 1, visitedNodes, results);
      }
    }
  }

  /**
   * Process query at specific node
   */
  private async processNodeQuery(nodeId: string, query: GeometricQuery): Promise<GeometricDataPoint[]> {
    const results: GeometricDataPoint[] = [];
    
    // Check if node has relevant data
    const triangleState = this.triangleStates.get(nodeId);
    if (triangleState && triangleState.data) {
      // Simple matching logic - in a full implementation this would be more sophisticated
      if (this.matchesQuery(triangleState.data, query)) {
        results.push({
          id: triangleState.dataId,
          position: new THREE.Vector4(0, 0, 0, 0), // Would be actual position
          data: triangleState.data,
          triangleAddress: nodeId,
          polyhedronType: 'tetrahedron', // Would be actual type
          relationships: [],
          timestamp: Date.now()
        });
      }
    }
    
    return results;
  }

  /**
   * Check if data matches query criteria
   */
  private matchesQuery(data: any, query: GeometricQuery): boolean {
    // Simplified matching logic
    if (query.type === 'spatial') {
      return true; // Would check spatial bounds
    }
    if (query.type === 'temporal') {
      return true; // Would check temporal range
    }
    return false;
  }

  /**
   * Execute feedback loop
   */
  private executeLoop(loop: FeedbackLoop, signal: FeedbackSignal): void {
    const startTime = performance.now();
    
    switch (loop.type) {
      case 'processing':
        this.executeProcessingLoop(loop, signal);
        break;
      case 'optimization':
        this.executeOptimizationLoop(loop, signal);
        break;
      case 'communication':
        this.executeCommunicationLoop(loop, signal);
        break;
      case 'reorganization':
        this.executeReorganizationLoop(loop, signal);
        break;
    }
    
    // Update loop statistics
    const executionTime = performance.now() - startTime;
    loop.lastExecution = Date.now();
    loop.totalExecutions++;
    loop.averageLatency = (loop.averageLatency * (loop.totalExecutions - 1) + executionTime) / loop.totalExecutions;
  }

  /**
   * Execute processing feedback loop
   */
  private executeProcessingLoop(loop: FeedbackLoop, signal: FeedbackSignal): void {
    const sourceNode = this.processingNodes.get(loop.source);
    const targetNode = this.processingNodes.get(loop.target);
    
    if (sourceNode && targetNode) {
      // Transfer processing load if source is overloaded
      if (sourceNode.currentLoad > sourceNode.processingCapacity * 0.8) {
        const transferAmount = Math.min(
          sourceNode.currentLoad * 0.2,
          targetNode.processingCapacity - targetNode.currentLoad
        );
        
        sourceNode.currentLoad -= transferAmount;
        targetNode.currentLoad += transferAmount;
        
        console.log(`⚡ Processing load transferred: ${loop.source} -> ${loop.target} (${transferAmount.toFixed(2)})`);
      }
    }
  }

  /**
   * Execute optimization feedback loop
   */
  private executeOptimizationLoop(loop: FeedbackLoop, signal: FeedbackSignal): void {
    // Optimize lattice structure based on access patterns
    const sourceState = this.triangleStates.get(loop.source);
    const targetState = this.triangleStates.get(loop.target);
    
    if (sourceState && targetState) {
      // Balance temperature (activity levels)
      const avgTemperature = (sourceState.temperature + targetState.temperature) / 2;
      sourceState.temperature = avgTemperature;
      targetState.temperature = avgTemperature;
    }
  }

  /**
   * Execute communication feedback loop
   */
  private executeCommunicationLoop(loop: FeedbackLoop, signal: FeedbackSignal): void {
    // Facilitate triangle-to-triangle communication
    const sourceNode = this.processingNodes.get(loop.source);
    const targetNode = this.processingNodes.get(loop.target);
    
    if (sourceNode && targetNode) {
      // Update last activity timestamps
      sourceNode.lastActivity = Date.now();
      targetNode.lastActivity = Date.now();
      
      // Propagate signal to target
      if (!signal.propagationPath.includes(loop.target)) {
        signal.propagationPath.push(loop.target);
      }
    }
  }

  /**
   * Execute reorganization feedback loop
   */
  private executeReorganizationLoop(loop: FeedbackLoop, signal: FeedbackSignal): void {
    const now = Date.now();
    
    // Check reorganization cooldown
    if (now - this.lastReorganization < this.REORGANIZATION_COOLDOWN) {
      return;
    }
    
    // Trigger lattice reorganization
    this.reorganizeLattice();
    this.lastReorganization = now;
  }

  /**
   * Reorganize lattice for optimal performance
   */
  private reorganizeLattice(): void {
    console.log('🔄 Reorganizing lattice structure...');
    
    // Analyze access patterns
    const accessPatterns = this.analyzeAccessPatterns();
    
    // Reorganize high-activity triangles for better locality
    this.optimizeTriangleLocality(accessPatterns);
    
    // Update optimization metrics
    this.updateOptimizationMetrics();
    
    console.log('✅ Lattice reorganization complete');
  }

  /**
   * Analyze triangle access patterns
   */
  private analyzeAccessPatterns(): Map<string, number> {
    const patterns = new Map<string, number>();
    
    for (const [triangleId, state] of this.triangleStates) {
      const activity = state.temperature || 0;
      patterns.set(triangleId, activity);
    }
    
    return patterns;
  }

  /**
   * Optimize triangle locality based on access patterns
   */
  private optimizeTriangleLocality(accessPatterns: Map<string, number>): void {
    // Sort triangles by activity level
    const sortedTriangles = Array.from(accessPatterns.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Group high-activity triangles together
    const highActivityTriangles = sortedTriangles.slice(0, Math.floor(sortedTriangles.length * 0.2));
    
    for (const [triangleId] of highActivityTriangles) {
      // Create feedback loops between high-activity triangles
      for (const [otherTriangleId] of highActivityTriangles) {
        if (triangleId !== otherTriangleId) {
          const existingLoop = Array.from(this.feedbackLoops.values())
            .find(loop => loop.source === triangleId && loop.target === otherTriangleId);
          
          if (!existingLoop) {
            this.createFeedbackLoop(triangleId, otherTriangleId, 'communication', 0.8);
          }
        }
      }
    }
  }

  // Helper methods
  
  private initializeDefaultLoops(): void {
    // Default feedback loops will be created when nodes are available
  }

  private createProcessingNode(nodeId: string, type: 'triangle' | 'polyhedron' | 'assembly'): void {
    const node: ProcessingNode = {
      id: nodeId,
      position: new THREE.Vector3(0, 0, 0), // Would be actual position
      type,
      processingCapacity: type === 'triangle' ? 1.0 : type === 'polyhedron' ? 5.0 : 10.0,
      currentLoad: 0,
      connectedLoops: [],
      lastActivity: Date.now()
    };
    
    this.processingNodes.set(nodeId, node);
  }

  private findRelevantLoops(signal: FeedbackSignal): FeedbackLoop[] {
    const relevantLoops: FeedbackLoop[] = [];
    
    for (const loop of this.feedbackLoops.values()) {
      if (signal.propagationPath.includes(loop.source) || signal.propagationPath.includes(loop.target)) {
        relevantLoops.push(loop);
      }
    }
    
    return relevantLoops;
  }

  private shouldExecuteLoop(loop: FeedbackLoop): boolean {
    const timeSinceLastExecution = Date.now() - loop.lastExecution;
    const executionInterval = 1000 / loop.frequency; // Convert frequency to interval
    
    return timeSinceLastExecution >= executionInterval;
  }

  private calculateOptimalFrequency(type: string): number {
    switch (type) {
      case 'processing': return 10; // 10 Hz
      case 'optimization': return 1; // 1 Hz
      case 'communication': return 20; // 20 Hz
      case 'reorganization': return 0.1; // 0.1 Hz (every 10 seconds)
      default: return 1;
    }
  }

  private getConnectedNodes(nodeId: string): string[] {
    const connectedNodes: string[] = [];
    
    for (const loop of this.feedbackLoops.values()) {
      if (loop.source === nodeId && loop.active) {
        connectedNodes.push(loop.target);
      } else if (loop.target === nodeId && loop.active) {
        connectedNodes.push(loop.source);
      }
    }
    
    return connectedNodes;
  }

  private triggerOptimizationIfNeeded(): void {
    if (this.optimizationMetrics.latticeEfficiency < this.OPTIMIZATION_THRESHOLD) {
      this.reorganizeLattice();
    }
  }

  private scheduleGarbageCollection(): void {
    // Schedule garbage collection through reorganization loops
    setTimeout(() => {
      this.reorganizeLattice();
    }, 1000);
  }

  private updateOptimizationMetrics(): void {
    // Calculate lattice efficiency
    const totalNodes = this.processingNodes.size;
    const activeNodes = Array.from(this.processingNodes.values())
      .filter(node => node.currentLoad > 0).length;
    
    this.optimizationMetrics.latticeEfficiency = totalNodes > 0 ? activeNodes / totalNodes : 0;
    
    // Calculate communication latency
    const totalLatency = Array.from(this.feedbackLoops.values())
      .reduce((sum, loop) => sum + loop.averageLatency, 0);
    const activeLoops = Array.from(this.feedbackLoops.values()).filter(loop => loop.active).length;
    
    this.optimizationMetrics.communicationLatency = activeLoops > 0 ? totalLatency / activeLoops : 0;
    
    // Calculate processing throughput
    const totalExecutions = Array.from(this.feedbackLoops.values())
      .reduce((sum, loop) => sum + loop.totalExecutions, 0);
    
    this.optimizationMetrics.processingThroughput = totalExecutions;
    
    // Update other metrics
    this.optimizationMetrics.reorganizationFrequency = 1000 / (Date.now() - this.lastReorganization || 1);
    this.optimizationMetrics.feedbackStability = this.calculateFeedbackStability();
  }

  private calculateFeedbackStability(): number {
    // Calculate stability based on loop execution consistency
    let stabilitySum = 0;
    let loopCount = 0;
    
    for (const loop of this.feedbackLoops.values()) {
      if (loop.totalExecutions > 0) {
        const expectedInterval = 1000 / loop.frequency;
        const actualInterval = loop.averageLatency;
        const stability = Math.max(0, 1 - Math.abs(expectedInterval - actualInterval) / expectedInterval);
        stabilitySum += stability;
        loopCount++;
      }
    }
    
    return loopCount > 0 ? stabilitySum / loopCount : 0;
  }

  // Utility methods
  
  private generateLoopId(): string {
    return `loop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private generateSignalId(): string {
    return `signal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  // Public API methods
  
  getActiveLoops(): FeedbackLoop[] {
    return Array.from(this.feedbackLoops.values()).filter(loop => loop.active);
  }

  getOptimizationMetrics(): OptimizationMetrics {
    return { ...this.optimizationMetrics };
  }

  getProcessingNodes(): ProcessingNode[] {
    return Array.from(this.processingNodes.values());
  }

  getActiveSignals(): FeedbackSignal[] {
    return Array.from(this.activeSignals.values());
  }

  getFeedbackStats(): any {
    return {
      totalLoops: this.feedbackLoops.size,
      activeLoops: this.getActiveLoops().length,
      totalNodes: this.processingNodes.size,
      activeSignals: this.activeSignals.size,
      optimizationMetrics: this.optimizationMetrics,
      averageLoopLatency: Array.from(this.feedbackLoops.values())
        .reduce((sum, loop) => sum + loop.averageLatency, 0) / this.feedbackLoops.size
    };
  }
}
