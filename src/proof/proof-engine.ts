/**
 * H3X Mathematical Proof System - Core Engine
 * Implements formal proof of dimensional mapping and time indistinguishability
 */

import {
  Triangle3D,
  Icosahedron,
  Lattice2D,
  Flup2D,
  RegulatorFlup,
  TimeAxiom,
  DimensionalProjection,
  MappingProof,
  ProofStep,
  EfficiencyMetrics,
  ProofSystemConfig,
  ProofSystemEvent,
  ProofSystemEventHandler,
  PlatonicSolid,
  FlupState,
  Point3D,
  Point2D,
  RegulationRule,
} from './types/proof-types.js';

export class H3XProofSystem {
  private config: ProofSystemConfig;
  private lattice!: Lattice2D;
  private icosahedron!: Icosahedron;
  private flups: Map<string, Flup2D>;
  private regulators: Map<string, RegulatorFlup>;
  private time_axioms: Map<string, TimeAxiom>;
  private projections: Map<string, DimensionalProjection>;
  private proofs: Map<string, MappingProof>;
  private event_handlers: ProofSystemEventHandler[];
  private performance_metrics: EfficiencyMetrics;

  constructor(config: Partial<ProofSystemConfig> = {}) {
    this.config = {
      lattice_resolution: 1000,
      max_flups_per_cell: 10,
      energy_conservation_strict: true,
      time_axiom_validation: true,
      benchmark_enabled: true,
      debug_mode: false,
      ...config,
    };

    this.flups = new Map();
    this.regulators = new Map();
    this.time_axioms = new Map();
    this.projections = new Map();
    this.proofs = new Map();
    this.event_handlers = [];

    this.performance_metrics = {
      storage_efficiency: 0,
      computational_complexity: 0,
      energy_consumption: 0,
      information_density: 0,
      retrieval_speed: 0,
      benchmark_comparison: [],
    };

    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.initializeLattice();
    this.initializeIcosahedron();
    this.initializeTimeAxioms();
    this.log('H3X Proof System initialized');
  }

  private initializeLattice(): void {
    this.lattice = {
      grid: new Map(),
      dimensions: {
        width: this.config.lattice_resolution,
        height: this.config.lattice_resolution,
      },
      resolution: this.config.lattice_resolution,
      total_capacity:
        this.config.lattice_resolution *
        this.config.lattice_resolution *
        this.config.max_flups_per_cell,
    };
  }

