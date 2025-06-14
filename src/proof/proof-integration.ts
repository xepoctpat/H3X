/**
 * H3X Mathematical Proof System - Integration with H3X Modular System
 * Connects proof system with existing H3X framework and UI
 */

// Import value modules first, then type imports
import type { H3XSystemStatus } from '../../flups-integration/src/ts/types/h3x.d.ts';

import { H3XBenchmarkFramework } from './benchmark-framework.ts';
import { H3XProofSystem } from './proof-engine.ts';
import { PlatonicSolid } from './types/proof-types.ts';
import type { Point3D, Triangle3D } from './types/proof-types.ts';

/**
 * H3X Proof System Metrics Interface
 */
export interface H3XProofMetrics {
  proof_system: {
    total_proofs: number;
    validation_score: number;
    energy_efficiency: number;
    lattice_utilization: number;
    flup_count: number;
    regulator_count: number;
    benchmark_score: number;
  };
}

/**
 * H3X Proof System Module Class
 */
export class H3XProofSystemModule {
  private proof_system: H3XProofSystem;
  private benchmark_framework: H3XBenchmarkFramework;
  private initialized: boolean = false;
  private last_update: number = 0;
  private metrics_cache: H3XProofMetrics | null = null;

  constructor() {
    this.proof_system = new H3XProofSystem({
      lattice_resolution: 1000,
      max_flups_per_cell: 10,
      energy_conservation_strict: true,
      time_axiom_validation: true,
      benchmark_enabled: true,
      debug_mode: true,
    });

    this.benchmark_framework = new H3XBenchmarkFramework(this.proof_system);
    this.setupEventHandlers();
  }

