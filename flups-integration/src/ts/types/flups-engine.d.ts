/**
 * fLupsEngine Core Type Definitions
 * 
 * This module defines the core TypeScript interfaces required for the fLupsEngine
 * system, implementing triangulated geometric structures with phi mapping and
 * agentic conventions for extensibility.
 * 
 * @author H3X Development Team
 * @version 2.0.0
 * @license MIT
 */

import type { H3XLogEntry } from './h3x.d';

/**
 * Represents a single node in the triangulated structure
 * Following agentic conventions for persona/ego-driven scenarios
 */
export interface TriangleNode {
  /** Unique identifier for the node */
  id: string;
  
  /** 3D coordinates in space */
  position: {
    x: number;
    y: number;
    z: number;
  };
  
  /** Node data payload for agentic processing */
  data?: {
    /** Persona-driven weight factor */
    weight?: number;
    /** Ego-influence metric */
    egoFactor?: number;
    /** Security classification level */
    securityLevel?: 'public' | 'restricted' | 'classified';
    /** Custom agentic properties */
    [key: string]: any;
  };
  
  /** Adjacency list for neighboring nodes */
  neighbors: string[];
  
  /** Timestamp of last modification for audit trails */
  lastModified: Date;
  
  /** Active state for dynamic scenarios */
  active: boolean;
}

/**
 * Represents a triangular patch composed of three nodes
 * Core structural unit for the fLupsEngine system
 */
export interface TrianglePatch {
  /** Unique identifier for the patch */
  id: string;
  
  /** Three node IDs forming the triangle */
  nodeIds: [string, string, string];
  
  /** Geometric properties */
  geometry: {
    /** Surface area of the triangle */
    area: number;
    /** Centroid coordinates */
    centroid: {
      x: number;
      y: number;
      z: number;
    };
    /** Normal vector for surface orientation */
    normal: {
      x: number;
      y: number;
      z: number;
    };
  };
  
  /** Patch metadata for agentic processing */
  metadata: {
    /** Influence weight in the system */
    influence: number;
    /** Stability factor for dynamic adjustments */
    stability: number;
    /** Security access control */
    accessLevel: 'open' | 'limited' | 'secure';
    /** Persona-driven classification */
    personaAffinity?: string[];
  };
  
  /** Adjacency information */
  adjacentPatches: string[];
  
  /** Creation and modification timestamps */
  timestamps: {
    created: Date;
    modified: Date;
  };
  
  /** Validation state */
  valid: boolean;
}

/**
 * Represents an action event in the system
 * Supports audit logging and precision tracking
 */
export interface ActionEvent {
  /** Unique event identifier */
  id: string;
  
  /** Event type classification */
  type: 'create' | 'modify' | 'delete' | 'query' | 'transform' | 'validate';
  
  /** Target entity details */
  target: {
    /** Type of target (node, patch, etc.) */
    entityType: 'node' | 'patch' | 'mapping' | 'system';
    /** Target entity ID */
    entityId: string;
  };
  
  /** Action parameters and payload */
  payload: {
    /** Before state for modifications */
    before?: any;
    /** After state for modifications */
    after?: any;
    /** Additional parameters */
    parameters?: Record<string, any>;
  };
  
  /** Actor information for security and audit */
  actor: {
    /** Actor type (system, user, agent) */
    type: 'system' | 'user' | 'agent' | 'persona';
    /** Actor identifier */
    id: string;
    /** Security context */
    securityContext?: string;
  };
  
  /** Execution context */
  context: {
    /** Execution timestamp */
    timestamp: Date;
    /** Session or transaction ID */
    sessionId?: string;
    /** Source location or system */
    source: string;
    /** Precision level required */
    precisionLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  
  /** Result information */
  result: {
    /** Success status */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Performance metrics */
    performance?: {
      /** Execution time in milliseconds */
      executionTime: number;
      /** Memory usage delta */
      memoryDelta?: number;
    };
  };
  
  /** Audit trail linkage */
  auditTrail: {
    /** Previous related event */
    previousEventId?: string;
    /** Chain of custody information */
    chainOfCustody: string[];
    /** Integrity hash */
    integrityHash: string;
  };
}

/**
 * Result of phi (φ) mapping to icosahedral structure
 * Implements sacred geometry principles for advanced spatial mapping
 */
export interface PhiMappingResult {
  /** Mapping operation identifier */
  mappingId: string;
  
