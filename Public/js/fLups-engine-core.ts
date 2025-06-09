/**
 * fLups Engine Core: Foundational Math and Logic Integration
 * 
 * Implements the core fLups system with:
 * - 2D triangular patch (DNA) structure for state encoding and adjacency
 * - Action-driven processing (advance state only on valid agentic actions)
 * - Bijective mapping φ between 2D patches and icosahedral shells
 * - Full audit/event log for traceability and persona attribution
 * 
 * @author H3X Development Team & Hexperiment Labs
 * @version 1.0.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Node types in the triangular fLups structure
 */
export type TriangleNodeType = 'flup_plus' | 'flup_minus' | 'cflup_n';

/**
 * Action types that can be performed on the fLups system
 */
export type ActionType = 'transmit' | 'process' | 'receive' | 'reflect' | 'validate';

/**
 * State of a triangle node
 */
export interface TriangleNodeState {
  /** Current energy level (0.0 to 1.0) */
  energy: number;
  /** Phase information for quantum-like behavior */
  phase: number;
  /** Active status */
  active: boolean;
  /** Last update timestamp */
  lastUpdate: number;
}

/**
 * Individual node in the triangular fLups structure
 * Each node knows its position, state, and neighbors
 */
export interface TriangleNode {
  /** Unique identifier for the node */
  id: string;
  /** Type of the node in the triangle */
  type: TriangleNodeType;
  /** 2D coordinates in the patch space */
  position: { x: number; y: number };
  /** Current state of the node */
  state: TriangleNodeState;
  /** IDs of neighboring nodes */
  neighbors: string[];
  /** Parent patch ID this node belongs to */
  patchId: string;
  /** Creation timestamp */
  created: number;
}

/**
 * Triangular patch structure representing the fundamental fLups DNA
 * Contains three nodes arranged in a triangle with adjacency information
 */
export interface TrianglePatch {
  /** Unique identifier for the patch */
  id: string;
  /** The three nodes forming the triangle */
  nodes: {
    flup_plus: TriangleNode;
    flup_minus: TriangleNode;
    cflup_n: TriangleNode;
  };
  /** Adjacent patch IDs (up to 3 for triangle edges) */
  adjacentPatches: string[];
  /** Center point of the triangle */
  center: { x: number; y: number };
  /** Icosahedral shell mapping information */
  icosahedralMapping?: {
    shellLevel: number;
    faceIndex: number;
    localCoordinates: { u: number; v: number };
  };
  /** Creation timestamp */
  created: number;
  /** Last modification timestamp */
  lastModified: number;
}

/**
 * Action event in the fLups system
 * Represents atomic operations that advance time and change state
 */
export interface ActionEvent {
  /** Unique identifier for the action */
  id: string;
  /** Type of action being performed */
  type: ActionType;
  /** Timestamp when action was initiated */
  timestamp: number;
  /** ID of the patch where action occurs */
  patchId: string;
  /** Source node ID (if applicable) */
  sourceNodeId?: string;
  /** Target node ID (if applicable) */
  targetNodeId?: string;
  /** Action payload/parameters */
  payload: Record<string, any>;
  /** Whether action was successfully executed */
  executed: boolean;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Result of the action */
  result?: Record<string, any>;
  /** Error message if action failed */
  error?: string;
  /** Persona/agent that initiated the action */
  persona?: string;
}

/**
 * Audit log entry for traceability
 */
export interface AuditLogEntry {
  /** Unique identifier for the log entry */
  id: string;
  /** Timestamp of the event */
  timestamp: number;
  /** Type of event */
  eventType: 'action' | 'state_change' | 'patch_creation' | 'mapping' | 'validation';
  /** Associated action ID (if applicable) */
  actionId?: string;
  /** Patch ID involved */
  patchId?: string;
  /** Node ID involved (if applicable) */
  nodeId?: string;
  /** Human-readable description */
  description: string;
  /** Detailed data */
  data: Record<string, any>;
  /** Persona/agent attribution */
  persona?: string;
}

