/**
 * fLups Engine Core - Hexagonal Lattice Implementation
 * 
 * This module implements the core fLups (Feedback Loops) engine based on the
 * hexagonal mirror lattice discovery for maximum efficiency in computational
 * feedback systems.
 * 
 * Core Principles:
 * - Time as Action Rule: Time progression only occurs during action execution
 * - Hexagonal Efficiency: Mirror lattice provides optimal packing and communication paths
 * - φ (Phi) Mapping: Maps triangular patches to icosahedral geometry for 3D projection
 * 
 * @author H3X Development Team & Hexperiment Labs
 * @version 2.0.0
 * @license MIT
 */

// =============================================================================
// DATA STRUCTURES - Core Types for fLups Engine
// =============================================================================

/**
 * Represents a single node in the fLups triangular system
 * Based on the three fundamental node types: flup+, flup-, cflup-n
 */
export interface TriangleNode {
  /** Unique identifier for this node */
  id: string;
  
  /** Node type from the fLups triangle system */
  type: 'flup+' | 'flup-' | 'cflup-n';
  
  /** Current state of the node */
  state: 'transmitting' | 'receiving' | 'processing' | 'idle';
  
  /** 3D position coordinates */
  position: {
    x: number;
    y: number;
    z: number;
  };
  
  /** Energy level of the node (affects action validity) */
  energy: number;
  
  /** Mirror counterpart node ID (for hexagonal pairing) */
  mirrorId?: string;
  
  /** Whether this node is part of the original or mirror triangle */
  isMirror: boolean;
  
  /** Timestamp of last action execution */
  lastActionTime: number;
  
  /** Additional metadata for extensibility */
  metadata: Record<string, any>;
}

/**
 * Represents a triangular patch containing three connected nodes
 * Forms the basic unit of the hexagonal lattice system
 */
export interface TrianglePatch {
  /** Unique identifier for this patch */
  id: string;
  
  /** Array of three node IDs forming the triangle */
  nodeIds: [string, string, string];
  
  /** Whether this is an original triangle or mirror triangle */
  isMirror: boolean;
  
  /** Connected mirror patch ID (for hexagonal lattice completion) */
  mirrorPatchId?: string;
  
  /** Current operational phase (0-300 degrees in 60-degree increments) */
  phase: 0 | 60 | 120 | 180 | 240 | 300;
  
  /** Center point of the triangle */
  center: {
    x: number;
    y: number;
    z: number;
  };
  
  /** Total energy of all nodes in this patch */
  totalEnergy: number;
  
  /** Whether patch is currently active in execution cycle */
  isActive: boolean;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Represents an action event in the fLups system
 * Actions are the fundamental drivers of time progression
 */
export interface ActionEvent {
  /** Unique identifier for this action */
  id: string;
  
  /** Type of action being performed */
  type: 'transmit' | 'process' | 'receive' | 'feedback';
  
  /** Source node ID */
  sourceNodeId: string;
  
  /** Target node ID */
  targetNodeId: string;
  
  /** Energy cost of this action */
  energyCost: number;
  
  /** Duration in virtual time units */
  duration: number;
  
  /** Current status of the action */
  status: 'pending' | 'executing' | 'completed' | 'failed';
  
  /** Timestamp when action was created */
  createdAt: number;
  
  /** Timestamp when action started execution */
  startedAt?: number;
  
  /** Timestamp when action completed */
  completedAt?: number;
  
  /** Error message if action failed */
  error?: string;
  
  /** Action payload data */
  payload: Record<string, any>;
  
  /** Validation rules that must be satisfied */
  validationRules: string[];
}

/**
 * Result of mapping a triangular patch to icosahedral coordinates
 * Enables 3D visualization and geometric transformations
 */
export interface PhiMappingResult {
  /** Original patch ID that was mapped */
  patchId: string;
  
  /** Icosahedral face index (0-19) */
  faceIndex: number;
  
  /** Barycentric coordinates within the icosahedral face */
  barycentricCoords: {
    u: number;
    v: number;
    w: number;
  };
  
  /** 3D coordinates on the icosahedron surface */
  icosahedralCoords: {
    x: number;
    y: number;
    z: number;
  };
  