  /**
   * Initialize the Proof System Module
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.info('[H3X-Proof-Module] Initializing proof system module...');

    try {
      // Create initial test data
      await this.createTestScenario();

      // Run initial benchmark
      if (this.proof_system.getMetrics().benchmark_comparison.length === 0) {
        await this.runQuickBenchmark();
      }

      this.initialized = true;
      console.info('[H3X-Proof-Module] Proof system module initialized successfully');
    } catch (error) {
      console.error('[H3X-Proof-Module] Initialization failed:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    this.proof_system.addEventListener((event) => {
      console.info(`[H3X-Proof-Event] ${event.type}: ${JSON.stringify(event.details)}`);

      // Invalidate metrics cache on significant events
      if (event.type === 'PROJECTION' || event.type === 'REGULATION') {
        this.metrics_cache = null;
      }
    });
  }

  private async createTestScenario(): Promise<void> {
    console.info('[H3X-Proof-Module] Creating test scenario...');

    // Create some test triangles and prove their attachment
    const test_triangles = [
      {
        vertices: [
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
          { x: 0, y: 0, z: 1 },
        ] as [Point3D, Point3D, Point3D],
        id: 'test_triangle_1',
        platonic_source: PlatonicSolid.TETRAHEDRON,
        attachment_cost: 5.2,
      },
      {
        vertices: [
          { x: -1, y: 0, z: 0 },
          { x: 0, y: -1, z: 0 },
          { x: 0, y: 0, z: -1 },
        ] as [Point3D, Point3D, Point3D],
        id: 'test_triangle_2',
        platonic_source: PlatonicSolid.OCTAHEDRON,
        attachment_cost: 4.8,
      },
    ];

    // Prove triangle attachments
    for (const triangle of test_triangles) {
      const proof = this.proof_system.proveTriangleAttachment(triangle);
      console.info(
        `[H3X-Proof-Module] Created proof for ${triangle.id}: validation score ${proof.validation_score.toFixed(3)}`,
      );
    }

    // Create some flups with data
    const test_positions = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 300 },
      { x: 400, y: 400 },
    ];

    const flups = test_positions.map((pos, idx) => {
      return this.proof_system.createFlup(
        {
          type: 'test_data',
          value: Math.random() * 100,
          category: `test_category_${idx % 2}`,
        },
        pos,
        `test_triangle_${(idx % 2) + 1}`,
      );
    });

    // Create a regulator
    this.proof_system.createRegulator(
      { x: 250, y: 250 },
      flups.map((f) => f.id),
    );

    console.info(`[H3X-Proof-Module] Created ${flups.length} flups and 1 regulator`);

    // Run a few time steps
    for (let i = 0; i < 5; i++) {
      this.proof_system.runTimeStep();
    }
  }

  private async runQuickBenchmark(): Promise<void> {
    console.info('[H3X-Proof-Module] Running quick benchmark...');

    try {
      const benchmark_results = await this.benchmark_framework.runComprehensiveBenchmark();
      console.info(`[H3X-Proof-Module] Benchmark completed: ${benchmark_results.size} comparisons`);
    } catch (error) {
      console.warn('[H3X-Proof-Module] Benchmark failed:', error);
    }
  }

  /**
   * Get Proof System Metrics
   */
  public getProofSystemMetrics(): H3XProofMetrics {
    // Use cached metrics if available and recent
    if (this.metrics_cache && Date.now() - this.last_update < 5000) {
      return this.metrics_cache;
    }

    const base_metrics = this.proof_system.getMetrics();
    const lattice_status = this.proof_system.getLatticeStatus();
    const all_proofs = this.proof_system.getAllProofs();

    // Calculate validation score average
    const avg_validation_score =
      all_proofs.length > 0
        ? all_proofs.reduce((sum, proof) => sum + proof.validation_score, 0) / all_proofs.length
        : 0;

    // Calculate benchmark score
    const benchmark_results = this.benchmark_framework.getBenchmarkResults();
    let total_improvement = 0;
    let benchmark_count = 0;

    benchmark_results.forEach((results) => {
      results.forEach((result) => {
        total_improvement += result.improvement_ratio;
        benchmark_count++;
      });
    });

    const avg_benchmark_score = benchmark_count > 0 ? total_improvement / benchmark_count : 1.0;

    this.metrics_cache = {
      proof_system: {
        total_proofs: all_proofs.length,
        validation_score: avg_validation_score,
        energy_efficiency: 1 - base_metrics.energy_consumption / 1000, // Normalized
        lattice_utilization: lattice_status.flups_count / 1000, // Assuming 1000 is max capacity for now
        flup_count: lattice_status.flups_count,
        regulator_count: lattice_status.regulators_count,
        benchmark_score: avg_benchmark_score,
      },
    };

    this.last_update = Date.now();
    return this.metrics_cache;
  }

  /**
   * Create a Proof for a Triangle
   */
  public createTriangleProof(triangle_data: unknown): string {
    try {
      const proof = this.proof_system.proveTriangleAttachment(triangle_data as Triangle3D);
      return `Proof created: ${proof.axiom_id} (validation: ${proof.validation_score.toFixed(3)})`;
    } catch (error) {
      return `Proof creation failed: ${error}`;
    }
  }

  /**
   * Create a Flup with Data
   */
  public createFlupWithData(data: unknown, position: { x: number; y: number }): string {
    try {
      const flup = this.proof_system.createFlup(data as Record<string, unknown>, position);
      return `Flup created: ${flup.id} at (${position.x}, ${position.y})`;
    } catch (error) {
      return `Flup creation failed: ${error}`;
    }
  }

  /**
   * Run a Single Time Step in the Proof System
   */
  public runProofTimeStep(): string {
    try {
      this.proof_system.runTimeStep();
      const metrics = this.getProofSystemMetrics();
      return `Time step executed. Active flups: ${metrics.proof_system.flup_count}, Energy efficiency: ${(metrics.proof_system.energy_efficiency * 100).toFixed(1)}%`;
    } catch (error) {
      return `Time step failed: ${error}`;
    }
  }