// ============================================================================
// CORE ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Core fLups Engine: Manages triangular patches, action processing, and mapping
 * 
 * This engine implements the foundational logic for:
 * - Creating and managing 2D triangular patches
 * - Processing actions that advance time only when valid
 * - Maintaining adjacency relationships between patches
 * - Mapping between 2D patches and icosahedral shells
 * - Providing full audit trails for all operations
 */
export class fLupsEngine {
  private patches: { [key: string]: TrianglePatch } = {};
  private actionQueue: ActionEvent[] = [];
  private actionLog: ActionEvent[] = [];
  private auditLog: AuditLogEntry[] = [];
  private virtualTime: number = 0;
  private lastProcessedAction: number = 0;

  constructor() {
    this.logAuditEvent('action', {
      eventType: 'action',
      description: 'fLups Engine initialized',
      data: { virtualTime: this.virtualTime }
    });
  }

  // ========================================================================
  // PATCH MANAGEMENT
  // ========================================================================

  /**
   * Creates a new triangular patch with three nodes
   * @param position Center position for the patch
   * @param options Optional configuration for the patch
   * @returns The created TrianglePatch
   */
  public createPatch(
    position: { x: number; y: number },
    options: { 
      id?: string;
      initialEnergy?: number;
      persona?: string;
    } = {}
  ): TrianglePatch {
    const patchId = options.id || `patch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const initialEnergy = options.initialEnergy || 0.5;

    // Calculate node positions for equilateral triangle
    const nodeRadius = 1.0;
    const angles = [Math.PI / 2, Math.PI / 2 + 2 * Math.PI / 3, Math.PI / 2 + 4 * Math.PI / 3];
    
    const nodes: TriangleNode[] = [
      {
        id: `${patchId}_flup_plus`,
        type: 'flup_plus',
        position: {
          x: position.x + nodeRadius * Math.cos(angles[0]),
          y: position.y + nodeRadius * Math.sin(angles[0])
        },
        state: {
          energy: initialEnergy,
          phase: 0,
          active: true,
          lastUpdate: now
        },
        neighbors: [`${patchId}_flup_minus`, `${patchId}_cflup_n`],
        patchId,
        created: now
      },
      {
        id: `${patchId}_flup_minus`,
        type: 'flup_minus',
        position: {
          x: position.x + nodeRadius * Math.cos(angles[1]),
          y: position.y + nodeRadius * Math.sin(angles[1])
        },
        state: {
          energy: initialEnergy,
          phase: 2 * Math.PI / 3,
          active: true,
          lastUpdate: now
        },
        neighbors: [`${patchId}_flup_plus`, `${patchId}_cflup_n`],
        patchId,
        created: now
      },
      {
        id: `${patchId}_cflup_n`,
        type: 'cflup_n',
        position: {
          x: position.x + nodeRadius * Math.cos(angles[2]),
          y: position.y + nodeRadius * Math.sin(angles[2])
        },
        state: {
          energy: initialEnergy,
          phase: 4 * Math.PI / 3,
          active: true,
          lastUpdate: now
        },
        neighbors: [`${patchId}_flup_plus`, `${patchId}_flup_minus`],
        patchId,
        created: now
      }
    ];

    const patch: TrianglePatch = {
      id: patchId,
      nodes: {
        flup_plus: nodes[0],
        flup_minus: nodes[1],
        cflup_n: nodes[2]
      },
      adjacentPatches: [],
      center: position,
      created: now,
      lastModified: now
    };

    this.patches[patchId] = patch;

    this.logAuditEvent('patch_creation', {
      eventType: 'patch_creation',
      description: `Created triangular patch at (${position.x}, ${position.y})`,
      patchId,
      data: {
        position,
        nodeCount: 3,
        initialEnergy
      },
      persona: options.persona
    });

    return patch;
  }

  /**
   * Retrieves a patch by ID
   * @param patchId The patch identifier
   * @returns The patch if found, undefined otherwise
   */
  public getPatch(patchId: string): TrianglePatch | undefined {
    return this.patches[patchId];
  }

  /**
   * Gets all patches currently in the system
   * @returns Array of all patches
   */
  public getAllPatches(): TrianglePatch[] {
    const patches: TrianglePatch[] = [];
    for (const key in this.patches) {
      if (this.patches.hasOwnProperty(key)) {
        patches.push(this.patches[key]);
      }
    }
    return patches;
  }

  /**
   * Establishes adjacency between two patches
   * @param patchId1 First patch ID
   * @param patchId2 Second patch ID
   * @returns Success status
   */
  public establishAdjacency(patchId1: string, patchId2: string): boolean {
    const patch1 = this.patches[patchId1];
    const patch2 = this.patches[patchId2];

    if (!patch1 || !patch2) {
      return false;
    }

    // Add adjacency if not already present
    if (patch1.adjacentPatches.indexOf(patchId2) === -1) {
      patch1.adjacentPatches.push(patchId2);
    }
    if (patch2.adjacentPatches.indexOf(patchId1) === -1) {
      patch2.adjacentPatches.push(patchId1);
    }

    patch1.lastModified = Date.now();
    patch2.lastModified = Date.now();

    this.logAuditEvent('state_change', {
      eventType: 'state_change',
      description: `Established adjacency between patches ${patchId1} and ${patchId2}`,
      data: {
        patch1Id: patchId1,
        patch2Id: patchId2,
        adjacencyType: 'bidirectional'
      }
    });

    return true;
  }

  // ========================================================================
  // ACTION PROCESSING
  // ========================================================================

  /**
   * Validates whether an action can be executed
   * @param action The action to validate
   * @returns Validation result with details
   */
  public isValidAction(action: ActionEvent): { valid: boolean; reason?: string } {
    // Check if patch exists
    const patch = this.patches[action.patchId];
    if (!patch) {
      return { valid: false, reason: `Patch ${action.patchId} not found` };
    }

    // Check if source node exists (if specified)
    if (action.sourceNodeId) {
      const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
      const sourceExists = nodes.some(node => node.id === action.sourceNodeId);
      if (!sourceExists) {
        return { valid: false, reason: `Source node ${action.sourceNodeId} not found in patch` };
      }
    }

    // Check if target node exists (if specified)
    if (action.targetNodeId) {
      const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
      const targetExists = nodes.some(node => node.id === action.targetNodeId);
      if (!targetExists) {
        return { valid: false, reason: `Target node ${action.targetNodeId} not found in patch` };
      }
    }

    // Action-specific validation
    switch (action.type) {
      case 'transmit':
        if (!action.sourceNodeId || !action.targetNodeId) {
          return { valid: false, reason: 'Transmit action requires both source and target nodes' };
        }
        break;
      
      case 'process':
        if (!action.sourceNodeId) {
          return { valid: false, reason: 'Process action requires a source node' };
        }
        const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
        let sourceNode: TriangleNode | undefined;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === action.sourceNodeId) {
            sourceNode = nodes[i];
            break;
          }
        }
        if (sourceNode && sourceNode.state.energy < 0.1) {
          return { valid: false, reason: 'Source node has insufficient energy for processing' };
        }
        break;

      case 'receive':
        if (!action.targetNodeId) {
          return { valid: false, reason: 'Receive action requires a target node' };
        }
        break;

      case 'reflect':
        // Reflection actions are generally valid if the patch exists
        break;

      case 'validate':
        // Validation actions are always valid
        break;

      default:
        return { valid: false, reason: `Unknown action type: ${action.type}` };
    }

    return { valid: true };
  }

  /**
   * Processes a single action and advances virtual time
   * Time only advances when a valid action is executed
   * @param action The action to process
   * @returns Execution result
   */
  public processAction(action: ActionEvent): ActionEvent {
    const startTime = performance.now();
    const validation = this.isValidAction(action);

    if (!validation.valid) {
      action.executed = false;
      action.error = validation.reason;
      action.duration = performance.now() - startTime;
      
      this.logAuditEvent('action', {
        eventType: 'action',
        actionId: action.id,
        description: `Action ${action.type} failed validation: ${validation.reason}`,
        patchId: action.patchId,
        data: { action, validationResult: validation }
      });

      return action;
    }

    // Execute the action
    try {
      const result = this.executeAction(action);
      action.executed = true;
      action.result = result;
      action.duration = performance.now() - startTime;

      // Advance virtual time only on successful action execution
      this.virtualTime += action.duration || 1;
      this.lastProcessedAction = Date.now();

      this.actionLog.push(action);

      this.logAuditEvent('action', {
        eventType: 'action',
        actionId: action.id,
        description: `Action ${action.type} executed successfully`,
        patchId: action.patchId,
        nodeId: action.sourceNodeId,
        data: { action, result, virtualTime: this.virtualTime }
      });

    } catch (error) {
      action.executed = false;
      action.error = error instanceof Error ? error.message : 'Unknown execution error';
      action.duration = performance.now() - startTime;

      this.logAuditEvent('action', {
        eventType: 'action',
        actionId: action.id,
        description: `Action ${action.type} execution failed: ${action.error}`,
        patchId: action.patchId,
        data: { action, error }
      });
    }

    return action;
  }

  /**
   * Internal method to execute specific action types
   * @param action The validated action to execute
   * @returns Execution result data
   */
  private executeAction(action: ActionEvent): Record<string, any> {
    const patch = this.patches[action.patchId];
    const result: Record<string, any> = {};

    switch (action.type) {
      case 'transmit': {
        const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
        let sourceNode: TriangleNode | undefined;
        let targetNode: TriangleNode | undefined;
        
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === action.sourceNodeId) {
            sourceNode = nodes[i];
          }
          if (nodes[i].id === action.targetNodeId) {
            targetNode = nodes[i];
          }
        }
        
        if (sourceNode && targetNode) {
          const energyTransfer = action.payload.energy || 0.1;
          sourceNode.state.energy = Math.max(0, sourceNode.state.energy - energyTransfer);
          targetNode.state.energy = Math.min(1, targetNode.state.energy + energyTransfer * 0.9); // 10% loss
          
          sourceNode.state.lastUpdate = Date.now();
          targetNode.state.lastUpdate = Date.now();
          patch.lastModified = Date.now();

          result.energyTransfer = energyTransfer;
          result.sourceEnergyAfter = sourceNode.state.energy;
          result.targetEnergyAfter = targetNode.state.energy;
        }
        break;
      }

      case 'process': {
        const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
        let sourceNode: TriangleNode | undefined;
        
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === action.sourceNodeId) {
            sourceNode = nodes[i];
            break;
          }
        }
        if (sourceNode) {
          const processingCost = 0.05;
          sourceNode.state.energy = Math.max(0, sourceNode.state.energy - processingCost);
          sourceNode.state.phase = (sourceNode.state.phase + Math.PI / 6) % (2 * Math.PI);
          sourceNode.state.lastUpdate = Date.now();
          patch.lastModified = Date.now();

          result.processingCost = processingCost;
          result.newPhase = sourceNode.state.phase;
          result.remainingEnergy = sourceNode.state.energy;
        }
        break;
      }

      case 'receive': {
        const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
        let targetNode: TriangleNode | undefined;
        
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === action.targetNodeId) {
            targetNode = nodes[i];
            break;
          }
        }
        if (targetNode) {
          const energyGain = action.payload.energy || 0.1;
          targetNode.state.energy = Math.min(1, targetNode.state.energy + energyGain);
          targetNode.state.lastUpdate = Date.now();
          patch.lastModified = Date.now();

          result.energyGain = energyGain;
          result.newEnergyLevel = targetNode.state.energy;
        }
        break;
      }

      case 'reflect': {
        // Reflect action swaps the states of two nodes
        const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
        if (nodes.length >= 2) {
          const temp = { ...nodes[0].state };
          nodes[0].state = { ...nodes[1].state };
          nodes[1].state = temp;
          
          nodes[0].state.lastUpdate = Date.now();
          nodes[1].state.lastUpdate = Date.now();
          patch.lastModified = Date.now();

          result.reflectedNodes = [nodes[0].id, nodes[1].id];
        }
        break;
      }

      case 'validate': {
        // Validation action checks system consistency
        const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
        const totalEnergy = nodes.reduce((sum, node) => sum + node.state.energy, 0);
        const averageEnergy = totalEnergy / 3;
        const energyBalance = Math.abs(totalEnergy - 1.5); // Target total energy
        
        result.totalEnergy = totalEnergy;
        result.averageEnergy = averageEnergy;
        result.energyBalance = energyBalance;
        result.isBalanced = energyBalance < 0.1;
        break;
      }
    }

    return result;
  }

  // ========================================================================
  // ICOSAHEDRAL MAPPING
  // ========================================================================

  /**
   * Maps a 2D triangular patch to icosahedral shell coordinates
   * This is a skeleton implementation for the bijective mapping φ
   * @param patchId The patch to map
   * @param shellLevel The icosahedral shell level (0 = center)
   * @returns Mapping result or null if patch not found
   */
  public mapPatchToIcosahedron(
    patchId: string, 
    shellLevel: number = 0
  ): { faceIndex: number; localCoordinates: { u: number; v: number } } | null {
    const patch = this.patches[patchId];
    if (!patch) {
      return null;
    }

    // Skeleton implementation of the bijective mapping φ
    // This would be expanded with full icosahedral geometry
    
    // Simple mapping based on patch center coordinates
    const { x, y } = patch.center;
    
    // Map to icosahedral face (20 faces total)
    const angle = Math.atan2(y, x);
    const radius = Math.sqrt(x * x + y * y);
    
    const faceIndex = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 20) % 20;
    
    // Local coordinates within the triangular face (u, v ∈ [0, 1])
    const u = (radius % 1);
    const v = ((angle + Math.PI) % (Math.PI / 10)) / (Math.PI / 10);
    
    const mapping = {
      faceIndex,
      localCoordinates: { u, v }
    };

    // Store mapping in patch
    patch.icosahedralMapping = {
      shellLevel,
      ...mapping
    };
    patch.lastModified = Date.now();

    this.logAuditEvent('mapping', {
      eventType: 'mapping',
      description: `Mapped patch ${patchId} to icosahedral shell level ${shellLevel}`,
      patchId,
      data: {
        shellLevel,
        mapping,
        patchCenter: patch.center
      }
    });

    return mapping;
  }

  /**
   * Reverse mapping from icosahedral coordinates to 2D patch space
   * @param faceIndex The icosahedral face index
   * @param localCoordinates Local coordinates within the face
   * @param shellLevel The shell level
   * @returns 2D coordinates
   */
  public mapIcosahedronToPatch(
    faceIndex: number,
    localCoordinates: { u: number; v: number },
    shellLevel: number = 0
  ): { x: number; y: number } {
    // Skeleton implementation of reverse mapping
    const angle = (faceIndex / 20) * 2 * Math.PI - Math.PI;
    const radius = localCoordinates.u + shellLevel * 0.5;
    
    return {
      x: radius * Math.cos(angle + localCoordinates.v * Math.PI / 10),
      y: radius * Math.sin(angle + localCoordinates.v * Math.PI / 10)
    };
  }

  // ========================================================================
  // AUDIT AND LOGGING
  // ========================================================================

  /**
   * Internal method to log audit events
   * @param eventType Type of the audit event
   * @param details Event details
   */
  private logAuditEvent(
    eventType: AuditLogEntry['eventType'],
    details: Partial<AuditLogEntry>
  ): void {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventType,
      description: details.description || 'No description provided',
      data: details.data || {},
      ...details
    };

    this.auditLog.push(entry);
  }

  /**
   * Retrieves the complete audit log for traceability
   * @param filter Optional filter criteria
   * @returns Array of audit log entries
   */
  public getAuditLog(filter?: {
    eventType?: AuditLogEntry['eventType'];
    patchId?: string;
    persona?: string;
    fromTimestamp?: number;
    toTimestamp?: number;
  }): AuditLogEntry[] {
    let filtered = this.auditLog;

    if (filter) {
      filtered = filtered.filter(entry => {
        if (filter.eventType && entry.eventType !== filter.eventType) return false;
        if (filter.patchId && entry.patchId !== filter.patchId) return false;
        if (filter.persona && entry.persona !== filter.persona) return false;
        if (filter.fromTimestamp && entry.timestamp < filter.fromTimestamp) return false;
        if (filter.toTimestamp && entry.timestamp > filter.toTimestamp) return false;
        return true;
      });
    }

    return filtered;
  }

  /**
   * Gets the action execution log
   * @returns Array of executed actions
   */
  public getActionLog(): ActionEvent[] {
    return [...this.actionLog];
  }

  /**
   * Gets current virtual time (advances only on valid actions)
   * @returns Current virtual time
   */
  public getVirtualTime(): number {
    return this.virtualTime;
  }

  /**
   * Gets system statistics
   * @returns System statistics object
   */
  public getSystemStats(): {
    patchCount: number;
    totalNodes: number;
    actionsExecuted: number;
    virtualTime: number;
    lastActivity: number;
    averageEnergy: number;
  } {
    const patches: TrianglePatch[] = [];
    for (const key in this.patches) {
      if (this.patches.hasOwnProperty(key)) {
        patches.push(this.patches[key]);
      }
    }
    const totalNodes = patches.length * 3;
    let totalEnergy = 0;
    
    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i];
      const nodes = [patch.nodes.flup_plus, patch.nodes.flup_minus, patch.nodes.cflup_n];
      for (let j = 0; j < nodes.length; j++) {
        totalEnergy += nodes[j].state.energy;
      }
    }

    return {
      patchCount: patches.length,
      totalNodes,
      actionsExecuted: this.actionLog.length,
      virtualTime: this.virtualTime,
      lastActivity: this.lastProcessedAction,
      averageEnergy: totalNodes > 0 ? totalEnergy / totalNodes : 0
    };
  }
}

// ============================================================================
// MINIMAL TEST HARNESS
// ============================================================================

/**
 * Minimal test harness and demonstration of the fLups engine
 * This can be expanded into a full test suite
 */
export class fLupsEngineTest {
  private engine: fLupsEngine;

  constructor() {
    this.engine = new fLupsEngine();
  }

  /**
   * Runs all basic tests
   * @returns Test results
   */
  public runAllTests(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> } {
    const tests = [
      () => this.testPatchCreation(),
      () => this.testActionValidation(),
      () => this.testActionExecution(),
      () => this.testAdjacencyManagement(),
      () => this.testIcosahedralMapping(),
      () => this.testAuditLogging(),
      () => this.testVirtualTime()
    ];

    const results: Array<{ test: string; passed: boolean; error?: string }> = [];
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = test();
        results.push(result);
        if (result.passed) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        const errorResult = {
          test: 'Unknown test',
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(errorResult);
        failed++;
      }
    }

    return { passed, failed, results };
  }

  private testPatchCreation(): { test: string; passed: boolean; error?: string } {
    const patch = this.engine.createPatch({ x: 0, y: 0 }, { persona: 'test-harness' });
    
    const passed = patch && 
      patch.nodes.flup_plus && 
      patch.nodes.flup_minus && 
      patch.nodes.cflup_n &&
      patch.nodes.flup_plus.neighbors.length === 2;

    return {
      test: 'Patch Creation',
      passed: !!passed,
      error: passed ? undefined : 'Failed to create valid patch with proper node structure'
    };
  }

  private testActionValidation(): { test: string; passed: boolean; error?: string } {
    const patch = this.engine.createPatch({ x: 1, y: 1 });
    
    const validAction: ActionEvent = {
      id: 'test_action_1',
      type: 'process',
      timestamp: Date.now(),
      patchId: patch.id,
      sourceNodeId: patch.nodes.flup_plus.id,
      payload: {},
      executed: false
    };

    const invalidAction: ActionEvent = {
      id: 'test_action_2',
      type: 'transmit',
      timestamp: Date.now(),
      patchId: 'nonexistent_patch',
      payload: {},
      executed: false
    };

    const validResult = this.engine.isValidAction(validAction);
    const invalidResult = this.engine.isValidAction(invalidAction);

    return {
      test: 'Action Validation',
      passed: validResult.valid && !invalidResult.valid,
      error: (!validResult.valid || invalidResult.valid) ? 'Action validation logic incorrect' : undefined
    };
  }

  private testActionExecution(): { test: string; passed: boolean; error?: string } {
    const patch = this.engine.createPatch({ x: 2, y: 2 });
    const initialTime = this.engine.getVirtualTime();
    
    const action: ActionEvent = {
      id: 'test_execution',
      type: 'process',
      timestamp: Date.now(),
      patchId: patch.id,
      sourceNodeId: patch.nodes.flup_plus.id,
      payload: {},
      executed: false
    };

    const result = this.engine.processAction(action);
    const finalTime = this.engine.getVirtualTime();

    return {
      test: 'Action Execution',
      passed: result.executed && finalTime > initialTime,
      error: (!result.executed || finalTime <= initialTime) ? 'Action execution or time advancement failed' : undefined
    };
  }

  private testAdjacencyManagement(): { test: string; passed: boolean; error?: string } {
    const patch1 = this.engine.createPatch({ x: 0, y: 0 });
    const patch2 = this.engine.createPatch({ x: 2, y: 0 });
    
    const success = this.engine.establishAdjacency(patch1.id, patch2.id);
    const updatedPatch1 = this.engine.getPatch(patch1.id);
    
    return {
      test: 'Adjacency Management',
      passed: success && updatedPatch1!.adjacentPatches.indexOf(patch2.id) !== -1,
      error: (!success || updatedPatch1!.adjacentPatches.indexOf(patch2.id) === -1) ? 'Adjacency establishment failed' : undefined
    };
  }

  private testIcosahedralMapping(): { test: string; passed: boolean; error?: string } {
    const patch = this.engine.createPatch({ x: 1, y: 1 });
    const mapping = this.engine.mapPatchToIcosahedron(patch.id, 0);
    
    const passed = mapping && 
      typeof mapping.faceIndex === 'number' &&
      mapping.faceIndex >= 0 &&
      mapping.faceIndex < 20 &&
      mapping.localCoordinates.u >= 0 &&
      mapping.localCoordinates.u <= 1;

    return {
      test: 'Icosahedral Mapping',
      passed: !!passed,
      error: passed ? undefined : 'Icosahedral mapping failed or returned invalid coordinates'
    };
  }

  private testAuditLogging(): { test: string; passed: boolean; error?: string } {
    const initialLogCount = this.engine.getAuditLog().length;
    this.engine.createPatch({ x: 5, y: 5 }, { persona: 'audit-test' });
    const finalLogCount = this.engine.getAuditLog().length;
    
    const auditEntries = this.engine.getAuditLog({ persona: 'audit-test' });

    return {
      test: 'Audit Logging',
      passed: finalLogCount > initialLogCount && auditEntries.length > 0,
      error: (finalLogCount <= initialLogCount || auditEntries.length === 0) ? 'Audit logging not working properly' : undefined
    };
  }

  private testVirtualTime(): { test: string; passed: boolean; error?: string } {
    const initialTime = this.engine.getVirtualTime();
    
    // Create invalid action (should not advance time)
    const invalidAction: ActionEvent = {
      id: 'invalid_time_test',
      type: 'transmit',
      timestamp: Date.now(),
      patchId: 'nonexistent',
      payload: {},
      executed: false
    };
    
    this.engine.processAction(invalidAction);
    const timeAfterInvalid = this.engine.getVirtualTime();
    
    // Create valid action (should advance time)
    const patch = this.engine.createPatch({ x: 10, y: 10 });
    const validAction: ActionEvent = {
      id: 'valid_time_test',
      type: 'validate',
      timestamp: Date.now(),
      patchId: patch.id,
      payload: {},
      executed: false
    };
    
    this.engine.processAction(validAction);
    const timeAfterValid = this.engine.getVirtualTime();

    return {
      test: 'Virtual Time Progression',
      passed: timeAfterInvalid === initialTime && timeAfterValid > timeAfterInvalid,
      error: (timeAfterInvalid !== initialTime || timeAfterValid <= timeAfterInvalid) ? 
        'Virtual time should only advance on valid actions' : undefined
    };
  }
}

// ============================================================================
// EXAMPLE USAGE AND DEMONSTRATION
// ============================================================================

/**
 * Example demonstration of the fLups engine
 * This can be used to test the engine interactively
 */
export function demonstrateFLupsEngine(): void {
  console.log('=== fLups Engine Core Demonstration ===\n');

  // Initialize engine
  const engine = new fLupsEngine();
  console.log('1. Engine initialized');

  // Create some patches
  const patch1 = engine.createPatch({ x: 0, y: 0 }, { persona: 'demo-user' });
  const patch2 = engine.createPatch({ x: 3, y: 0 }, { persona: 'demo-user' });
  console.log(`2. Created patches: ${patch1.id}, ${patch2.id}`);

  // Establish adjacency
  engine.establishAdjacency(patch1.id, patch2.id);
  console.log('3. Established adjacency between patches');

  // Execute some actions
  const actions: ActionEvent[] = [
    {
      id: 'demo_action_1',
      type: 'process',
      timestamp: Date.now(),
      patchId: patch1.id,
      sourceNodeId: patch1.nodes.flup_plus.id,
      payload: {},
      executed: false,
      persona: 'demo-user'
    },
    {
      id: 'demo_action_2',
      type: 'transmit',
      timestamp: Date.now(),
      patchId: patch1.id,
      sourceNodeId: patch1.nodes.flup_plus.id,
      targetNodeId: patch1.nodes.flup_minus.id,
      payload: { energy: 0.2 },
      executed: false,
      persona: 'demo-user'
    }
  ];

  actions.forEach((action, index) => {
    const result = engine.processAction(action);
    console.log(`4.${index + 1}. Executed action ${action.type}: ${result.executed ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });

  // Map patches to icosahedral coordinates
  const mapping1 = engine.mapPatchToIcosahedron(patch1.id, 0);
  const mapping2 = engine.mapPatchToIcosahedron(patch2.id, 1);
  console.log(`5. Mapped patches to icosahedral coordinates:
      Patch1 -> Face ${mapping1?.faceIndex}, Local: (${mapping1?.localCoordinates.u.toFixed(3)}, ${mapping1?.localCoordinates.v.toFixed(3)})
      Patch2 -> Face ${mapping2?.faceIndex}, Local: (${mapping2?.localCoordinates.u.toFixed(3)}, ${mapping2?.localCoordinates.v.toFixed(3)})`);

  // Display system statistics
  const stats = engine.getSystemStats();
  console.log(`6. System Statistics:
      Patches: ${stats.patchCount}
      Nodes: ${stats.totalNodes}
      Actions Executed: ${stats.actionsExecuted}
      Virtual Time: ${stats.virtualTime.toFixed(2)}ms
      Average Energy: ${stats.averageEnergy.toFixed(3)}`);

  // Display audit log summary
  const auditLog = engine.getAuditLog();
  console.log(`7. Audit Log: ${auditLog.length} entries recorded`);
  
  // Run test harness
  console.log('\n=== Running Test Harness ===');
  const testRunner = new fLupsEngineTest();
  const testResults = testRunner.runAllTests();
  console.log(`Tests: ${testResults.passed} passed, ${testResults.failed} failed`);
  
  testResults.results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    console.log(`  ${status} ${result.test}`);
    if (!result.passed && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });

  console.log('\n=== Demonstration Complete ===');
}

// Export main classes and types for use in other modules
export default fLupsEngine;