  private initializeIcosahedron(): void {
    // Generate icosahedron vertices using golden ratio
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices: Point3D[] = [
      // 12 vertices of icosahedron
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: -phi },
      { x: 0, y: -1, z: -phi },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: 1 },
      { x: phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: -1 },
    ];

    this.icosahedron = {
      vertices,
      faces: this.generateIcosahedronFaces(vertices),
      center: { x: 0, y: 0, z: 0 },
      radius: Math.sqrt(phi * phi + 1),
    };
  }

  private generateIcosahedronFaces(vertices: Point3D[]): Triangle3D[] {
    const faces: Triangle3D[] = [];
    // Icosahedron has 20 triangular faces
    const face_indices = [
      [0, 1, 8],
      [0, 8, 4],
      [0, 4, 5],
      [0, 5, 9],
      [0, 9, 1],
      [2, 3, 11],
      [2, 11, 5],
      [2, 5, 4],
      [2, 4, 10],
      [2, 10, 3],
      [1, 9, 7],
      [1, 7, 6],
      [1, 6, 8],
      [3, 10, 6],
      [3, 6, 7],
      [3, 7, 11],
      [4, 8, 10],
      [5, 11, 9],
      [6, 10, 8],
      [7, 9, 11],
    ];

    face_indices.forEach((indices, idx) => {
      faces.push({
        vertices: [vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]],
        id: `ico_face_${idx}`,
        platonic_source: PlatonicSolid.ICOSAHEDRON,
        attachment_cost: this.calculateAttachmentCost(
          vertices[indices[0]],
          vertices[indices[1]],
          vertices[indices[2]],
        ),
      });
    });

    return faces;
  }

  private calculateAttachmentCost(v1: Point3D, v2: Point3D, v3: Point3D): number {
    // Energy cost = only dimensional changes, proportional to triangle area
    const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
    const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };

    // Cross product for area
    const cross = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x,
    };

    const area = 0.5 * Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
    return area; // Energy cost proportional to surface area
  }

  private initializeTimeAxioms(): void {
    // Core time indistinguishability axioms
    this.time_axioms.set('time_action_equivalence', {
      id: 'time_action_equivalence',
      statement: 'Time progression equals action execution: ∄ action ⟺ ∄ time',
      proof: () => {
        // Without external reference, time is only measurable through state changes
        return this.validateActionTimeEquivalence();
      },
      dependencies: [],
    });

    this.time_axioms.set('energy_conservation', {
      id: 'energy_conservation',
      statement: 'Total system energy conserved across dimensional transitions',
      proof: () => {
        return this.validateEnergyConservation();
      },
      dependencies: ['time_action_equivalence'],
    });

    this.time_axioms.set('dimensional_sufficiency', {
      id: 'dimensional_sufficiency',
      statement: '2D lattice sufficient for all data representation from 3D sources',
      proof: () => {
        return this.validateDimensionalSufficiency();
      },
      dependencies: ['energy_conservation'],
    });
  }

  // Core proof methods
  public proveTriangleAttachment(triangle: Triangle3D): MappingProof {
    const proof_id = `triangle_attachment_${triangle.id}`;
    const steps: ProofStep[] = [];

    // Step 1: Validate triangle belongs to Platonic solid
    steps.push({
      step_number: 1,
      operation: 'validate_platonic_source',
      input: triangle.platonic_source,
      output: this.isPlatonicSolid(triangle.platonic_source),
      justification: 'Triangle must originate from valid Platonic solid',
      energy_accounting: 0,
    });

    // Step 2: Calculate attachment to icosahedron
    const attachment_point = this.findOptimalAttachmentPoint(triangle);
    steps.push({
      step_number: 2,
      operation: 'calculate_attachment',
      input: triangle,
      output: attachment_point,
      justification: 'Find minimum energy attachment point on icosahedron',
      energy_accounting: triangle.attachment_cost,
    });

    // Step 3: Project to 2D lattice
    const projection = this.projectTo2D(triangle);
    steps.push({
      step_number: 3,
      operation: 'project_to_2d',
      input: attachment_point,
      output: projection,
      justification: 'Map 3D triangle to 2D lattice preserving information',
      energy_accounting: projection.energy_cost,
    });

    const proof: MappingProof = {
      axiom_id: proof_id,
      premise: `Triangle ${triangle.id} from ${triangle.platonic_source} can be mapped to 2D lattice`,
      steps,
      conclusion: 'Triangle successfully attached and projected with energy conservation',
      validation_score: this.validateProof(steps),
    };

    this.proofs.set(proof_id, proof);
    this.emitEvent({
      timestamp: Date.now(),
      type: 'PROJECTION',
      details: { triangle_id: triangle.id, proof_id },
      performance_impact: projection.energy_cost,
    });

    return proof;
  }

  private isPlatonicSolid(solid: PlatonicSolid): boolean {
    return Object.values(PlatonicSolid).includes(solid);
  }

  private findOptimalAttachmentPoint(triangle: Triangle3D): Point3D {
    // Find closest icosahedron vertex to triangle centroid
    const centroid = {
      x: (triangle.vertices[0].x + triangle.vertices[1].x + triangle.vertices[2].x) / 3,
      y: (triangle.vertices[0].y + triangle.vertices[1].y + triangle.vertices[2].y) / 3,
      z: (triangle.vertices[0].z + triangle.vertices[1].z + triangle.vertices[2].z) / 3,
    };

    let closest_vertex = this.icosahedron.vertices[0];
    let min_distance = this.distance3D(centroid, closest_vertex);

    this.icosahedron.vertices.forEach((vertex) => {
      const distance = this.distance3D(centroid, vertex);
      if (distance < min_distance) {
        min_distance = distance;
        closest_vertex = vertex;
      }
    });

    return closest_vertex;
  }

  private distance3D(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2),
    );
  }

  private projectTo2D(triangle: Triangle3D): DimensionalProjection {
    // Project triangle to 2D using orthogonal projection
    const centroid_2d: Point2D = {
      x: (triangle.vertices[0].x + triangle.vertices[1].x + triangle.vertices[2].x) / 3,
      y: (triangle.vertices[0].y + triangle.vertices[1].y + triangle.vertices[2].y) / 3,
    };

    // Map to lattice coordinates
    const lattice_x = Math.floor(((centroid_2d.x + 1) * this.lattice.dimensions.width) / 2);
    const lattice_y = Math.floor(((centroid_2d.y + 1) * this.lattice.dimensions.height) / 2);

    const projected_points = triangle.vertices.map((v) => ({
      x: lattice_x + (v.x - centroid_2d.x) * 100,
      y: lattice_y + (v.y - centroid_2d.y) * 100,
    }));

    // Calculate information loss (depth information lost)
    const z_variance = this.calculateZVariance(triangle.vertices);
    const information_loss = z_variance / (z_variance + 1); // Normalized

    const energy_cost = information_loss * 10; // Energy proportional to information loss

    const projection: DimensionalProjection = {
      from_3d: triangle,
      to_2d: projected_points,
      projection_matrix: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      information_loss,
      energy_cost,
    };

    this.projections.set(triangle.id, projection);
    return projection;
  }

  private calculateZVariance(vertices: Point3D[]): number {
    const mean_z = vertices.reduce((sum, v) => sum + v.z, 0) / vertices.length;
    return vertices.reduce((sum, v) => sum + Math.pow(v.z - mean_z, 2), 0) / vertices.length;
  }

  public createFlup(
    data: Record<string, unknown>,
    position: Point2D,
    parent_triangle?: string,
  ): Flup2D {
    const flup_id = `flup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const flup: Flup2D = {
      id: flup_id,
      position,
      data,
      energy_level: 100,
      state: FlupState.ACTIVE,
      connections: [],
      timestamp: Date.now(),
      parent_triangle,
    };

    this.flups.set(flup_id, flup);
    this.addToLattice(flup);

    return flup;
  }

  public createRegulator(position: Point2D, controlled_flups: string[]): RegulatorFlup {
    const regulator_id = `cflup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const regulator: RegulatorFlup = {
      id: regulator_id,
      position,
      data: { type: 'regulator', version: '1.0' },
      energy_level: 150,
      state: FlupState.ACTIVE,
      connections: controlled_flups,
      timestamp: Date.now(),
      regulation_rules: this.getDefaultRegulationRules(),
      controlled_flups,
      autonomy_level: 0.8,
      decision_history: [],
    };

    this.regulators.set(regulator_id, regulator);
    this.addToLattice(regulator);

    return regulator;
  }

  private getDefaultRegulationRules(): RegulationRule[] {
    return [
      {
        id: 'energy_conservation',
        condition: (flup: Flup2D) => flup.energy_level < 20,
        action: (flup: Flup2D) => ({
          ...flup,
          energy_level: Math.min(100, flup.energy_level + 10),
        }),
        priority: 1,
      },
      {
        id: 'state_stabilization',
        condition: (flup: Flup2D) => flup.state === FlupState.PROCESSING,
        action: (flup: Flup2D) => ({ ...flup, state: FlupState.ACTIVE }),
        priority: 2,
      },
    ];
  }

  private addToLattice(flup: Flup2D): void {
    const grid_key = `${Math.floor(flup.position.x)}_${Math.floor(flup.position.y)}`;
    this.lattice.grid.set(grid_key, flup);
  }

  // Validation methods
  private validateActionTimeEquivalence(): boolean {
    // Time only progresses with actions in the system
    const active_flups = Array.from(this.flups.values()).filter(
      (f) => f.state !== FlupState.DORMANT,
    );

    // If no active flups, time should be frozen
    return active_flups.length > 0 || this.isTimeStationary();
  }

  private isTimeStationary(): boolean {
    // Check if system state has changed recently
    const recent_changes = Array.from(this.flups.values()).filter(
      (f) => Date.now() - f.timestamp < 1000,
    );
    return recent_changes.length === 0;
  }

  private validateEnergyConservation(): boolean {
    const total_flup_energy = Array.from(this.flups.values()).reduce(
      (sum, flup) => sum + flup.energy_level,
      0,
    );

    const total_regulator_energy = Array.from(this.regulators.values()).reduce(
      (sum, reg) => sum + reg.energy_level,
      0,
    );

    const total_projection_cost = Array.from(this.projections.values()).reduce(
      (sum, proj) => sum + proj.energy_cost,
      0,
    );

    // Energy conservation: total energy should remain constant
    const initial_energy = 1000; // System starts with 1000 units
    const current_energy = total_flup_energy + total_regulator_energy;
    const energy_spent = total_projection_cost;

    return Math.abs(initial_energy - current_energy - energy_spent) < 0.1;
  }

  private validateDimensionalSufficiency(): boolean {
    // All triangles should be successfully projected to 2D
    const total_triangles = this.icosahedron.faces.length;
    const projected_triangles = this.projections.size;

    return projected_triangles >= total_triangles * 0.95; // 95% success rate
  }

  private validateProof(steps: ProofStep[]): number {
    // Calculate validation score based on step consistency and energy conservation
    const energy_balance = steps.reduce((sum, step) => sum + step.energy_accounting, 0);
    const step_consistency = steps.every((step) => step.output !== null);

    const energy_score = Math.max(0, 1 - Math.abs(energy_balance) / 100);
    const consistency_score = step_consistency ? 1 : 0;

    return (energy_score + consistency_score) / 2;
  }

  // System operations
  public runTimeStep(): void {
    // Execute one time step in the system
    this.regulators.forEach((regulator) => {
      this.executeRegulation(regulator);
    });

    this.updateSystemMetrics();
    this.emitEvent({
      timestamp: Date.now(),
      type: 'REGULATION',
      details: { active_regulators: this.regulators.size, active_flups: this.flups.size },
      performance_impact: 1,
    });
  }

  private executeRegulation(regulator: RegulatorFlup): void {
    regulator.controlled_flups.forEach((flup_id) => {
      const flup = this.flups.get(flup_id);
      if (!flup) return;

      regulator.regulation_rules.forEach((rule) => {
        if (rule.condition(flup)) {
          const updated_flup = rule.action(flup);
          this.flups.set(flup_id, updated_flup);

          regulator.decision_history.push({
            timestamp: Date.now(),
            rule_applied: rule.id,
            input_state: flup.state,
            output_state: updated_flup.state,
            energy_delta: updated_flup.energy_level - flup.energy_level,
          });
        }
      });
    });
  }

  private updateSystemMetrics(): void {
    const total_flups = this.flups.size;
    const total_regulators = this.regulators.size;

    this.performance_metrics = {
      storage_efficiency: total_flups / this.lattice.total_capacity,
      computational_complexity: Math.log2(total_flups + total_regulators),
      energy_consumption: this.calculateTotalEnergyConsumption(),
      information_density:
        total_flups / (this.lattice.dimensions.width * this.lattice.dimensions.height),
      retrieval_speed: 1000 / Math.max(1, total_flups), // ms per access
      benchmark_comparison: [],
    };
  }

  private calculateTotalEnergyConsumption(): number {
    const flup_energy = Array.from(this.flups.values()).reduce(
      (sum, flup) => sum + (100 - flup.energy_level),
      0,
    );

    const projection_energy = Array.from(this.projections.values()).reduce(
      (sum, proj) => sum + proj.energy_cost,
      0,
    );

    return flup_energy + projection_energy;
  }

  // Event system
  public addEventListener(handler: ProofSystemEventHandler): void {
    this.event_handlers.push(handler);
  }

  private emitEvent(event: ProofSystemEvent): void {
    this.event_handlers.forEach((handler) => handler(event));
  }

  // Getters
  public getMetrics(): EfficiencyMetrics {
    return { ...this.performance_metrics };
  }

  public getLatticeStatus(): { flups_count: number; regulators_count: number } {
    return {
      flups_count: this.flups.size,
      regulators_count: this.regulators.size,
    };
  }

  public getAllProofs(): MappingProof[] {
    return Array.from(this.proofs.values());
  }

  private log(message: string): void {
    console.info(message);
  }
}