  /**
   * Run the Full Benchmark Suite
   */
  public async runFullBenchmark(): Promise<string> {
    try {
      console.info('[H3X-Proof-Module] Starting full benchmark suite...');
      const results = await this.benchmark_framework.runComprehensiveBenchmark();

      console.info('[H3X-Proof-Module] Full benchmark completed');
      return `Benchmark completed: ${results.size} comparisons. Average improvement: ${this.getProofSystemMetrics().proof_system.benchmark_score.toFixed(2)}x`;
    } catch (error) {
      return `Benchmark failed: ${error}`;
    }
  }

  /**
   * Get Lattice Visualization Data
   */
  public getLatticeVisualizationData(): {
    dimensions: { width: number; height: number };
    flup_count: number;
    regulator_count: number;
    energy_efficiency: number;
    information_density: number;
  } {
    const lattice_status = this.proof_system.getLatticeStatus();
    const metrics = this.proof_system.getMetrics();
    return {
      dimensions: {
        width: 1000,
        height: 1000,
      },
      flup_count: lattice_status.flups_count,
      regulator_count: lattice_status.regulators_count,
      energy_efficiency: 1 - metrics.energy_consumption / 1000,
      information_density: metrics.information_density,
    };
  }

  /**
   * Get the Status of the Proof System
   */
  public getProofSystemStatus(): H3XSystemStatus {
    return {
      merger: this.initialized ? 'online' : 'offline',
      ui: 'online',
      logs: 'available',
    };
  }

  /**
   * Export Proof Data for External Analysis
   */
  public exportProofData(): unknown {
    const all_proofs = this.proof_system.getAllProofs();
    const metrics = this.getProofSystemMetrics();
    const lattice_status = this.proof_system.getLatticeStatus();

    return {
      timestamp: Date.now(),
      system_version: '1.0.0',
      proofs: all_proofs,
      metrics: metrics,
      lattice_status: lattice_status,
      benchmark_results: Array.from(this.benchmark_framework.getBenchmarkResults().entries()),
    };
  }

  /**
   * Destroy the Proof System Module
   */
  public destroy(): void {
    this.initialized = false;
    this.metrics_cache = null;
    console.info('[H3X-Proof-Module] Proof system module destroyed');
  }
}

// Integration with existing H3X modular system
export function integrateProofSystem(h3xModular: unknown): void {
  // Augment the modular object with proof and addCommand if not present
  const modular = h3xModular as {
    proof?: H3XProofSystemModule;
    addCommand?: (name: string, fn: (...args: unknown[]) => unknown) => void;
    log: (message: string) => void;
  };
  if (!modular.proof) {
    modular.proof = new H3XProofSystemModule();
    if (typeof modular.addCommand === 'function') {
      modular.addCommand('proof-triangle', (...args: unknown[]) => {
        // Expect args[0] to be Triangle3D
        return modular.proof!.createTriangleProof(args[0] as Triangle3D);
      });
      modular.addCommand('create-flup', (...args: unknown[]) => {
        // Expect args[0]: Record<string, unknown>, args[1]: number, args[2]: number
        return modular.proof!.createFlupWithData(args[0] as Record<string, unknown>, {
          x: args[1] as number,
          y: args[2] as number,
        });
      });
      modular.addCommand('proof-step', () => {
        return modular.proof!.runProofTimeStep();
      });
      modular.addCommand('benchmark', async () => {
        return await modular.proof!.runFullBenchmark();
      });
    }
    // Extend existing log function
    const originalLog = modular.log;
    modular.log = function (message: string) {
      originalLog.call(this, message);
      if (message.includes('[Metrics]')) {
        const proof_metrics = modular.proof!.getProofSystemMetrics();
        originalLog.call(
          this,
          `[Proof-System] Flups: ${proof_metrics.proof_system.flup_count}, ` +
            `Validation: ${(proof_metrics.proof_system.validation_score * 100).toFixed(1)}%, ` +
            `Efficiency: ${(proof_metrics.proof_system.energy_efficiency * 100).toFixed(1)}%`,
        );
      }
    };
    console.info('[H3X-Integration] Proof system integrated with H3X modular system');
  }
}
