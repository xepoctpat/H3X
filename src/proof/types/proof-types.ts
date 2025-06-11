/**
 * H3X Mathematical Proof System - Type Definitions
 * Core types for dimensional mapping and fLup/cFlup data carriers
 */

// Core geometric types
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Triangle3D {
  vertices: [Point3D, Point3D, Point3D];
  id: string;
  platonic_source: PlatonicSolid;
  attachment_cost: number;
}

export interface Icosahedron {
  vertices: Point3D[];
  faces: Triangle3D[];
  center: Point3D;
  radius: number;
}

export interface Lattice2D {
  grid: Map<string, Flup2D>;
  dimensions: { width: number; height: number };
  resolution: number;
  total_capacity: number;
}

// Platonic solids enumeration
export enum PlatonicSolid {
  TETRAHEDRON = 'tetrahedron',
  CUBE = 'cube',
  OCTAHEDRON = 'octahedron',
  DODECAHEDRON = 'dodecahedron',
  ICOSAHEDRON = 'icosahedron',
}

// fLup data carrier types
export interface Flup2D {
  id: string;
  position: Point2D;
  data: Record<string, unknown>;
  energy_level: number;
  state: FlupState;
  connections: string[];
  timestamp: number;
  parent_triangle?: string;
}

export interface RegulatorFlup extends Flup2D {
  regulation_rules: RegulationRule[];
  controlled_flups: string[];
  autonomy_level: number;
  decision_history: Decision[];
}

export enum FlupState {
  ACTIVE = 'active',
  DORMANT = 'dormant',
  TRANSMITTING = 'transmitting',
  RECEIVING = 'receiving',
  PROCESSING = 'processing',
}

export interface RegulationRule {
  id: string;
  condition: (flup: Flup2D) => boolean;
  action: (flup: Flup2D) => Flup2D;
  priority: number;
}

export interface Decision {
  timestamp: number;
  rule_applied: string;
  input_state: FlupState;
  output_state: FlupState;
  energy_delta: number;
}

// Time indistinguishability types
export interface TimeAxiom {
  id: string;
  statement: string;
  proof: () => boolean;
  dependencies: string[];
}

export interface ActionTime {
  tick: number;
  action: string;
  energy_cost: number;
  state_change: boolean;
}

export interface TimeIndependentState {
  flups: Flup2D[];
  energy_total: number;
  configuration_hash: string;
  equivalence_class: string;
}

// Dimensional mapping types
export interface DimensionalProjection {
  from_3d: Triangle3D;
  to_2d: Point2D[];
  projection_matrix: number[][];
  information_loss: number;
  energy_cost: number;
}

export interface MappingProof {
  axiom_id: string;
  premise: string;
  steps: ProofStep[];
  conclusion: string;
  validation_score: number;
}

export interface ProofStep {
  step_number: number;
  operation: string;
  input: unknown;
  output: unknown;
  justification: string;
  energy_accounting: number;
}

// Efficiency metrics
export interface EfficiencyMetrics {
  storage_efficiency: number;
  computational_complexity: number;
  energy_consumption: number;
  information_density: number;
  retrieval_speed: number;
  benchmark_comparison: BenchmarkResult[];
}

export interface BenchmarkResult {
  system_name: string;
  metric_type: string;
  h3x_value: number;
  traditional_value: number;
  improvement_ratio: number;
  confidence_level: number;
}

// System configuration
export interface ProofSystemConfig {
  lattice_resolution: number;
  max_flups_per_cell: number;
  energy_conservation_strict: boolean;
  time_axiom_validation: boolean;
  benchmark_enabled: boolean;
  debug_mode: boolean;
}

// Events and lifecycle
export interface ProofSystemEvent {
  timestamp: number;
  type: 'PROJECTION' | 'REGULATION' | 'VALIDATION' | 'BENCHMARK';
  details: Record<string, unknown>;
  performance_impact: number;
}

export type ProofSystemEventHandler = (event: ProofSystemEvent) => void;