  /** φ (golden ratio) scaling factor applied */
  phiScale: number;
  
  /** Mapping quality score (0-1) */
  mappingQuality: number;
  
  /** Whether the mapping was successful */
  isValid: boolean;
  
  /** Transformation matrix used for the mapping */
  transformMatrix: number[][];
  
  /** Timestamp of mapping calculation */
  calculatedAt: number;
}

// =============================================================================
// FLUPS ENGINE - Core Implementation Class
// =============================================================================

/**
 * Main fLups Engine class implementing hexagonal lattice feedback loops
 * 
 * This engine manages:
 * - Triangular patches and their mirror counterparts
 * - Action-driven time progression
 * - Energy-based validation
 * - φ-mapping to icosahedral geometry
 * - Comprehensive audit logging
 */
export class fLupsEngine {
  // -------------------------------------------------------------------------
  // PRIVATE PROPERTIES - Internal State Management
  // -------------------------------------------------------------------------
  
  /** Map of all nodes in the system */
  private nodes: Map<string, TriangleNode> = new Map();
  
  /** Map of all triangular patches */
  private patches: Map<string, TrianglePatch> = new Map();
  
  /** Queue of pending actions */
  private actionQueue: ActionEvent[] = [];
  
  /** History of completed actions for audit trail */
  private auditLog: ActionEvent[] = [];
  
  /** Current virtual time (incremented by actions) */
  private virtualTime: number = 0;
  
  /** Global energy threshold for action validation */
  private energyThreshold: number = 0.1;
  
  /** Maximum audit log size (for memory management) */
  private maxAuditLogSize: number = 10000;
  
  /** Golden ratio constant for φ-mapping */
  private readonly PHI = (1 + Math.sqrt(5)) / 2;
  
  /** Configuration settings */
  private config: {
    enableMirrorLattice: boolean;
    enablePhiMapping: boolean;
    debugMode: boolean;
    maxNodes: number;
    maxPatches: number;
  };

  // -------------------------------------------------------------------------
  // CONSTRUCTOR - System Initialization
  // -------------------------------------------------------------------------
  
  /**
   * Initialize the fLups Engine with optional configuration
   * 
   * @param config Optional configuration overrides
   */
  constructor(config: Partial<fLupsEngine['config']> = {}) {
    // Apply default configuration with any overrides
    this.config = {
      enableMirrorLattice: true,
      enablePhiMapping: true,
      debugMode: false,
      maxNodes: 1000,
      maxPatches: 500,
      ...config
    };
    
    // Initialize the audit log
    this.auditLog = [];
    
    // Log engine initialization
    this.log('fLupsEngine initialized', {
      config: this.config,
      timestamp: Date.now()
    });
  }

  // -------------------------------------------------------------------------
  // PUBLIC METHODS - Core Engine Interface
  // -------------------------------------------------------------------------

  /**
   * Retrieve a triangular patch by its ID
   * 
   * @param patchId Unique identifier of the patch
   * @returns The patch object or undefined if not found
   */
  public getPatch(patchId: string): TrianglePatch | undefined {
    const patch = this.patches.get(patchId);
    
    if (this.config.debugMode) {
      this.log('getPatch called', {
        patchId,
        found: !!patch,
        totalPatches: this.patches.size
      });
    }
    
    return patch;
  }

  /**
   * Get the complete audit log of all actions
   * 
   * @param limit Optional limit on number of entries to return
   * @returns Array of action events in chronological order
   */
  public getAuditLog(limit?: number): ActionEvent[] {
    const log = this.auditLog.slice();
    
    if (limit && limit > 0) {
      return log.slice(-limit);
    }
    
    return log;
  }