  /** Source triangle patch being mapped */
  sourcePatch: TrianglePatch;
  
  /** Icosahedral mapping coordinates */
  icosahedralCoordinates: {
    /** Face index on the icosahedron (0-19) */
    faceIndex: number;
    /** Barycentric coordinates within the face */
    barycentric: {
      u: number;
      v: number;
      w: number;
    };
    /** 3D position on icosahedron surface */
    surfacePosition: {
      x: number;
      y: number;
      z: number;
    };
  };
  
  /** Phi ratio calculations */
  phiRatios: {
    /** Golden ratio (1.618...) */
    golden: number;
    /** Mapping accuracy to phi */
    accuracy: number;
    /** Harmonic resonance factor */
    harmonics: number[];
  };
  
  /** Transformation matrix used */
  transformation: {
    /** 4x4 transformation matrix (row-major) */
    matrix: number[][];
    /** Determinant for validation */
    determinant: number;
    /** Transformation type */
    type: 'projection' | 'conformal' | 'geodesic';
  };
  
  /** Quality metrics */
  quality: {
    /** Mapping distortion measure */
    distortion: number;
    /** Preservation of angles */
    anglePreservation: number;
    /** Area preservation ratio */
    areaPreservation: number;
    /** Overall quality score (0-1) */
    qualityScore: number;
  };
  
  /** Metadata for advanced scenarios */
  metadata: {
    /** Mapping timestamp */
    timestamp: Date;
    /** Mapping algorithm used */
    algorithm: string;
    /** Computational complexity */
    complexity: 'linear' | 'quadratic' | 'exponential';
    /** Agentic enhancement flags */
    agenticEnhancements: string[];
  };
  
  /** Validation and security */
  validation: {
    /** Mapping is geometrically valid */
    valid: boolean;
    /** Security clearance level */
    clearanceLevel: 'public' | 'restricted' | 'classified';
    /** Integrity verification hash */
    verificationHash: string;
  };
}

/**
 * Configuration interface for fLupsEngine initialization
 * Supports agentic conventions and extensibility
 */
export interface FLupsEngineConfig {
  /** Engine instance identifier */
  instanceId: string;
  
  /** Security configuration */
  security: {
    /** Enable audit logging */
    enableAuditLog: boolean;
    /** Default security level */
    defaultSecurityLevel: 'public' | 'restricted' | 'classified';
    /** Encryption settings */
    encryption: {
      enabled: boolean;
      algorithm?: string;
    };
  };
  
  /** Performance settings */
  performance: {
    /** Maximum nodes to process */
    maxNodes: number;
    /** Cache size limit */
    cacheSize: number;
    /** Precision level for calculations */
    precision: 'single' | 'double' | 'arbitrary';
  };
  
  /** Agentic behavior settings */
  agentic: {
    /** Enable persona-driven processing */
    enablePersonaDriven: boolean;
    /** Ego influence factor range */
    egoInfluenceRange: [number, number];
    /** Dynamic adaptation enabled */
    enableDynamicAdaptation: boolean;
  };
  
  /** Extensibility hooks */
  extensibility: {
    /** Custom plugin loading paths */
    pluginPaths: string[];
    /** Hook registration enabled */
    enableHooks: boolean;
    /** External integrations */
    externalIntegrations: string[];
  };
}

/**
 * Audit log entry specific to fLupsEngine operations
 * Extends H3XLogEntry with engine-specific data
 */
export interface FLupsAuditLogEntry extends H3XLogEntry {
  /** Action event that generated this log entry */
  actionEvent: ActionEvent;
  
  /** System state snapshot */
  systemState: {
    /** Total nodes in system */
    nodeCount: number;
    /** Total patches in system */
    patchCount: number;
    /** Memory usage */
    memoryUsage: number;
    /** Performance metrics */
    performance: {
      averageResponseTime: number;
      throughput: number;
    };
  };
  
  /** Security context */
  securityContext: {
    /** User/agent performing action */
    principal: string;
    /** Security level of operation */
    operationLevel: 'public' | 'restricted' | 'classified';
    /** Access granted/denied */
    accessGranted: boolean;
  };
}