  /**
   * Check if two nodes are neighbors in the lattice structure
   * 
   * @param nodeId1 First node ID
   * @param nodeId2 Second node ID
   * @returns True if nodes are directly connected
   */
  public areNeighbors(nodeId1: string, nodeId2: string): boolean {
    const node1 = this.nodes.get(nodeId1);
    const node2 = this.nodes.get(nodeId2);
    
    if (!node1 || !node2) {
      return false;
    }
    
    // Find patches containing both nodes
    for (const patch of this.patches.values()) {
      const hasNode1 = patch.nodeIds.includes(nodeId1);
      const hasNode2 = patch.nodeIds.includes(nodeId2);
      
      if (hasNode1 && hasNode2) {
        return true;
      }
    }
    
    // Check mirror connections in hexagonal lattice
    if (this.config.enableMirrorLattice) {
      if (node1.mirrorId === nodeId2 || node2.mirrorId === nodeId1) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validate whether an action can be executed
   * 
   * @param action The action to validate
   * @returns True if action is valid and can be executed
   */
  public isValidAction(action: ActionEvent): boolean {
    // Check if source and target nodes exist
    const sourceNode = this.nodes.get(action.sourceNodeId);
    const targetNode = this.nodes.get(action.targetNodeId);
    
    if (!sourceNode || !targetNode) {
      this.log('Action validation failed: missing nodes', {
        actionId: action.id,
        sourceExists: !!sourceNode,
        targetExists: !!targetNode
      });
      return false;
    }
    
    // Check energy requirements
    if (sourceNode.energy < action.energyCost) {
      this.log('Action validation failed: insufficient energy', {
        actionId: action.id,
        required: action.energyCost,
        available: sourceNode.energy
      });
      return false;
    }
    
    // Check if nodes are neighbors
    if (!this.areNeighbors(action.sourceNodeId, action.targetNodeId)) {
      this.log('Action validation failed: nodes not neighbors', {
        actionId: action.id,
        sourceNodeId: action.sourceNodeId,
        targetNodeId: action.targetNodeId
      });
      return false;
    }
    
    // Validate based on node states and action type
    const isStateValid = this.validateActionByState(action, sourceNode, targetNode);
    
    if (!isStateValid) {
      this.log('Action validation failed: invalid state combination', {
        actionId: action.id,
        actionType: action.type,
        sourceState: sourceNode.state,
        targetState: targetNode.state
      });
      return false;
    }
    
    return true;
  }

  /**
   * Process and execute a single action
   * 
   * @param action The action to process
   * @returns True if action was successfully processed
   */
  public processAction(action: ActionEvent): boolean {
    // Validate the action first
    if (!this.isValidAction(action)) {
      action.status = 'failed';
      action.error = 'Action validation failed';
      this.auditLog.push(action);
      return false;
    }
    
    // Mark action as executing
    action.status = 'executing';
    action.startedAt = Date.now();
    
    try {
      // Execute the action based on its type
      const success = this.executeActionByType(action);
      
      if (success) {
        // Update virtual time
        this.virtualTime += action.duration;
        
        // Mark action as completed
        action.status = 'completed';
        action.completedAt = Date.now();
        
        // Update node timestamps
        const sourceNode = this.nodes.get(action.sourceNodeId);
        if (sourceNode) {
          sourceNode.lastActionTime = this.virtualTime;
        }
        
        this.log('Action processed successfully', {
          actionId: action.id,
          type: action.type,
          virtualTime: this.virtualTime
        });
      } else {
        action.status = 'failed';
        action.error = 'Action execution failed';
      }
      
      // Add to audit log
      this.auditLog.push(action);
      
      // Maintain audit log size
      if (this.auditLog.length > this.maxAuditLogSize) {
        this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
      }
      
      return success;
      
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Unknown error';
      this.auditLog.push(action);
      
      this.log('Action processing error', {
        actionId: action.id,
        error: action.error
      });
      
      return false;
    }
  }

  /**
   * Create a new triangular node in the system
   * 
   * @param type Type of node to create
   * @param position 3D position coordinates
   * @param energy Initial energy level
   * @returns The created node
   */
  public createNode(
    type: 'flup+' | 'flup-' | 'cflup-n',
    position: { x: number; y: number; z: number },
    energy: number = 1.0
  ): TriangleNode {
    if (this.nodes.size >= this.config.maxNodes) {
      throw new Error('Maximum number of nodes reached');
    }
    
    const node: TriangleNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      state: 'idle',
      position,
      energy,
      isMirror: false,
      lastActionTime: 0,
      metadata: {}
    };
    
    this.nodes.set(node.id, node);
    
    this.log('Node created', {
      nodeId: node.id,
      type,
      position,
      energy
    });
    
    return node;
  }

  /**
   * Create a triangular patch from three nodes
   * 
   * @param nodeIds Array of three node IDs
   * @param isMirror Whether this is a mirror patch
   * @returns The created patch
   */
  public createPatch(nodeIds: [string, string, string], isMirror: boolean = false): TrianglePatch {
    if (this.patches.size >= this.config.maxPatches) {
      throw new Error('Maximum number of patches reached');
    }
    
    // Validate that all nodes exist
    const nodes = nodeIds.map(id => this.nodes.get(id));
    if (nodes.some(node => !node)) {
      throw new Error('One or more nodes do not exist');
    }
    
    // Calculate center point
    const validNodes = nodes as TriangleNode[];
    const center = {
      x: validNodes.reduce((sum, node) => sum + node.position.x, 0) / 3,
      y: validNodes.reduce((sum, node) => sum + node.position.y, 0) / 3,
      z: validNodes.reduce((sum, node) => sum + node.position.z, 0) / 3
    };
    
    const patch: TrianglePatch = {
      id: `patch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nodeIds,
      isMirror,
      phase: 0,
      center,
      totalEnergy: validNodes.reduce((sum, node) => sum + node.energy, 0),
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.patches.set(patch.id, patch);
    
    this.log('Patch created', {
      patchId: patch.id,
      nodeIds,
      isMirror,
      center,
      totalEnergy: patch.totalEnergy
    });
    
    return patch;
  }

  /**
   * Create a mirror patch for hexagonal lattice completion
   * 
   * @param originalPatchId ID of the original patch
   * @returns The created mirror patch
   */
  public createMirrorPatch(originalPatchId: string): TrianglePatch | undefined {
    if (!this.config.enableMirrorLattice) {
      this.log('Mirror lattice disabled in configuration');
      return undefined;
    }
    
    const originalPatch = this.patches.get(originalPatchId);
    if (!originalPatch || originalPatch.isMirror) {
      this.log('Original patch not found or is already a mirror', { originalPatchId });
      return undefined;
    }
    
    // Create mirror nodes
    const originalNodes = originalPatch.nodeIds.map(id => this.nodes.get(id)!);
    const mirrorNodes: TriangleNode[] = [];
    
    for (const originalNode of originalNodes) {
      const mirrorPosition = {
        x: -originalNode.position.x, // Mirror across y-axis
        y: originalNode.position.y,
        z: originalNode.position.z
      };
      
      const mirrorNode = this.createNode(originalNode.type, mirrorPosition, originalNode.energy);
      mirrorNode.isMirror = true;
      mirrorNode.mirrorId = originalNode.id;
      originalNode.mirrorId = mirrorNode.id;
      
      mirrorNodes.push(mirrorNode);
    }
    
    // Create mirror patch
    const mirrorPatch = this.createPatch(
      [mirrorNodes[0].id, mirrorNodes[1].id, mirrorNodes[2].id],
      true
    );
    
    // Link patches
    mirrorPatch.mirrorPatchId = originalPatchId;
    originalPatch.mirrorPatchId = mirrorPatch.id;
    originalPatch.updatedAt = Date.now();
    
    this.log('Mirror patch created', {
      originalPatchId,
      mirrorPatchId: mirrorPatch.id,
      mirrorNodeIds: mirrorNodes.map(n => n.id)
    });
    
    return mirrorPatch;
  }

  /**
   * Create and queue a new action
   * 
   * @param type Type of action
   * @param sourceNodeId Source node ID
   * @param targetNodeId Target node ID
   * @param energyCost Energy cost of the action
   * @param payload Additional action data
   * @returns The created action
   */
  public createAction(
    type: 'transmit' | 'process' | 'receive' | 'feedback',
    sourceNodeId: string,
    targetNodeId: string,
    energyCost: number = 0.1,
    payload: Record<string, any> = {}
  ): ActionEvent {
    const action: ActionEvent = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      sourceNodeId,
      targetNodeId,
      energyCost,
      duration: 1, // One virtual time unit
      status: 'pending',
      createdAt: Date.now(),
      payload,
      validationRules: [`energy_threshold_${this.energyThreshold}`]
    };
    
    this.actionQueue.push(action);
    
    this.log('Action created and queued', {
      actionId: action.id,
      type,
      sourceNodeId,
      targetNodeId,
      queueLength: this.actionQueue.length
    });
    
    return action;
  }

  /**
   * Process all pending actions in the queue
   * 
   * @returns Number of successfully processed actions
   */
  public processActionQueue(): number {
    let processedCount = 0;
    
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift()!;
      
      if (this.processAction(action)) {
        processedCount++;
      }
    }
    
    this.log('Action queue processed', {
      processedCount,
      virtualTime: this.virtualTime,
      remainingActions: this.actionQueue.length
    });
    
    return processedCount;
  }

  /**
   * Get current engine statistics
   * 
   * @returns Statistics object
   */
  public getStatistics(): {
    nodeCount: number;
    patchCount: number;
    actionQueueLength: number;
    auditLogLength: number;
    virtualTime: number;
    totalEnergy: number;
  } {
    const totalEnergy = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.energy, 0);
    
    return {
      nodeCount: this.nodes.size,
      patchCount: this.patches.size,
      actionQueueLength: this.actionQueue.length,
      auditLogLength: this.auditLog.length,
      virtualTime: this.virtualTime,
      totalEnergy
    };
  }

  /**
   * Map a triangular patch to icosahedral coordinates using φ-mapping
   * 
   * @param patchId ID of the patch to map
   * @returns Mapping result or undefined if patch not found
   */
  public mapPatchToIcosahedron(patchId: string): PhiMappingResult | undefined {
    const patch = this.patches.get(patchId);
    
    if (!patch) {
      this.log('φ-mapping failed: patch not found', { patchId });
      return undefined;
    }
    
    if (!this.config.enablePhiMapping) {
      this.log('φ-mapping disabled in configuration', { patchId });
      return undefined;
    }
    
    try {
      // Get the three nodes of the patch
      const nodes = patch.nodeIds.map(id => this.nodes.get(id)).filter(Boolean) as TriangleNode[];
      
      if (nodes.length !== 3) {
        throw new Error('Patch does not have exactly 3 valid nodes');
      }
      
      // Calculate icosahedral face index based on patch properties
      const faceIndex = this.calculateIcosahedralFace(patch, nodes);
      
      // Calculate barycentric coordinates
      const barycentricCoords = this.calculateBarycentricCoords(nodes);
      
      // Apply φ-scaling and transformation
      const phiScale = this.PHI * (1 + patch.totalEnergy / 100);
      const icosahedralCoords = this.transformToIcosahedral(
        barycentricCoords,
        faceIndex,
        phiScale
      );
      
      // Create transformation matrix
      const transformMatrix = this.createTransformMatrix(nodes, icosahedralCoords);
      
      // Calculate mapping quality
      const mappingQuality = this.calculateMappingQuality(nodes, icosahedralCoords);
      
      const result: PhiMappingResult = {
        patchId,
        faceIndex,
        barycentricCoords,
        icosahedralCoords,
        phiScale,
        mappingQuality,
        isValid: mappingQuality > 0.5,
        transformMatrix,
        calculatedAt: Date.now()
      };
      
      this.log('φ-mapping completed', {
        patchId,
        faceIndex,
        phiScale,
        mappingQuality,
        isValid: result.isValid
      });
      
      return result;
      
    } catch (error) {
      this.log('φ-mapping error', {
        patchId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        patchId,
        faceIndex: 0,
        barycentricCoords: { u: 0, v: 0, w: 0 },
        icosahedralCoords: { x: 0, y: 0, z: 0 },
        phiScale: 1,
        mappingQuality: 0,
        isValid: false,
        transformMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        calculatedAt: Date.now()
      };
    }
  }

  // -------------------------------------------------------------------------
  // PRIVATE HELPER METHODS - Internal Implementation
  // -------------------------------------------------------------------------

  /**
   * Validate action based on node states
   */
  private validateActionByState(
    action: ActionEvent,
    sourceNode: TriangleNode,
    targetNode: TriangleNode
  ): boolean {
    switch (action.type) {
      case 'transmit':
        return sourceNode.state === 'transmitting' && 
               (targetNode.state === 'receiving' || targetNode.state === 'idle');
      
      case 'process':
        return sourceNode.state === 'processing' && 
               targetNode.state === 'idle';
      
      case 'receive':
        return sourceNode.state === 'receiving' && 
               (targetNode.state === 'transmitting' || targetNode.state === 'processing');
      
      case 'feedback':
        return sourceNode.state === 'processing' && 
               targetNode.state === 'idle';
      
      default:
        return false;
    }
  }

  /**
   * Execute action based on its type
   */
  private executeActionByType(action: ActionEvent): boolean {
    const sourceNode = this.nodes.get(action.sourceNodeId);
    const targetNode = this.nodes.get(action.targetNodeId);
    
    if (!sourceNode || !targetNode) {
      return false;
    }
    
    // Deduct energy cost
    sourceNode.energy -= action.energyCost;
    
    // Update node states based on action type
    switch (action.type) {
      case 'transmit':
        sourceNode.state = 'idle';
        targetNode.state = 'receiving';
        break;
      
      case 'process':
        sourceNode.state = 'processing';
        targetNode.state = 'idle';
        break;
      
      case 'receive':
        sourceNode.state = 'idle';
        targetNode.state = 'processing';
        break;
      
      case 'feedback':
        sourceNode.state = 'idle';
        targetNode.state = 'transmitting';
        break;
      
      default:
        return false;
    }
    
    return true;
  }

  /**
   * Calculate which icosahedral face to map to
   */
  private calculateIcosahedralFace(patch: TrianglePatch, nodes: TriangleNode[]): number {
    // Use patch properties to determine face index (0-19)
    const hashInput = patch.id + nodes.map(n => n.type).join('');
    let hash = 0;
    
    for (let i = 0; i < hashInput.length; i++) {
      hash = ((hash << 5) - hash + hashInput.charCodeAt(i)) & 0xffffffff;
    }
    
    return Math.abs(hash) % 20;
  }

  /**
   * Calculate barycentric coordinates from triangle nodes
   */
  private calculateBarycentricCoords(nodes: TriangleNode[]): { u: number; v: number; w: number } {
    // Simplified barycentric calculation based on energy distribution
    const totalEnergy = nodes.reduce((sum, node) => sum + node.energy, 0);
    
    if (totalEnergy === 0) {
      return { u: 1/3, v: 1/3, w: 1/3 };
    }
    
    return {
      u: nodes[0].energy / totalEnergy,
      v: nodes[1].energy / totalEnergy,
      w: nodes[2].energy / totalEnergy
    };
  }

  /**
   * Transform barycentric coordinates to icosahedral surface
   */
  private transformToIcosahedral(
    coords: { u: number; v: number; w: number },
    faceIndex: number,
    phiScale: number
  ): { x: number; y: number; z: number } {
    // Simplified icosahedral transformation
    // In a full implementation, this would use proper icosahedral geometry
    const angle = (faceIndex * 2 * Math.PI) / 20;
    const radius = phiScale;
    
    return {
      x: radius * Math.cos(angle) * coords.u,
      y: radius * Math.sin(angle) * coords.v,
      z: radius * coords.w
    };
  }

  /**
   * Create transformation matrix for the mapping
   */
  private createTransformMatrix(
    nodes: TriangleNode[],
    icosahedralCoords: { x: number; y: number; z: number }
  ): number[][] {
    // Simplified 3x3 identity matrix for now
    // In a full implementation, this would calculate the actual transformation
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  /**
   * Calculate the quality of the mapping
   */
  private calculateMappingQuality(
    nodes: TriangleNode[],
    icosahedralCoords: { x: number; y: number; z: number }
  ): number {
    // Simplified quality metric based on node energy consistency
    const energies = nodes.map(n => n.energy);
    const meanEnergy = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const variance = energies.reduce((sum, e) => sum + Math.pow(e - meanEnergy, 2), 0) / energies.length;
    
    // Lower variance = higher quality
    return Math.max(0, 1 - variance);
  }

  /**
   * Internal logging method
   */
  private log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[fLupsEngine] ${message}`, data || '');
    }
  }
}

// =============================================================================
// EXPORTS - Public API
// =============================================================================

export default fLupsEngine;